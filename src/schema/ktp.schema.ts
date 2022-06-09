import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';

import { ErrorResponse } from './error.schema';

export const KtpType = Type.Object(
  {
    id: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    nama: Type.String(),
    nik: Type.String(),
    alamat: Type.String(),
    rt_rw: Type.String(),
    kel_desa: Type.String(),
    kecamatan: Type.String(),
    agama: Type.String(),
    status_perkawinan: Type.String(),
    pekerjaan: Type.String(),
    kewarganegaraan: Type.String(),
  },
  { description: 'KTP properties' }
);

export const KtpPostType = Type.Object(
  {
    ktp: Type.Any(),
    nama: Type.String({ maxLength: 69, minLength: 2 }),
    nik: Type.RegEx(/^\d{16}$/),
    ttl: Type.RegEx(/^[A-Z]+, \d{2}-\d{2}-\d{4}$/),
    alamat: Type.String({ maxLength: 50 }),
    rt_rw: Type.String({ maxLength: 50 }),
    kel_desa: Type.String({ maxLength: 50 }),
    kecamatan: Type.String({ maxLength: 50 }),
    agama: Type.String({ maxLength: 20 }),
    status_perkawinan: Type.String({ maxLength: 20 }),
    pekerjaan: Type.String({ maxLength: 20 }),
    kewarganegaraan: Type.String({ maxLength: 20 }),
    token: Type.String(),
  },
  { description: 'KTP properties' }
);

const PostKtpResponse = Type.Object({
  data: KtpPostType,
});

const ktpSchemaBase: FastifySchema = {
  description: 'Post KTP form',
};

export const ktpSchemaPost: FastifySchema = {
  ...ktpSchemaBase,
  body: KtpPostType,
};

export const ktpOcrSchemaPost: FastifySchema = {
  description: 'Post KTP OCR',
  body: Type.Object({
    ktp: Type.Any(),
  }),
};

export const ktpSchemaGetAll: FastifySchema = {
  ...ktpSchemaBase,
  querystring: Type.Optional(
    Type.Object({
      nik: Type.Optional(Type.RegEx(/^\d{16}$/, { description: 'KTP' })),
      limit: Type.Optional(Type.Number({ minimum: 1 })),
      page: Type.Optional(Type.Number({ minimum: 1 })),
    })
  ),
  response: {
    200: PostKtpResponse,
    404: ErrorResponse,
  },
};

export const ktpSchemaGetUnique: FastifySchema = {
  ...ktpSchemaBase,
  params: Type.Object({
    nik: Type.Optional(
      Type.String({ description: 'Nomor Induk Kependudukan' })
    ),
  }),
  response: {
    200: Type.Object({
      data: KtpType,
    }),
    404: ErrorResponse,
  },
};
