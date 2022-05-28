import fastifyHelmet from '@fastify/helmet';
import fastify from 'fastify';

import prisma from './config/prismaClient';
import { registerSwagger } from './config/swagger';
import router from './routes';

const buildApp = async () => {
  const server = fastify({
    logger: {
      prettyPrint: process.env.NODE_ENV !== 'production',
    },
  });

  await server.register(fastifyHelmet);

  await registerSwagger(server);

  await server.register(router);

  prisma
    .$connect()
    .then(() => {
      server.log.info('CONNECTED TO DB');
    })
    .catch((e) => {
      server.log.error(e);
    });

  return server;
};

export default buildApp;
