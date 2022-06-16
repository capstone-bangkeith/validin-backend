import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';

import { ErrorResponse } from './error.schema';
import { KtpType } from './ktp.schema';

const KtpResponse = Type.Object({
  data: Type.Array(KtpType),
});

const ktpSchemaBase: FastifySchema = {
  description: 'Get KTP',
};

export const kodeWilayahSchemaGetAll: FastifySchema = {
  ...ktpSchemaBase,
  querystring: Type.Optional(
    Type.Object({
      uid: Type.Optional(Type.RegEx(/^\d{6}$/, { description: 'uid' })),
      limit: Type.Optional(Type.Number({ minimum: 1, maximum: 169 })),
      page: Type.Optional(Type.Number({ minimum: 1, maximum: 7000 })),
    })
  ),
  response: {
    200: KtpResponse,
    404: ErrorResponse,
  },
};

export const kodeWilayahSchemaGetUnique: FastifySchema = {
  ...ktpSchemaBase,
  params: Type.Object({
    kode: Type.Optional(Type.RegEx(/^\d{6}$/, { description: 'Kode wilayah' })),
  }),
  response: {
    200: Type.Object({
      data: KtpType,
    }),
    404: ErrorResponse,
  },
};
