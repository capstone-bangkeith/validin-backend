import { Type } from '@sinclair/typebox';

export const ErrorResponse = Type.Object({
  message: Type.String(),
  error: Type.String(),
  statusCode: Type.Number(),
});
