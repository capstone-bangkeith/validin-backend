import { kodewilayah } from '@prisma/client';
import type { FastifyPluginAsync } from 'fastify';
import httpStatus from 'http-status';

import { REDIS_EX } from '../config/config';
import prisma from '../config/prismaClient';
import {
  kodeWilayahSchemaGetAll,
  kodeWilayahSchemaGetUnique,
} from '../schema/kodeWilayah.schema';

type IQuerystring = {
  kode?: string;
  limit?: number;
  page?: number;
};

type IParams = {
  kode: string;
};

export const kodeWilayahPlugin: FastifyPluginAsync = async (fastify) => {
  const { redis } = fastify;

  fastify.get<{ Querystring: IQuerystring }>(
    '/',
    { schema: kodeWilayahSchemaGetAll },
    async (request, reply) => {
      const limit = request.query.limit ?? 10;
      const page = request.query.page ?? 1;
      const { kode } = request.query;

      const redisKey = kode
        ? `KODE_ALL_${kode}`
        : `LIMIT_${limit}_PAGE_${page}`;

      const redisData = await redis.get(redisKey);

      let data: kodewilayah[];

      if (!redisData) {
        data = request.query.kode
          ? await prisma.kodewilayah.findMany({
              where: { kodewilayah: request.query.kode },
            })
          : await prisma.kodewilayah.findMany({
              skip: (page - 1) * limit,
              take: limit,
            });

        redis.set(redisKey, JSON.stringify(data), 'EX', REDIS_EX);
      } else {
        data = JSON.parse(redisData);
      }

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
      const redisKey = `KODE_${request.params.kode}`;

      const redisData = await redis.get(redisKey);

      let data: kodewilayah | null;

      if (!redisData) {
        data = await prisma.kodewilayah.findUnique({
          where: { kodewilayah: request.params.kode },
        });

        redis.set(redisKey, JSON.stringify(data), 'EX', REDIS_EX);
      } else {
        data = JSON.parse(redisData);
      }

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
