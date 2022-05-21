import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

import prisma from '../prismaClient';

type IQuerystring = {
  kode?: string;
};

type IParams = {
  kode: string;
};

const KodeWilayahType = Type.Object({
  kodewilayah: Type.String(),
  provinsi: Type.String(),
  kabupatenkota: Type.String(),
  kecamatan: Type.String(),
});

const KodeWilayahResponse = Type.Object({
  data: Type.Union([Type.Array(KodeWilayahType), KodeWilayahType]),
});

const kodeWilayahSchema = {
  response: {
    200: KodeWilayahResponse,
  },
};

export const kodeWilayahPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: IQuerystring }>(
    '/',
    { schema: kodeWilayahSchema },
    async (request, reply) => {
      const data = request.query.kode
        ? await prisma.kodeWilayah.findUnique({
            where: { kodewilayah: request.query.kode },
          })
        : await prisma.kodeWilayah.findMany();

      return reply.send({ data });
    }
  );

  fastify.get<{ Params: IParams }>(
    '/:kode',
    { schema: kodeWilayahSchema },
    async (request, reply) => {
      const data = await prisma.kodeWilayah.findUnique({
        where: { kodewilayah: request.params.kode },
      });
      return reply.send({ data });
    }
  );
};

export const prefix = '/kode-wilayah';
