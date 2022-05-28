import type { FastifyPluginAsync } from 'fastify';
import httpStatus from 'http-status';

import prisma from '../config/prismaClient';
import { ktpSchemaGetAll, ktpSchemaGetUnique } from '../schema/ktp.schema';

type IQuerystring = {
  nik?: string;
  limit?: number;
  page?: number;
};

type IParams = {
  nik: string;
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
};

export const prefix = '/ktp';
