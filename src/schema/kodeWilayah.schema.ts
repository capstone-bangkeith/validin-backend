import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';

import { ErrorResponse } from './error.schema';

export const KodeWilayahType = Type.Object(
  {
    kodewilayah: Type.String(),
    provinsi: Type.String(),
    kabupatenkota: Type.String(),
    kecamatan: Type.String(),
  },
  { description: 'Kode wilayah properties' }
);

const KodeWilayahResponse = Type.Object({
  data: Type.Array(KodeWilayahType),
});

const kodeWilayahSchemaBase: FastifySchema = {
  description: 'Get kode wilayah',
};

export const kodeWilayahSchemaGetAll: FastifySchema = {
  ...kodeWilayahSchemaBase,
  querystring: Type.Optional(
    Type.Object({
      kode: Type.Optional(Type.String({ description: 'Kode wilayah' })),
    })
  ),
  response: {
    200: KodeWilayahResponse,
    404: ErrorResponse,
  },
};

export const kodeWilayahSchemaGetUnique: FastifySchema = {
  ...kodeWilayahSchemaBase,
  params: Type.Object({
    kode: Type.Optional(Type.String({ description: 'Kode wilayah' })),
  }),
  response: {
    200: Type.Object({
      data: KodeWilayahType,
    }),
    404: ErrorResponse,
  },
};
