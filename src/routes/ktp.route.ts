import type { FastifyPluginAsync } from 'fastify';

import deleteKtp from '../handlers/ktp/deleteKtp.handler';
import getKtp from '../handlers/ktp/getKtp.handler';
import ocr from '../handlers/ktp/ocr.handler';
import ocr2 from '../handlers/ktp/ocr2.handler';
import ocrTest from '../handlers/ktp/ocrTest.handler';
import postKtp from '../handlers/ktp/postKtp.handler';
import putKtp from '../handlers/ktp/putKtp.handler';

export const plugin: FastifyPluginAsync = async (fastify) => {
  getKtp(fastify);
  postKtp(fastify);
  putKtp(fastify);
  deleteKtp(fastify);
  ocr(fastify);
  ocr2(fastify);
  ocrTest(fastify);
};

export const prefix = '/ktp';
