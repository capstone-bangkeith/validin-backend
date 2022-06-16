import type { FastifyPluginAsync } from 'fastify';

import postKtp from '../handlers/admin/createKtp.handler';
import getAllKtp from '../handlers/admin/getAllKtp.handler';
import getKtp from '../handlers/admin/getKtp.handler';
import putKtp from '../handlers/admin/updateKtp.handler';
import deleteKtp from '../handlers/ktp/deleteKtp.handler';

export const plugin: FastifyPluginAsync = async (fastify) => {
  getKtp(fastify);
  getAllKtp(fastify);
  postKtp(fastify);
  putKtp(fastify);
  deleteKtp(fastify);
};

export const prefix = '/admin';
