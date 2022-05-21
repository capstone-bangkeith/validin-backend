import { FastifyPluginAsync } from 'fastify';

import prisma from '../prismaClient';

type IQuerystring = {
  kode?: string;
};

type IParams = {
  kode: string;
};

export const kodeWilayahPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: IQuerystring }>('/', async (request, reply) => {
    const res = request.query.kode
      ? await prisma.kodeWilayah.findUnique({
          where: { kodewilayah: request.query.kode },
        })
      : await prisma.kodeWilayah.findMany();

    return reply.send(res);
  });

  fastify.get<{ Params: IParams }>('/:kode', async (request, reply) => {
    const res = await prisma.kodeWilayah.findUnique({
      where: { kodewilayah: request.params.kode },
    });
    return reply.send(res);
  });
};

export const prefix = '/kode-wilayah';
