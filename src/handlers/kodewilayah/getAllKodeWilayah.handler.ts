import { kodewilayah } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import httpStatus from 'http-status';

import { REDIS_EX } from '../../config/config';
import prisma from '../../config/prismaClient';
import { kodeWilayahSchemaGetAll } from '../../schema/kodeWilayah.schema';
import { IQuerystring } from './types';

const getAllKodeWilayah = (fastify: FastifyInstance) =>
  fastify.get<{ Querystring: IQuerystring }>(
    '/',
    { schema: kodeWilayahSchemaGetAll },
    async (request, reply) => {
      const { redis } = fastify;
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

export default getAllKodeWilayah;
