import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  DISCORD_ACCOUNTS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const discordAccountRowSchema = z.strictObject({
  snowflakeId: z.string(),
  userId: z.uuid().nullable(),
  userName: z.string().nullable(),
});

type DiscordAccountFields = z.infer<typeof discordAccountRowSchema>;

export interface DiscordAccountsTable extends DiscordAccountFields, TableBase {}

export const createDiscordAccountsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, DISCORD_ACCOUNTS_SNAKE_CASE, (t) =>
    t
      .addColumn('snowflake_id', 'varchar', (col) => col.notNull())
      .addColumn('user_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
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
