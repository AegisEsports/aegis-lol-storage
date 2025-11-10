import type { Kysely, Transaction } from 'kysely';

import type { Database } from '@/database/database.js';

export type DbType = Kysely<Database> | Transaction<Database>;
