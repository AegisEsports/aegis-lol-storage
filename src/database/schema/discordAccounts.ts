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
  snowflakeId: string;
  userId: string | null;
  userName: string | null;
}

export const DISCORD_ACCOUNTS = 'discordAccounts';
export const DISCORD_ACCOUNTS_SNAKE_CASE = 'discord_accounts';

export const createDiscordAccountsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, DISCORD_ACCOUNTS_SNAKE_CASE, (t) =>
    t
      .addColumn('snowflake_id', 'varchar', (col) => col.notNull())
      .addColumn('user_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('user_name', 'varchar')
      .addUniqueConstraint(`uq_${DISCORD_ACCOUNTS_SNAKE_CASE}_snowflakeId`, [
        'snowflake_id',
      ]),
  );
};

export type DiscordAccountRow = Selectable<DiscordAccountsTable>;
export type InsertDiscordAccount = Insertable<DiscordAccountsTable>;
export type UpdateDiscordAccount = Updateable<DiscordAccountsTable>;
