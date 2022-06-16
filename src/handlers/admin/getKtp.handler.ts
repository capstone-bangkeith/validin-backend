import { FastifyInstance } from 'fastify';
import httpStatus from 'http-status';

import { ADMIN_NAME, ADMIN_PW } from '../../config/config';
import prisma from '../../config/prismaClient';
import { IParams } from './types';

const getKtp = (fastify: FastifyInstance) =>
  fastify.get<{ Params: IParams }>('/:uid', {}, async (request, reply) => {
    const { uname, pw } = request.headers;
    if (uname !== ADMIN_NAME || pw !== ADMIN_PW) {
      return reply.status(httpStatus.FORBIDDEN).send({
        error: httpStatus[httpStatus.FORBIDDEN],
        statusCode: httpStatus.FORBIDDEN,
        message: 'Cannot access this admin only endpoint',
      });
    }

    const data = await prisma.ktp.findUnique({
      where: { uid: request.params.uid },
    });

    if (!data) {
      return reply.status(httpStatus.NOT_FOUND).send({
        error: httpStatus[httpStatus.NOT_FOUND],
        statusCode: httpStatus.NOT_FOUND,
        message: 'KTP not found',
      });
    }
    return reply.send({ data });
  });

export default getKtp;
