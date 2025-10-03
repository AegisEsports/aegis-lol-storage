import getEnv from '@/util/getEnv.js';

// Node
export const NODE_ENV = getEnv('NODE_ENV');

// Server
export const SERVER_PORT = parseInt(getEnv('SERVER_PORT'), 10) ?? 3000;

// Database
export const DB_USER = getEnv('DB_USER');
export const DB_NAME = getEnv('DB_NAME');
export const DB_PASSWORD = getEnv('DB_PASSWORD');
export const DB_PORT = parseInt(getEnv('DB_PORT'), 10) ?? 5432;
export const DB_HOST = getEnv('DB_HOST');
export const DB_MAX_HOSTS = parseInt(getEnv('DB_MAX_HOSTS'), 10) ?? 10;

// Logging
export const LOG_DIR = getEnv('LOG_DIR');
export const LOG_FORMAT = getEnv('LOG_FORMAT');

// CORS
export const ORIGIN = getEnv('ORIGIN');
export const CREDENTIALS = Boolean(getEnv('CREDENTIALS'));

// Riot API
export const RIOT_API_KEY = getEnv('RIOT_API_KEY');
