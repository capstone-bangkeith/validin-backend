import { google } from '@google-cloud/vision/build/protos/protos';
import { FastifyInstance } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';
import mime from 'mime-types';
import { nanoid } from 'nanoid';
import sharp, { Sharp } from 'sharp';

import { bucket } from '../../config/cloudStorage';
import { textDetectionGcs } from '../../config/cloudVision';
import prisma from '../../config/prismaClient';
import { ktpOcrSchemaPost } from '../../schema/ktp.schema';
import normalizeCoord from '../../utils/normalizeCoord';
import { IHeaders, IOCRBody, IQueryOcr } from './types';

const ocr2 = (fastify: FastifyInstance) =>
  fastify.post<{ Body: IOCRBody; Headers: IHeaders; Querystring: IQueryOcr }>(
    '/ocr2',
    { schema: ktpOcrSchemaPost },
    async (request, reply) => {
      const replyBadRequest = (
        message = 'OCR did not read correct data!',
        statusCode = httpStatus.BAD_REQUEST,
        error = 'Bad Request'
      ) =>
        reply.status(statusCode).send({
          statusCode,
          error,
          message,
        });

      const { token } = request.headers;

      const decodedIdToken = await getAuth().verifyIdToken(token);
      const { uid } = decodedIdToken;

      const { data, mimetype } = request.body.ktp[0];

      const { left, top, right, bottom } = request.body;

      const image = sharp(data);
      const metadata = await image.metadata();
      let { width, height } = metadata;
      const rotateTimes = request.query.rotate ?? 0;
      if (rotateTimes % 2 == 1) {
        [height, width] = [width, height];
      }
      const processedImg: Sharp =
        left !== undefined &&
        top !== undefined &&
        right !== undefined &&
        bottom !== undefined &&
        width !== undefined &&
        height !== undefined
          ? image
              .rotate(90 * rotateTimes)
              .extract({
                left: Math.min(
                  normalizeCoord(left, 3),
                  normalizeCoord(right, 3)
                ),
                top: Math.min(
                  normalizeCoord(bottom, 3),
                  normalizeCoord(top, 3)
                ),
                width: Math.abs(
                  normalizeCoord(right, 3) - normalizeCoord(left, 3)
                ),
                height: Math.abs(
                  normalizeCoord(bottom, 3) - normalizeCoord(top, 3)
                ),
              })
              .resize(1000)
          : image.rotate(90 * rotateTimes).resize(1000);

      const ktpImg = await processedImg.withMetadata().toBuffer();
      const filename = `ktp/${uid}-${nanoid(8)}.${mime.extension(mimetype)}`;
      const file = bucket.file(filename);
      await file.save(ktpImg);
      const publicUrl = file.publicUrl();

      let result: google.cloud.vision.v1.IAnnotateImageResponse;
      try {
        [result] = await textDetectionGcs(filename, ktpImg);
      } catch (e) {
        return replyBadRequest(
          (e as string) ?? 'Could not detect any texts from the image'
        );
      }
      const detections = result.textAnnotations;

      if (!detections?.[0]?.description) {
        return replyBadRequest('Could not detect any texts from the image');
      }

      const lines = detections[0].description.split('\n');

      let i = 0;
      for (; i < lines.length; ++i) {
        if (lines[i].toLowerCase().includes('provinsi')) {
          break;
        }
      }
      lines.splice(0, i);
      const filterRegex =
        /gol\. darah|nik|kewarganegaraan|nama|status perkawinan|berlaku hingga|alamat|agama|tempat\/tgl lahir|jenis kelamin|gol darah|rt\/rw|kel|desa|kecamatan|pekerjaan|kel\/desa|desa|kel\/|\/desa/gi;

      const cleanLines = lines
        .map((line) => line.replace(filterRegex, '').replace(':', '').trim())
        .filter((line) => line != '');

      if (request.query.aggresive == 1) {
        i = 4;
        while (
          i < cleanLines.length &&
          !cleanLines[i].match(/[a-z -]+, ?\d{2}-\d{2}-\d{4}/i)
        ) {
          cleanLines[3] += ` ${cleanLines[i++]}`;
        }
        cleanLines.splice(4, i - 4);

        i = 7;
        while (
          i < cleanLines.length &&
          !cleanLines[i].match(/[0-9]{3}\/[0-9]{3}/)
        ) {
          cleanLines[6] += ` ${cleanLines[i++]}`;
        }
        cleanLines.splice(7, i - 7);

        if (cleanLines.length < 14) {
          return replyBadRequest(
            'Some fields are not detected! Make sure the image was not cropped'
          );
        }
      }

      const [
        provinsi,
        kota,
        nik,
        nama,
        ttl,
        jenis_kelamin,
        alamat,
        rt_rw,
        kel_desa,
        kecamatan,
        agama,
        status_perkawinan,
        pekerjaan,
        kewarganegaraan,
      ] = cleanLines;

      const tanggal_lahir = ttl.split(', ')[1];

      const ktp = {
        provinsi,
        kota,
        nik: nik.match(/[0-9]{16}/)?.[0] ?? nik,
        nama,
        ttl,
        jenis_kelamin,
        alamat,
        rt_rw,
        kel_desa,
        kecamatan,
        agama,
        status_perkawinan,
        pekerjaan,
        kewarganegaraan,
      };

      const user = await prisma.ktp.upsert({
        where: {
          uid,
        },
        update: {
          ktpUrl: publicUrl,
          ...ktp,
        },
        create: {
          uid,
          ktpUrl: publicUrl,
          ...ktp,
        },
      });

      return reply.send({
        data: {
          ktp: { ...ktp, tanggal_lahir },
          user,
        },
      });
    }
  );

export default ocr2;
