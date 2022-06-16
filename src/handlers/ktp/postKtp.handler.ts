import { FastifyInstance } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';

import prisma from '../../config/prismaClient';
import { ktpSchemaPost } from '../../schema/ktp.schema';
import { IBody, IHeaders } from './types';

const postKtp = (fastify: FastifyInstance) =>
  fastify.post<{ Body: IBody; Headers: IHeaders }>(
    '/',
    { schema: ktpSchemaPost },
    async (request, reply) => {
      const ktpData: IBody = request.body;
      console.log(ktpData);
      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const { nik, ttl } = ktpData;

      const date = ttl.split(', ')[1];
      const dateNoDash = date.replaceAll('-', '');
      const dateToCompare =
        dateNoDash.substring(0, 4) + dateNoDash.substring(6, 8);
      const isFemale = +nik.substring(6, 8) >= 40;
      if (
        (isFemale && ktpData.jenis_kelamin !== 'PEREMPUAN') ||
        (!isFemale && ktpData.jenis_kelamin !== 'LAKI-LAKI')
      ) {
        return reply.send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'NIK is not valid!, the gender is not matching',
        });
      }
      const dateFromNik =
        (isFemale
          ? (+nik.substring(6, 8) - 40).toString()
          : nik.substring(6, 8)) + nik.substring(8, 12);
      if (dateToCompare !== dateFromNik) {
        return reply.status(httpStatus.BAD_REQUEST).send({
          statusCode: httpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message:
            'NIK is not valid!, the Place and Date of birth is not matching',
        });
      }

      const res = await prisma.kodewilayah.findUnique({
        where: {
          kodewilayah: nik.substring(0, 6),
        },
      });

      if (res === null) {
        return reply.status(httpStatus.BAD_REQUEST).send({
          statusCode: httpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'NIK is not valid!',
        });
      }

      const ktpRes = await prisma.ktp.upsert({
        where: {
          uid,
        },
        update: ktpData,
        create: { ...ktpData, uid },
      });
      return reply.send({ data: ktpRes });
    }
  );

export default postKtp;
