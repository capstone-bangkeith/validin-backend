import { kodewilayah } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import httpStatus from 'http-status';

import { REDIS_EX } from '../../config/config';
import prisma from '../../config/prismaClient';
import { kodeWilayahSchemaGetUnique } from '../../schema/kodeWilayah.schema';
import { IParams } from './types';

const getKodeWilayah = (fastify: FastifyInstance) =>
  fastify.get<{ Params: IParams }>(
    '/:kode',
    { schema: kodeWilayahSchemaGetUnique },
    async (request, reply) => {
      const { redis } = fastify;
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

export default getKodeWilayah;
