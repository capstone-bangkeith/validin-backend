import type { FastifyPluginAsync } from 'fastify';

import getAllKodeWilayah from '../handlers/kodewilayah/getAllKodeWilayah.handler';
import getKodeWilayah from '../handlers/kodewilayah/getKodeWilayah.handler';

export const plugin: FastifyPluginAsync = async (fastify) => {
  getAllKodeWilayah(fastify);
  getKodeWilayah(fastify);
};

export const prefix = '/kode-wilayah';
