import type { FastifyPluginAsync } from 'fastify';

import * as admin from './admin.route';
import * as kodeWilayah from './kodeWilayah.route';
import * as ktp from './ktp.route';

const routes = [
  {
    plugin: admin.plugin,
    prefix: admin.prefix,
  },
  {
    plugin: kodeWilayah.plugin,
    prefix: kodeWilayah.prefix,
  },
  {
    plugin: ktp.plugin,
    prefix: ktp.prefix,
  },
];

export const router: FastifyPluginAsync = async (fastify) => {
  routes.forEach((route) => {
    fastify.register(route.plugin, { prefix: route.prefix });
  });
};

export default router;
