import fastifyHelmet from '@fastify/helmet';
import fastify from 'fastify';

import router from './routes';

const server = fastify({
  logger: {
    prettyPrint: process.env.NODE_ENV === 'development',
  },
});

server.register(fastifyHelmet);

server.register(router);

server.listen(8080, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
