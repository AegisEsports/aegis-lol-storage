import { Pool, types, type PoolConfig } from 'pg';

import {
  DB_HOST,
  DB_MAX_HOSTS,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  NODE_ENV,
} from './env.js';

// NUMERIC/DECIMAL (OID 1700) -> JS number
types.setTypeParser(types.builtins.NUMERIC, (v) =>
  v === null ? null : parseFloat(v),
);

// BIGINT/INT8 (OID 20) -> JS number (ok if values stay within Number.MAX_SAFE_INTEGER)
types.setTypeParser(types.builtins.INT8, (v) =>
  v === null ? null : parseInt(v, 10),
);

const poolConfig: PoolConfig = {
  user: DB_USER,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  host: DB_HOST,
  keepAlive: true,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  keepAliveInitialDelayMillis: 3000,
  connectionTimeoutMillis: 2000,
  statement_timeout: 15000,
  query_timeout: 30000,
  max: DB_MAX_HOSTS,
  idleTimeoutMillis: 30000,
  maxLifetimeSeconds: 60,
  maxUses: 7500,
};

const pool = new Pool(poolConfig);

export default pool;
