import { Pool, PoolConfig } from 'pg';

import getEnv from '@/util/getEnv';

const poolConfig: PoolConfig = {
  user: getEnv('DB_USER'),
  database: getEnv('DB_NAME'),
  password: getEnv('DB_PASSWORD'),
  port: parseInt(getEnv('DB_PORT'), 10),
  host: getEnv('DB_HOST'),
  keepAlive: true,
  ssl:
    getEnv('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  keepAliveInitialDelayMillis: 3000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 15000,
  query_timeout: 30000,
  max: parseInt(getEnv('MAX_HOSTS'), 10),
  idleTimeoutMillis: 30000,
  maxLifetimeSeconds: 60,
  maxUses: 7500,
};

const pool = new Pool(poolConfig);

export default pool;
