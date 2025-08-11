import { Kysely, PostgresDialect } from 'kysely';

import pool from '@/config/pool.js';

// Define database schema here
export interface Database {
  // Example:
  users: {
    id: string;
    name: string;
    created_at: Date;
  };
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
});
