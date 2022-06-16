import { FastifyInstance } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';

import { bucket } from '../../config/cloudStorage';
import prisma from '../../config/prismaClient';
import { ktpSchemaDelete } from '../../schema/ktp.schema';
import { IHeaders } from './types';

const deleteKtp = (fastify: FastifyInstance) =>
  fastify.delete<{ Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaDelete },
    async (request, reply) => {
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const user = await prisma.ktp.findUnique({
        where: { uid },
      });
      const filename = user?.ktpUrl?.split('/').slice(4).join('/');

      const data = await prisma.ktp.delete({
        where: { uid },
      });

      if (filename) {
        await bucket.file(filename).delete({ ignoreNotFound: true });
      }

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

export default deleteKtp;
