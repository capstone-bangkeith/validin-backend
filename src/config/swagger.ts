import type { SwaggerOptions } from '@fastify/swagger';
import fastifySwagger from '@fastify/swagger';
import type { FastifyInstance } from 'fastify';

import { KodeWilayahType } from '../schema/kodeWilayah.schema';

const options: SwaggerOptions = {
  swagger: {
    info: {
      title: 'Validin Backend Swagger',
      description: 'Documentation for validin backend API',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://swagger.io',
      description: 'Find more info here',
    },
    host: 'localhost',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    definitions: {
      KodeWilayah: KodeWilayahType,
    },
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true,
};

export const registerSwagger = async (fastify: FastifyInstance) => {
  await fastify.register(fastifySwagger, options);
};
