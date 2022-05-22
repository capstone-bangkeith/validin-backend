import type { FastifyPluginAsync } from 'fastify';

import * as kodeWilayah from './kodeWilayah.route';

const routes = [
  {
    plugin: kodeWilayah.kodeWilayahPlugin,
    prefix: kodeWilayah.prefix,
  },
];

export const router: FastifyPluginAsync = async (fastify) => {
  routes.forEach((route) => {
    fastify.register(route.plugin, { prefix: route.prefix });
  });
};

export default router;
