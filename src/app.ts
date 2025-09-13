import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import helmet from 'helmet';
import { NoResultError } from 'kysely';
import morgan from 'morgan';
import { DatabaseError } from 'pg';
import { PostgresError } from 'pg-error-enum';

import { api as apiRouter } from '@/router/api.js';
import ControllerError from '@/util/errors/controllerError.js';
import { CREDENTIALS, LOG_FORMAT, ORIGIN } from './config/env.js';
import { logger, stream } from './util/logger.js';

const app = express();

// 1) Parse JSON bodies
app.use(express.json());

// 2) Standard middleware
app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
app.use(cookieParser());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(LOG_FORMAT, { stream }));

// 3) Mount API routes
app.use('/api', apiRouter);

// 4a) Convert unmatched routes to a ControllerError (404)
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(
    new ControllerError(404, 'NotFound', 'Route does not exist', {
      method: req.method,
      path: req.originalUrl,
    }),
  );
});

// 4b) Handle connection refusal to the database
app.use(
  (err: DatabaseError, _req: Request, res: Response, next: NextFunction) => {
    if (err?.code === 'ECONNREFUSED') {
      res.status(503).json({
        error: {
          code: 'UpstreamUnavailable',
          message: 'Database unavailable or unable to connect',
        },
      });
      return;
    }
    next(err);
  },
);

// 4c) Handle different error types (let everything else fall through)
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ControllerError) {
    // 4xx are client issues; log as warn
    logger.warn('ControllerError', {
      status: err.status,
      code: err.code,
      data: err.data,
      path: req.originalUrl,
    });
    res.status(err.status).json(err.toJSON());
    return;
  }

  if (err instanceof NoResultError) {
    logger.warn('NoResultError', { path: req.originalUrl });
    res.status(404).json({
      code: 'NoResultError',
      message: 'Resource not found',
      data: err,
    });
    return;
  }

  if (err instanceof DatabaseError) {
    // TODO: Handle this elsewhere in AEGIS-23
    const CODE_TO_HTTP: Record<string, number> = {
      // fine-grained first
      [PostgresError.READ_ONLY_SQL_TRANSACTION]: 405, // 25006
      [PostgresError.NOT_NULL_VIOLATION]: 400, // 23502
      [PostgresError.CHECK_VIOLATION]: 422, // 23514
      [PostgresError.RAISE_EXCEPTION]: 400, // P0001
    };
    const CLASS_TO_HTTP: Record<string, number> = {
      // List all recommended non-500 errors
      '08': 503,
      '0L': 403,
      '0P': 403,
      '20': 400,
      '21': 400,
      '22': 400,
      '23': 409,
      '24': 400,
      '26': 400,
      '27': 422,
      '28': 403,
      '2B': 409,
      '2F': 400,
      '53': 503,
    };
    const httpStatusForPg = (sqlErrorCode: string | undefined): number => {
      if (!sqlErrorCode) return 500;
      if (CODE_TO_HTTP[sqlErrorCode]) return CODE_TO_HTTP[sqlErrorCode];
      const code = sqlErrorCode.slice(0, 2);
      return CLASS_TO_HTTP[code] ?? 500;
    };
    const httpStatusCode = httpStatusForPg(err.code);

    if (httpStatusCode.toString()[0] === '4') {
      logger.warn('DatabaseClientError', err);
      res.status(httpStatusCode).json({
        code: 'DatabaseError',
        message: err.detail,
        data: {
          pgsqlCode: err.code,
          table: err.table,
          constraint: err.constraint,
        },
      });
      return;
    } else {
      logger.error('DatabaseServerError', err);
      res.status(httpStatusCode).json({
        code: 'DatabaseError',
        message: err.detail,
        data: {
          pgsqlCode: err.code,
          table: err.table,
          constraint: err.constraint,
        },
      });
      return;
    }
  }

  // Not a specified error — pass to the catch-all
  next(err);
});

// 5) Catch-all: any uncaught error becomes 500
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error('UnhandledError', `Exception type: ${typeof err}`, {
    err,
    path: req.originalUrl,
  });
  res.status(500).json({
    code: 'Internal',
    message: 'Internal Server Error',
  });
});

export default app;
