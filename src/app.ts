import fastifyHelmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifyRedis from '@fastify/redis';
import fastify from 'fastify';

import { REDIS_HOST, REDIS_PASS } from './config/config';
import { initFirebase } from './config/firebaseAdmin';
import prisma from './config/prismaClient';
import { registerSwagger } from './config/swagger';
import router from './routes';

const buildApp = async () => {
  const server = fastify({
    ajv: {
      customOptions: {
        strict: 'log',
        keywords: ['kind', 'modifier'],
      },
    },
    logger: {
      ...(process.env.NODE_ENV !== 'production' && {
        transport: {
          target: 'pino-pretty',
        },
      }),
    },
  });

  await server.register(fastifyHelmet);
  await server.register(fastifyMultipart, {
    addToBody: true,
  });
  await server.register(fastifyRedis, {
    host: REDIS_HOST,
    password: REDIS_PASS,
  });

  await registerSwagger(server);

  await server.register(router);

  server.get('/', async () => {
    return { hello: 'bangkit academy' };
  });

  prisma
    .$connect()
    .then(() => {
      server.log.info('CONNECTED TO DB');
    })
    .catch((e) => {
      server.log.error(e);
    });

  initFirebase();

  return server;
};

export default buildApp;
