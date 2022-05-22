import fastifyHelmet from '@fastify/helmet';
import fastify from 'fastify';

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

  return server;
};

export default buildApp;
