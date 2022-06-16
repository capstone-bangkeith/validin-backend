import { FastifyInstance } from 'fastify';
import httpStatus from 'http-status';

import { ADMIN_NAME, ADMIN_PW } from '../../config/config';
import prisma from '../../config/prismaClient';
import { IHeaders, IQuerystring } from './types';

const getAllKtp = (fastify: FastifyInstance) =>
  fastify.get<{ Querystring: IQuerystring; Headers: IHeaders }>(
    '/ktp',
    {},
    async (request, reply) => {
      const { uname, pw } = request.headers;
      if (uname !== ADMIN_NAME || pw !== ADMIN_PW) {
        return reply.status(httpStatus.FORBIDDEN).send({
          error: httpStatus[httpStatus.FORBIDDEN],
          statusCode: httpStatus.FORBIDDEN,
          message: 'Cannot access this admin only endpoint',
        });
      }

      const limit = request.query.limit ?? 10;
      const page = request.query.page ?? 1;
      const { uid } = request.query;

      const data = uid
        ? await prisma.ktp.findMany({
            where: { uid },
          })
        : await prisma.ktp.findMany({
            skip: (page - 1) * limit,
            take: limit,
          });

      if (!data) {
        return reply.status(httpStatus.NOT_FOUND).send({
          error: httpStatus[httpStatus.NOT_FOUND],
          statusCode: httpStatus.NOT_FOUND,
          message: 'KTP not found',
        });
      }
      return reply.send({ data });
    }
  );

export default getAllKtp;
