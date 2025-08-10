// import { db } from '@database/database';
import compression from 'compression';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// 1) Parse JSON bodies
app.use(express.json());

// 2) Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 3) Standard middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));

// 4) Mount API routes
// app.use('/api', routes);

// 5) 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// 6) Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // console.error(err); // will use winston instead
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
});

export default app;
