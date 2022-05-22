import type { FastifyPluginAsync } from 'fastify';
import httpStatus from 'http-status';

import prisma from '../config/prismaClient';
import {
  kodeWilayahSchemaGetAll,
  kodeWilayahSchemaGetUnique,
} from '../schema/kodeWilayah.schema';

type IQuerystring = {
  kode?: string;
};

type IParams = {
  kode: string;
};

export const kodeWilayahPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: IQuerystring }>(
    '/',
    { schema: kodeWilayahSchemaGetAll },
    async (request, reply) => {
      const data = request.query.kode
        ? await prisma.kodeWilayah.findMany({
            where: { kodewilayah: request.query.kode },
          })
        : await prisma.kodeWilayah.findMany();
      if (!data) {
        return reply.status(httpStatus.NOT_FOUND).send({
          error: httpStatus[httpStatus.NOT_FOUND],
          statusCode: httpStatus.NOT_FOUND,
          message: 'Kode wilayah not found',
        });
      }
      return reply.send({ data });
    }
  );

  fastify.get<{ Params: IParams }>(
    '/:kode',
    { schema: kodeWilayahSchemaGetUnique },
    async (request, reply) => {
      const data = await prisma.kodeWilayah.findUnique({
        where: { kodewilayah: request.params.kode },
      });
      if (!data) {
        return reply.status(httpStatus.NOT_FOUND).send({
          error: httpStatus[httpStatus.NOT_FOUND],
          statusCode: httpStatus.NOT_FOUND,
          message: 'Kode wilayah not found',
        });
      }
      return reply.send({ data });
    }
  );
};

export const prefix = '/kode-wilayah';
