import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';

import { ErrorResponse } from './error.schema';

export const KtpType = Type.Object(
  {
    id: Type.Number(),
    uid: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    nama: Type.String(),
    nik: Type.String(),
    kota: Type.String(),
    provinsi: Type.String(),
    alamat: Type.String(),
    rt_rw: Type.String(),
    jenis_kelamin: Type.String(),
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
    nama: Type.String({ maxLength: 69, minLength: 2 }),
    provinsi: Type.String({ maxLength: 69, minLength: 2 }),
    kota: Type.String({ maxLength: 69, minLength: 2 }),
    nik: Type.RegEx(/^\d{16}$/),
    ttl: Type.RegEx(/^[A-Za-z ]+, \d{2}-\d{2}-\d{4}$/),
    alamat: Type.String({ maxLength: 50 }),
    rt_rw: Type.String({ maxLength: 50 }),
    jenis_kelamin: Type.String(),
    kel_desa: Type.String({ maxLength: 50 }),
    kecamatan: Type.String({ maxLength: 50 }),
    agama: Type.String({ maxLength: 20 }),
    status_perkawinan: Type.String({ maxLength: 20 }),
    pekerjaan: Type.String({ maxLength: 20 }),
    kewarganegaraan: Type.String({ maxLength: 20 }),
  },
  { description: 'KTP properties' }
);

const PostKtpResponse = Type.Object({
  data: KtpPostType,
});

export const KtpPutType = Type.Object(
  {
    nama: Type.Optional(Type.String({ maxLength: 69, minLength: 2 })),
    provinsi: Type.Optional(Type.String({ maxLength: 69, minLength: 2 })),
    kota: Type.Optional(Type.String({ maxLength: 69, minLength: 2 })),
    nik: Type.Optional(Type.RegEx(/^\d{16}$/)),
    ttl: Type.Optional(Type.RegEx(/^[A-Za-z ]+, \d{2}-\d{2}-\d{4}$/)),
    alamat: Type.Optional(Type.String({ maxLength: 50 })),
    rt_rw: Type.Optional(Type.String({ maxLength: 50 })),
    jenis_kelamin: Type.Optional(Type.String()),
    kel_desa: Type.Optional(Type.String({ maxLength: 50 })),
    kecamatan: Type.Optional(Type.String({ maxLength: 50 })),
    agama: Type.Optional(Type.String({ maxLength: 20 })),
    status_perkawinan: Type.Optional(Type.String({ maxLength: 20 })),
    pekerjaan: Type.Optional(Type.String({ maxLength: 20 })),
    kewarganegaraan: Type.Optional(Type.String({ maxLength: 20 })),
  },
  { description: 'KTP properties' }
);

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
    left: Type.Optional(Type.Number()),
    top: Type.Optional(Type.Number()),
    right: Type.Optional(Type.Number()),
    bottom: Type.Optional(Type.Number()),
  }),
  querystring: Type.Optional(
    Type.Object({
      rotate: Type.Optional(Type.Number()),
      aggresive: Type.Optional(Type.Number()),
    })
  ),
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
    uid: Type.Optional(
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

export const ktpSchemaPut: FastifySchema = {
  description: 'Update ktp',
  body: KtpPutType,
  response: {
    200: Type.Object({
      data: KtpType,
    }),
    404: ErrorResponse,
  },
};

export const ktpSchemaDelete: FastifySchema = {
  description: 'Delete ktp',
  response: {
    200: Type.Object({
      data: KtpType,
    }),
    404: ErrorResponse,
  },
};
