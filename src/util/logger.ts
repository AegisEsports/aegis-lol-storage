import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LOG_DIR, NODE_ENV } from '@/config/env.js';

// ── Paths (avoid __dirname vs ESM gotchas) ────────────────────────────────────
const logRoot = join(process.cwd(), LOG_DIR || 'logs');
const infoDir = join(logRoot, 'info');
const errorDir = join(logRoot, 'error');
const combinedDir = join(logRoot, 'combined');

// Ensure directories exist
for (const dir of [logRoot, infoDir, errorDir, combinedDir]) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// ── Helpers to filter by level ────────────────────────────────────────────────
const filterOnly = (level: string) =>
  winston.format((info) => (info.level === level ? info : false))();

const filterExcept = (levels: string[]) =>
  winston.format((info) => (levels.includes(info.level) ? false : info))();

// ── Formats ──────────────────────────────────────────────────────────────────
const dropExceptions = winston.format((info) =>
  info.exception ? false : info,
)();

const fileLine = winston.format.printf(
  ({ timestamp, level, message, stack, ...meta }) => {
    const isException = meta.exception === true;
    if (isException && typeof stack === 'string') {
      return `${timestamp} ${level}: ${stack}`;
    }
    const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return stack
      ? `${timestamp} ${level}: ${message}\n${stack}${rest}`
      : `${timestamp} ${level}: ${message}${rest}`;
  },
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  fileLine,
);

// Console colors
winston.addColors({
  error: 'red bold',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'grey',
});

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) =>
    stack
      ? `${timestamp} ${level}: ${message}\n${stack}`
      : `${timestamp} ${level}: ${message}`,
  ),
);

// ── Logger ───────────────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'silly',
  format: winston.format.combine(winston.format.errors({ stack: true })),

  transports: [
    // info-only file
    new DailyRotateFile({
      dirname: infoDir,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      level: 'info',
      format: winston.format.combine(
        dropExceptions,
        filterOnly('info'),
        fileFormat,
      ),
    }),

    // error-only file (no ANSI color in files)
    new DailyRotateFile({
      dirname: errorDir,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      level: 'error',
      handleExceptions: true,
      format: winston.format.combine(filterOnly('error'), fileFormat),
    }),

    // everything except info & error
    new DailyRotateFile({
      dirname: combinedDir,
      filename: '%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      zippedArchive: true,
      level: 'silly',
      format: winston.format.combine(
        dropExceptions,
        filterExcept(['info', 'error']),
        fileFormat,
      ),
    }),

    // pretty console (errors show in red)
    new winston.transports.Console({
      level: NODE_ENV === 'production' ? 'info' : 'silly',
      format: consoleFormat,
    }),
  ],
  exitOnError: true,
});

// Morgan stream (HTTP logs → info-only)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
