import { FastifyInstance } from 'fastify';
import mime from 'mime';
import sharp, { Sharp } from 'sharp';

import { bucket } from '../../config/cloudStorage';
import { ktpOcrSchemaPost } from '../../schema/ktp.schema';
import { IHeaders, IOCRBody } from './types';

const ocrTest = (fastify: FastifyInstance) =>
  fastify.post<{ Body: IOCRBody; Headers: IHeaders }>(
    '/ocr-test',
    { schema: ktpOcrSchemaPost },
    async (request, reply) => {
      const { data, mimetype } = request.body.ktp[0];

      const { left, top, right, bottom } = request.body;

      const processedImg: Sharp =
        left !== undefined &&
        top !== undefined &&
        right !== undefined &&
        bottom !== undefined
          ? sharp(data).extract({
              left: Math.round(Math.min(+left, +right)),
              top: Math.round(Math.min(+bottom, +top)),
              width: Math.round(Math.abs(+right - +left)),
              height: Math.round(Math.abs(+bottom - +top)),
            })
          : sharp(data);

      const ktpImg = await processedImg.toBuffer();
      const filename = `ktp/test.${mime.extension(mimetype)}`;
      const file = bucket.file(filename);
      await file.save(ktpImg);
      const publicUrl = file.publicUrl();

      return reply.send({ publicUrl });
    }
  );

export default ocrTest;
