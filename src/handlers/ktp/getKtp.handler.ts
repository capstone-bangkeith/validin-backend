import { FastifyInstance } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';

import prisma from '../../config/prismaClient';
import { ktpSchemaGetUnique } from '../../schema/ktp.schema';
import { IHeaders } from './types';

const getKtp = (fastify: FastifyInstance) =>
  fastify.get<{ Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaGetUnique },
    async (request, reply) => {
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const data = await prisma.ktp.findUnique({
        where: { uid },
      });
      console.log(data);
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

export default getKtp;
