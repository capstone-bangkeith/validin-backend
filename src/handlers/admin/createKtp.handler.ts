import { FastifyInstance } from 'fastify';
import httpStatus from 'http-status';
import { nanoid } from 'nanoid/async';

import { ADMIN_NAME, ADMIN_PW } from '../../config/config';
import prisma from '../../config/prismaClient';
import { IBody } from './types';

const createKtp = (fastify: FastifyInstance) =>
  fastify.post<{ Body: IBody }>('/ktp', {}, async (request, reply) => {
    const { uname, pw } = request.headers;
    if (uname !== ADMIN_NAME || pw !== ADMIN_PW) {
      return reply.status(httpStatus.FORBIDDEN).send({
        error: httpStatus[httpStatus.FORBIDDEN],
        statusCode: httpStatus.FORBIDDEN,
        message: 'Cannot access this admin only endpoint',
      });
    }

    const uid = await nanoid(10);

    const data = await prisma.ktp.create({ data: { uid, ...request.body } });

    return reply.send({ data });
  });

export default createKtp;
