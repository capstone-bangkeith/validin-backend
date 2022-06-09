/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FastifyPluginAsync } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';
import mime from 'mime-types';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';

import storage from '../config/cloudStorage';
import { BUCKET_NAME } from '../config/config';
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
  alamat: string;
  rt_rw: string;
  kel_desa: string;
  kecamatan: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  ktp: {
    data: Buffer;
    filename: string;
    encoding: string;
    mimetype: string;
    limit: true;
  }[];
  token: string;
};

type IOCRBody = {
  ktp: {
    data: Buffer;
    filename: string;
    encoding: string;
    mimetype: string;
    limit: true;
  }[];
};

type IParams = {
  nik: string;
};

export const plugin: FastifyPluginAsync = async (fastify) => {
  const bucket = storage.bucket(BUCKET_NAME ?? 'chumybucket');

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
    '/:nik',
    { schema: ktpSchemaGetUnique },
    async (request, reply) => {
      const data = await prisma.ktp.findUnique({
        where: { nik: request.params.nik },
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
      try {
        const decodedToken = await getAuth().verifyIdToken(request.body.token);
        console.log(decodedToken);
      } catch (e) {
        console.error(e);
      }

      const { data, mimetype } = request.body.ktp[0];

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ktp, ...ktpData } = request.body;

      const { nik, ttl } = ktpData;

      const date = ttl.split(', ')[1];
      const dateNoDash = date.replace('-', '');

      if (dateNoDash !== nik.substring(6, 12)) {
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

      const [ktpRes] = await Promise.all([
        prisma.ktp.create({ data: ktpData }),
        bucket
          .file(`ktp/${request.body.nik}.${mime.extension(mimetype)}`)
          .save(data),
      ]);
      return reply.send({ data: ktpRes });
    }
  );

  fastify.post<{ Body: IOCRBody }>(
    '/ocr',
    { schema: ktpOcrSchemaPost },
    async (request, reply) => {
      const { data, mimetype } = request.body.ktp[0];

      const ktpImg = await sharp(data)
        .greyscale()
        .normalise()
        .sharpen()
        .threshold()
        .toBuffer();

      const {
        data: { text },
      } = await Tesseract.recognize(ktpImg, 'eng', {
        logger: (m) => console.log(m),
      });

      return reply.send({ data: text });
    }
  );
};

export const prefix = '/ktp';
