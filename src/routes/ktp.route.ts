/* eslint-disable @typescript-eslint/no-unused-vars */
import { google } from '@google-cloud/vision/build/protos/protos';
import type { FastifyPluginAsync } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';
import mime from 'mime-types';
import sharp, { Sharp } from 'sharp';
import Tesseract from 'tesseract.js';

import { bucket } from '../config/cloudStorage';
import { textDetectionGcs } from '../config/cloudVision';
import { getCorrections } from '../config/natural';
import prisma from '../config/prismaClient';
import {
  ktpOcrSchemaPost,
  ktpSchemaDelete,
  ktpSchemaGetUnique,
  ktpSchemaPost,
  ktpSchemaPut,
} from '../schema/ktp.schema';
import normalizeCoord from '../utils/normalizeCoord';

export type IQuerystring = {
  nik?: string;
  limit?: number;
  page?: number;
};

export type IBody = {
  nama: string;
  nik: string;
  kota: string;
  provinsi: string;
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
};

type Coordinate = {
  x: number;
  y: number;
};

export type IOCRBody = {
  ktp: {
    data: Buffer;
    filename: string;
    encoding: string;
    mimetype: string;
    limit: true;
  }[];
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
};

export type IHeaders = {
  token: string;
};

export const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaGetUnique },
    async (request, reply) => {
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const data = await prisma.ktp.findUnique({
        where: { uid },
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

  fastify.post<{ Body: IBody; Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaPost },
    async (request, reply) => {
      const ktpData: IBody = request.body;
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

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
        return reply.status(httpStatus.BAD_REQUEST).send({
          statusCode: httpStatus.BAD_REQUEST,
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
        return reply.status(httpStatus.BAD_REQUEST).send({
          statusCode: httpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'NIK is not valid!',
        });
      }

      const ktpRes = await prisma.ktp.upsert({
        where: {
          uid,
        },
        update: ktpData,
        create: { ...ktpData, uid },
      });
      return reply.send({ data: ktpRes });
    }
  );

  fastify.put<{ Body: IBody; Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaPut },
    async (request, reply) => {
      const ktp = request.body;
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const data = await prisma.ktp.update({
        where: { uid },
        data: ktp,
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

  fastify.delete<{ Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaDelete },
    async (request, reply) => {
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const data = await prisma.ktp.delete({
        where: { uid },
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

  fastify.post<{ Body: IOCRBody; Headers: IHeaders }>(
    '/ocr',
    { schema: ktpOcrSchemaPost },
    async (request, reply) => {
      const replyBadRequest = (
        message = 'OCR did not read correct data!',
        statusCode = httpStatus.BAD_REQUEST,
        error = 'Bad Request'
      ) =>
        reply.status(statusCode).send({
          statusCode,
          error,
          message,
        });

      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const { data, mimetype } = request.body.ktp[0];

      const processedImg: Sharp = sharp(data)
        .resize(1000)
        .greyscale()
        .threshold();

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
        .replace(/[^a-zA-Z]/, '');
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

      const file = bucket.file(`ktp/${uid}.${mime.extension(mimetype)}`);
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

  fastify.post<{ Body: IOCRBody; Headers: IHeaders }>(
    '/ocr2',
    { schema: ktpOcrSchemaPost },
    async (request, reply) => {
      const replyBadRequest = (
        message = 'OCR did not read correct data!',
        statusCode = httpStatus.BAD_REQUEST,
        error = 'Bad Request'
      ) =>
        reply.status(statusCode).send({
          statusCode,
          error,
          message,
        });

      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const { data, mimetype } = request.body.ktp[0];

      const { left, top, right, bottom } = request.body;

      const image = sharp(data);
      const metadata = await image.metadata();
      const { width, height } = metadata;

      const processedImg: Sharp =
        left !== undefined &&
        top !== undefined &&
        right !== undefined &&
        bottom !== undefined &&
        width !== undefined &&
        height !== undefined
          ? sharp(data)
              .extract({
                left: Math.min(
                  normalizeCoord(left, 320, width),
                  normalizeCoord(right, 320, width)
                ),
                top: Math.min(
                  normalizeCoord(bottom, 320, height),
                  normalizeCoord(top, 320, height)
                ),
                width: Math.abs(
                  normalizeCoord(right, 320, width) -
                    normalizeCoord(left, 320, width)
                ),
                height: Math.abs(
                  normalizeCoord(bottom, 320, height) -
                    normalizeCoord(top, 320, height)
                ),
              })
              .resize(1000)
          : sharp(data).resize(1000);

      const ktpImg = await processedImg.toBuffer();
      const filename = `ktp/${uid}.${mime.extension(mimetype)}`;
      const file = bucket.file(filename);
      await file.save(ktpImg);
      const publicUrl = file.publicUrl();

      let result: google.cloud.vision.v1.IAnnotateImageResponse;
      try {
        [result] = await textDetectionGcs(filename);
      } catch (e) {
        return replyBadRequest(
          (e as string) ?? 'Could not detect any texts from the image'
        );
      }
      const detections = result.textAnnotations;

      if (!detections?.[0]?.description) {
        return replyBadRequest('Could not detect any texts from the image');
      }

      const lines = detections[0].description.split('\n');

      let i = 0;
      for (; i < lines.length; ++i) {
        if (lines[i].toLowerCase().includes('provinsi')) {
          break;
        }
      }
      lines.splice(0, i);
      const filterRegex =
        /gol\. darah|nik|kewarganegaraan|nama|status perkawinan|berlaku hingga|alamat|agama|tempat\/tgl lahir|jenis kelamin|gol darah|rt\/rw|kel|desa|kecamatan|pekerjaan|kel\/desa|desa|kel\/|\/desa/gi;

      const cleanLines = lines
        .map((line) => line.replace(filterRegex, '').replace(':', '').trim())
        .filter((line) => line != '');

      i = 4;
      while (
        i < cleanLines.length &&
        !cleanLines[i].match(/[a-z -]+, ?\d{2}-\d{2}-\d{4}/i)
      ) {
        cleanLines[3] += ` ${cleanLines[i++]}`;
      }
      cleanLines.splice(4, i - 4);

      i = 7;
      while (
        i < cleanLines.length &&
        !cleanLines[i].match(/[0-9]{3}\/[0-9]{3}/)
      ) {
        cleanLines[6] += ` ${cleanLines[i++]}`;
      }
      cleanLines.splice(7, i - 7);

      if (cleanLines.length < 14) {
        return replyBadRequest(
          'Some fields are not detected! Make sure the image was not cropped'
        );
      }

      const [
        provinsi,
        kota,
        nik,
        nama,
        ttl,
        jenis_kelamin,
        alamat,
        rt_rw,
        kel_desa,
        kecamatan,
        agama,
        status_perkawinan,
        pekerjaan,
        kewarganegaraan,
      ] = cleanLines;

      const tanggal_lahir = ttl.split(', ')[1];

      const ktp = {
        provinsi,
        kota,
        nik: nik.match(/[0-9]{16}/)?.[0] ?? nik,
        nama,
        ttl,
        jenis_kelamin,
        alamat,
        rt_rw,
        kel_desa,
        kecamatan,
        agama,
        status_perkawinan,
        pekerjaan,
        kewarganegaraan,
      };

      const user = await prisma.ktp.upsert({
        where: {
          uid,
        },
        update: {
          ktpUrl: publicUrl,
          ...ktp,
        },
        create: {
          uid,
          ktpUrl: publicUrl,
          ...ktp,
        },
      });

      return reply.send({
        data: {
          ktp: { ...ktp, tanggal_lahir },
          user,
        },
      });
    }
  );

  fastify.post<{ Body: IOCRBody; Headers: IHeaders }>(
    '/ocr-test',
    { schema: ktpOcrSchemaPost },
    async (request, reply) => {
      const { data, mimetype } = request.body.ktp[0];

      const { left, top, right, bottom } = request.body;

      const processedImg: Sharp =
        left !== undefined &&
        top !== undefined &&
        right !== undefined &&
        bottom !== undefined
          ? sharp(data).extract({
              left: Math.round(Math.min(+left, +right)),
              top: Math.round(Math.min(+bottom, +top)),
              width: Math.round(Math.abs(+right - +left)),
              height: Math.round(Math.abs(+bottom - +top)),
            })
          : sharp(data);

      const ktpImg = await processedImg.toBuffer();
      const filename = `ktp/test.${mime.extension(mimetype)}`;
      const file = bucket.file(filename);
      await file.save(ktpImg);
      const publicUrl = file.publicUrl();

      return reply.send({ publicUrl });
    }
  );
};

export const prefix = '/ktp';
