import type { FastifyPluginAsync } from 'fastify';
import httpStatus from 'http-status';
import mime from 'mime-types';

import storage from '../config/cloudStorage';
import prisma from '../config/prismaClient';
import {
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
};

type IParams = {
  nik: string;
};

export const plugin: FastifyPluginAsync = async (fastify) => {
  const bucket = storage.bucket('chumybucket');

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
      const { data, mimetype } = request.body.ktp[0];
      await bucket
        .file(`ktp/${request.body.nik}.${mime.extension(mimetype)}`)
        .save(data);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { ktp, ...ktpData } = request.body;
      const ktpRes = await prisma.ktp.create({ data: ktpData });
      return reply.send({ data: ktpRes });
    }
  );
};

export const prefix = '/ktp';
