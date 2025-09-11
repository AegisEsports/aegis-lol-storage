// src/validation/zod-middleware.ts
import type { RequestHandler } from 'express';
import type { ZodType, ZodError } from 'zod';

import ControllerError from '@/util/errors/controllerError.js';

type Source = 'body' | 'query' | 'params' | 'headers';

type Issue = {
  path: string; // e.g. "user.nickname"
  message: string; // e.g. "String must contain at least 1 character(s)"
  code: string; // zod error code
};

export type ValidationErrorPayload = {
  error: 'ValidationError';
  source: Source;
  issues: Issue[];
};

const formatZodError = (err: ZodError): Issue[] => {
  return err.issues.map((i) => ({
    path: i.path.map(String).join('.'),
    message: i.message,
    code: i.code,
  }));
};

const validator = (source: Source) => {
  return <T extends ZodType>(schema: T): RequestHandler => {
    return (req, res, next) => {
      const value = req[source];
      const result = schema.safeParse(value);

      if (!result.success) {
        const payload: ValidationErrorPayload = {
          error: 'ValidationError',
          source,
          issues: formatZodError(result.error),
        };
        throw new ControllerError(
          400,
          'InvalidInput',
          'Invalid input',
          payload,
        );
      }

      req[source] = result.data;
      next();
    };
  };
};

export const validateBody = validator('body');
export const validateQuery = validator('query');
export const validateParams = validator('params');
export const validateHeaders = validator('headers');

// Optional helper to compose multiple validators in one go:
// usage: app.post('/x', validate({ body: schemaA, query: schemaB }), handler)
export const validate = (
  schemas: Partial<Record<Source, ZodType>>,
): RequestHandler[] => {
  const mws: RequestHandler[] = [];
  if (schemas.params) mws.push(validateParams(schemas.params));
  if (schemas.query) mws.push(validateQuery(schemas.query));
  if (schemas.headers) mws.push(validateHeaders(schemas.headers));
  if (schemas.body) mws.push(validateBody(schemas.body));
  return mws;
};
