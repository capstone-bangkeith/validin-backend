import { FastifyInstance } from 'fastify';
import httpStatus from 'http-status';

import { ADMIN_NAME, ADMIN_PW } from '../../config/config';
import prisma from '../../config/prismaClient';
import { IBody, IParams } from './types';

const deleteKtp = (fastify: FastifyInstance) =>
  fastify.delete<{ Body: IBody; Params: IParams }>(
    '/ktp/:uid',
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
      const { uid } = request.params;
      const data = await prisma.ktp.delete({
        where: { uid },
      });

      return reply.send({ data });
    }
  );

export default deleteKtp;
