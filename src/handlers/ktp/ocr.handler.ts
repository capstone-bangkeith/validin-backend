import { FastifyInstance } from 'fastify';
import { getAuth } from 'firebase-admin/auth';
import httpStatus from 'http-status';
import mime from 'mime-types';
import sharp, { Sharp } from 'sharp';
import Tesseract from 'tesseract.js';

import { bucket } from '../../config/cloudStorage';
import { getCorrections } from '../../config/natural';
import { ktpOcrSchemaPost } from '../../schema/ktp.schema';
import { IHeaders, IOCRBody } from './types';

const ocr = (fastify: FastifyInstance) =>
  fastify.post<{ Body: IOCRBody; Headers: IHeaders }>(
    '/ocr',
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

      const processedImg: Sharp = sharp(data)
        .resize(1000)
        .greyscale()
        .threshold();

      const ktpImg = await processedImg.toBuffer();

      const {
        data: { text },
      } = await Tesseract.recognize(ktpImg, 'ind', {
        logger: (m) => console.log(m),
      });

      const lines = text.split('\n');

      console.log(lines);

      const [provinsiRaw, ...provinsiWords] = lines[0].split(' ');
      const provinsiSection = getCorrections(provinsiRaw.toLowerCase())[0];

      if (provinsiSection !== 'provinsi') {
        console.log('provinsi ngab');
        return replyBadRequest();
      }

      const provinsi = provinsiWords.join(' ').trim();

      const [nikRaw, ...nikWords] = lines[2].split(' ');
      const nikSection = getCorrections(nikRaw.toLowerCase())[0];

      if (nikSection !== 'nik') {
        console.log('nik ngab');
        return replyBadRequest();
      }

      const nik = nikWords[nikWords.length - 1].trim();

      const [namaRaw, ...namaWords] = lines[3].split(' ');
      const namaSection = getCorrections(namaRaw.toLowerCase())[0];

      if (namaSection !== 'nama') {
        console.log(namaSection);
        return replyBadRequest();
      }

      const nama = namaWords.join(' ').split(':')[1].trim();

      const ttlRaw = lines[4].split(' ')[1];
      const ttlSection = getCorrections(ttlRaw.toLowerCase())[0];

      if (ttlSection !== 'lahir') {
        console.log(ttlSection);
        return replyBadRequest();
      }

      const ttl = lines[4].split(':')[1].trim();

      const jenisKelaminRaw = lines[5].split(' ')[1];
      const jenisKelaminSection = getCorrections(
        jenisKelaminRaw.toLowerCase()
      )[0];

      if (jenisKelaminSection !== 'kelamin') {
        console.log(jenisKelaminSection);
        return replyBadRequest();
      }

      const jenisKelamin = lines[5].split(':')[1].trim().split(' ')[0];

      const alamatRaw = lines[6].split(' ')[0];
      const alamatSection = getCorrections(alamatRaw.toLowerCase())[0];

      if (alamatSection !== 'alamat') {
        console.log(alamatRaw);
        console.log(alamatSection);
        return replyBadRequest();
      }

      const alamat = lines[6].split(':')[1].trim();

      const rtrwRaw = lines[7]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const rtrwSection = getCorrections(rtrwRaw.toLowerCase())[0];

      if (rtrwSection !== 'rtrw') {
        console.log(rtrwRaw);
        console.log(rtrwSection);
        return replyBadRequest();
      }

      const rtrw = lines[7].split(':')[1].trim();

      const keldesaRaw = lines[8]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const keldesaSection = getCorrections(keldesaRaw.toLowerCase())[0];

      if (keldesaSection !== 'keldesa') {
        console.log(keldesaRaw);
        console.log(keldesaSection);
        return replyBadRequest();
      }

      const keldesa = lines[8].split(':')[1].trim();

      const kecamatanRaw = lines[9]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const kecamatanSection = getCorrections(kecamatanRaw.toLowerCase())[0];

      if (kecamatanSection !== 'kecamatan') {
        console.log(kecamatanRaw);
        console.log(kecamatanSection);
        return replyBadRequest();
      }

      const kecamatan = lines[9].split(':')[1].trim();

      const agamaRaw = lines[10]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const agamaSection = getCorrections(agamaRaw.toLowerCase())[0];

      if (agamaSection !== 'agama') {
        console.log(agamaRaw);
        console.log(agamaSection);
        return replyBadRequest();
      }

      const agama = lines[10].split(':')[1].trim();

      const statusPerkawinanRaw = lines[11]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const statusPerkawinanSection = getCorrections(
        statusPerkawinanRaw.toLowerCase()
      )[0];

      if (statusPerkawinanSection !== 'statusperkawinan') {
        console.log(statusPerkawinanRaw);
        console.log(statusPerkawinanSection);
        return replyBadRequest();
      }

      const statusPerkawinan = lines[11].split(':')[1].trim();

      const pekerjaanRaw = lines[12]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const pekerjaanSection = getCorrections(pekerjaanRaw.toLowerCase())[0];

      if (pekerjaanSection !== 'pekerjaan') {
        console.log(pekerjaanRaw);
        console.log(pekerjaanSection);
        return replyBadRequest();
      }

      const pekerjaan = lines[12].split(':')[1].trim();

      const kewarganegaraanRaw = lines[13]
        .split(':')[0]
        .split(' ')
        .join('')
        .replace(/[^a-zA-Z]/, '');
      const kewarganegaraanSection = getCorrections(
        kewarganegaraanRaw.toLowerCase()
      )[0];

      if (kewarganegaraanSection !== 'kewarganegaraan') {
        console.log(kewarganegaraanRaw);
        console.log(kewarganegaraanSection);
        return replyBadRequest();
      }

      const kewarganegaraan = lines[13].split(':')[1].trim().split(' ')[0];

      const file = bucket.file(`ktp/${uid}.${mime.extension(mimetype)}`);
      await file.save(data);
      const publicUrl = file.publicUrl();

      return reply.send({
        data: {
          ktp: {
            nik,
            provinsi,
            nama,
            ttl,
            jenisKelamin,
            alamat,
            rtrw,
            keldesa,
            kecamatan,
            agama,
            statusPerkawinan,
            pekerjaan,
            kewarganegaraan,
          },
          publicUrl,
        },
      });
    }
  );

export default ocr;
