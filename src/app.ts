import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

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

// 4b) Handle ONLY ControllerError (let everything else fall through)
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
  // Not a ControllerError — pass to the catch-all
  next(err);
});

// 4c) Handle connection refusal to the database
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
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
});

// 5) Catch-all: any uncaught error becomes 500
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error('UnhandledError', { err, path: req.originalUrl });
  res.status(500).json({
    error: { code: 'Internal', message: 'Internal Server Error' },
  });
});

export default app;
