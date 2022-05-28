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
    kelDesa: Type.String(),
    kecamatan: Type.String(),
    agama: Type.String(),
    statusPerkawinan: Type.String(),
    pekerjaan: Type.String(),
    kewarganegaraan: Type.String(),
  },
  { description: 'Kode wilayah properties' }
);

const PostKtpResponse = Type.Object({
  data: KtpType,
});

const ktpSchemaBase: FastifySchema = {
  description: 'Post KTP form',
};

export const ktpSchemaPost: FastifySchema = {
  ...ktpSchemaBase,
  body: KtpType,
};

export const ktpSchemaGet: FastifySchema = {
  ...ktpSchemaBase,
  querystring: Type.Optional(
    Type.Object({
      kode: Type.Optional(Type.String({ description: 'KTP' })),
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
    kode: Type.Optional(Type.String({ description: 'Kode wilayah' })),
  }),
  response: {
    200: Type.Object({
      data: KtpType,
    }),
    404: ErrorResponse,
  },
};
