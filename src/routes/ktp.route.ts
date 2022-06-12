/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FastifyPluginAsync } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';
import mime from 'mime-types';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

import { bucket } from '../config/cloudStorage';
import { getCorrections } from '../config/natural';
import prisma from '../config/prismaClient';
import {
  ktpOcrSchemaPost,
  ktpSchemaGetAll,
  ktpSchemaGetUnique,
  ktpSchemaPost,
} from '../schema/ktp.schema';

type IQuerystring = {
  nik?: string;
  limit?: number;
  page?: number;
};

type IBody = {
  nama: string;
  nik: string;
  ttl: string;
  jenis_kelamin: string;
  alamat: string;
  rt_rw: string;
  kel_desa: string;
  kecamatan: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  token: string;
  uid: string;
};

type IOCRBody = {
  ktp: {
    data: Buffer;
    filename: string;
    encoding: string;
    mimetype: string;
    limit: true;
  }[];
  uid: string;
};

type IParams = {
  uid: string;
};

export const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: IQuerystring }>(
    '/',
    { schema: ktpSchemaGetAll },
    async (request, reply) => {
      const limit = request.query.limit ?? 10;
      const page = request.query.page ?? 1;

      const data = request.query.nik
        ? await prisma.ktp.findMany({
            where: { nik: request.query.nik },
          })
        : await prisma.ktp.findMany({
            skip: (page - 1) * limit,
            take: limit,
          });

      if (!data) {
        return reply.status(httpStatus.NOT_FOUND).send({
          error: httpStatus[httpStatus.NOT_FOUND],
          statusCode: httpStatus.NOT_FOUND,
          message: 'KTP not found',
        });
      }
      return reply.send({ data });
    }
  );

  fastify.get<{ Params: IParams }>(
    '/:uid',
    { schema: ktpSchemaGetUnique },
    async (request, reply) => {
      const data = await prisma.ktp.findUnique({
        where: { uid: request.params.uid },
      });

      if (!data) {
        return reply.status(httpStatus.NOT_FOUND).send({
          error: httpStatus[httpStatus.NOT_FOUND],
          statusCode: httpStatus.NOT_FOUND,
          message: 'KTP not found',
        });
      }
      return reply.send({ data });
    }
  );

  fastify.post<{ Body: IBody }>(
    '/',
    { schema: ktpSchemaPost },
    async (request, reply) => {
      const { token, ...ktpData } = request.body;

      try {
        const decodedToken = await getAuth().verifyIdToken(token);
        console.log(decodedToken);
      } catch (e) {
        console.error(e);
      }

      const { nik, ttl } = ktpData;

      const date = ttl.split(', ')[1];
      const dateNoDash = date.replaceAll('-', '');
      const dateToCompare =
        dateNoDash.substring(0, 4) + dateNoDash.substring(6, 8);
      const isFemale = +nik.substring(6, 8) >= 40;
      if (
        (isFemale && ktpData.jenis_kelamin !== 'PEREMPUAN') ||
        (!isFemale && ktpData.jenis_kelamin !== 'LAKI-LAKI')
      ) {
        return reply.send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'NIK is not valid!, the gender is not matching',
        });
      }
      const dateFromNik = isFemale
        ? (+nik.substring(6, 8) - 40).toString()
        : nik.substring(6, 8) + nik.substring(8, 12);
      if (dateToCompare !== dateFromNik) {
        console.log(dateNoDash);
        console.log(date);
        console.log(dateFromNik);
        return reply.send({
          statusCode: 400,
          error: 'Bad Request',
          message:
            'NIK is not valid!, the Place and Date of birth is not matching',
        });
      }

      const res = await prisma.kodewilayah.findUnique({
        where: {
          kodewilayah: nik.substring(0, 6),
        },
      });

      if (res === null) {
        return reply.send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'NIK is not valid!',
        });
      }

      const ktpRes = await prisma.ktp.create({ data: ktpData });
      return reply.send({ data: ktpRes });
    }
  );

  fastify.post<{ Body: IOCRBody }>(
    '/ocr',
    { schema: ktpOcrSchemaPost },
    async (request, reply) => {
      const replyBadRequest = (
        message = 'OCR did not read correct data!',
        statusCode = 400,
        error = 'Bad Request'
      ) =>
        reply.send({
          statusCode,
          error,
          message,
        });

      try {
        await getAuth().getUser(request.body.uid);
      } catch (e) {
        console.error(e);
        return replyBadRequest('User does not exist', 404, 'Not Found');
      }

      const { data, mimetype } = request.body.ktp[0];

      const processedImg = sharp(data).resize(1000).greyscale().threshold();

      const ktpImg = await processedImg.toBuffer();

      const {
        data: { text },
      } = await Tesseract.recognize(ktpImg, 'ind', {
        logger: (m) => console.log(m),
      });

      const lines = text.split('\n');

      console.log(lines);

      const [provinsiRaw, ...provinsiWords] = lines[0].split(' ');
      const provinsiSection = getCorrections(provinsiRaw.toLowerCase())[0];

      if (provinsiSection !== 'provinsi') {
        console.log('provinsi ngab');
        return replyBadRequest();
      }

      const provinsi = provinsiWords.join(' ').trim();

      const [nikRaw, ...nikWords] = lines[2].split(' ');
      const nikSection = getCorrections(nikRaw.toLowerCase())[0];

      if (nikSection !== 'nik') {
        console.log('nik ngab');
        return replyBadRequest();
      }

      const nik = nikWords[nikWords.length - 1].trim();

      const [namaRaw, ...namaWords] = lines[3].split(' ');
      const namaSection = getCorrections(namaRaw.toLowerCase())[0];

      if (namaSection !== 'nama') {
        console.log(namaSection);
        return replyBadRequest();
      }

      const nama = namaWords.join(' ').split(':')[1].trim();

      const ttlRaw = lines[4].split(' ')[1];
      const ttlSection = getCorrections(ttlRaw.toLowerCase())[0];

      if (ttlSection !== 'lahir') {
        console.log(ttlSection);
        return replyBadRequest();
      }

      const ttl = lines[4].split(':')[1].trim();

      const jenisKelaminRaw = lines[5].split(' ')[1];
      const jenisKelaminSection = getCorrections(
        jenisKelaminRaw.toLowerCase()
      )[0];

      if (jenisKelaminSection !== 'kelamin') {
        console.log(jenisKelaminSection);
        return replyBadRequest();
      }

      const jenisKelamin = lines[5].split(':')[1].trim().split(' ')[0];

      const alamatRaw = lines[6].split(' ')[0];
      const alamatSection = getCorrections(alamatRaw.toLowerCase())[0];

      if (alamatSection !== 'alamat') {
        console.log(alamatRaw);
        console.log(alamatSection);
        return replyBadRequest();
      }

      const alamat = lines[6].split(':')[1].trim();

      const rtrwRaw = lines[7]
        .split(':')[0]
        .split(' ')
        .join('')
        .replaceAll(/[^a-zA-Z]/, '');
      const rtrwSection = getCorrections(rtrwRaw.toLowerCase())[0];

      if (rtrwSection !== 'rtrw') {
        console.log(rtrwRaw);
        console.log(rtrwSection);
        return replyBadRequest();
      }

      const rtrw = lines[7].split(':')[1].trim();

      const keldesaRaw = lines[8]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const keldesaSection = getCorrections(keldesaRaw.toLowerCase())[0];

      if (keldesaSection !== 'keldesa') {
        console.log(keldesaRaw);
        console.log(keldesaSection);
        return replyBadRequest();
      }

      const keldesa = lines[8].split(':')[1].trim();

      const kecamatanRaw = lines[9]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const kecamatanSection = getCorrections(kecamatanRaw.toLowerCase())[0];

      if (kecamatanSection !== 'kecamatan') {
        console.log(kecamatanRaw);
        console.log(kecamatanSection);
        return replyBadRequest();
      }

      const kecamatan = lines[9].split(':')[1].trim();

      const agamaRaw = lines[10]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const agamaSection = getCorrections(agamaRaw.toLowerCase())[0];

      if (agamaSection !== 'agama') {
        console.log(agamaRaw);
        console.log(agamaSection);
        return replyBadRequest();
      }

      const agama = lines[10].split(':')[1].trim();

      const statusPerkawinanRaw = lines[11]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const statusPerkawinanSection = getCorrections(
        statusPerkawinanRaw.toLowerCase()
      )[0];

      if (statusPerkawinanSection !== 'statusperkawinan') {
        console.log(statusPerkawinanRaw);
        console.log(statusPerkawinanSection);
        return replyBadRequest();
      }

      const statusPerkawinan = lines[11].split(':')[1].trim();

      const pekerjaanRaw = lines[12]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const pekerjaanSection = getCorrections(pekerjaanRaw.toLowerCase())[0];

      if (pekerjaanSection !== 'pekerjaan') {
        console.log(pekerjaanRaw);
        console.log(pekerjaanSection);
        return replyBadRequest();
      }

      const pekerjaan = lines[12].split(':')[1].trim();

      const kewarganegaraanRaw = lines[13]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const kewarganegaraanSection = getCorrections(
        kewarganegaraanRaw.toLowerCase()
      )[0];

      if (kewarganegaraanSection !== 'kewarganegaraan') {
        console.log(kewarganegaraanRaw);
        console.log(kewarganegaraanSection);
        return replyBadRequest();
      }

      const kewarganegaraan = lines[13].split(':')[1].trim().split(' ')[0];

      const file = bucket.file(
        `ktp/${request.body.uid}.${mime.extension(mimetype)}`
      );
      await file.save(data);
      const publicUrl = file.publicUrl();

      return reply.send({
        data: {
          ktp: {
            nik,
            provinsi,
            nama,
            ttl,
            jenisKelamin,
            alamat,
            rtrw,
            keldesa,
            kecamatan,
            agama,
            statusPerkawinan,
            pekerjaan,
            kewarganegaraan,
          },
          publicUrl,
        },
      });
    }
  );
};

export const prefix = '/ktp';
