import { FastifyInstance } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';

import prisma from '../../config/prismaClient';
import { ktpSchemaPut } from '../../schema/ktp.schema';
import { IBody, IHeaders } from './types';

const putKtp = (fastify: FastifyInstance) =>
  fastify.put<{ Body: IBody; Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaPut },
    async (request, reply) => {
      const ktp = request.body;
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const data = await prisma.ktp.update({
        where: { uid },
        data: ktp,
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

export default putKtp;
