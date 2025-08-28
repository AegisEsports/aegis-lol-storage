import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import { USERS } from './users.js';

export interface DiscordAccountsTable extends TableBase {
  snowflake_id: string | null;
  user_id: string | null;
  user_name: string | null;
}

export const DISCORD_ACCOUNTS = 'discord_accounts';

export const createDiscordAccountsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, DISCORD_ACCOUNTS, (t) =>
    t
      .addColumn('snowflake_id', 'varchar')
      .addColumn('user_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('user_name', 'varchar')
      .addUniqueConstraint(`uq_${DISCORD_ACCOUNTS}_snowflake_id`, [
        'snowflake_id',
      ]),
  );
};

export type DiscordAccount = Selectable<DiscordAccountsTable>;
export type NewDiscordAccount = Insertable<DiscordAccountsTable>;
export type UpdateDiscordAccount = Updateable<DiscordAccountsTable>;
