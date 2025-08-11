import compression from 'compression';
import cors from 'cors';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { CREDENTIALS, LOG_FORMAT, ORIGIN } from './config/env.js';
import { logger, stream } from './util/logger.js';

const app = express();

// 1) Parse JSON bodies
app.use(express.json());

// 2) Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 3) Standard middleware
app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(LOG_FORMAT, { stream }));

// 4) Mount API routes
// app.use('/api', routes);

// 5) 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// 6) Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export default app;
