import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  RIOT_ACCOUNTS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const riotAccountRowSchema = z.strictObject({
  riotPuuid: z.string(),
  userId: z.uuid().nullable(),
  gameName: z.string().nullable(),
  tagLine: z.string().nullable(),
  profileIconId: z.coerce.number().int().nullable(),
  summonerLevel: z.coerce.number().int().nullable(),
  revisionDate: z.iso.date().nullable(),
  mainAccount: z.coerce.boolean(),
});

type RiotAccountFields = z.infer<typeof riotAccountRowSchema>;

export interface RiotAccountsTable extends RiotAccountFields, TableBase {}

export const createRiotAccountsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, RIOT_ACCOUNTS_SNAKE_CASE, (t) =>
    t
      .addColumn('riot_puuid', 'varchar', (col) => col.notNull())
      .addColumn('user_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('game_name', 'varchar')
      .addColumn('tag_line', 'varchar')
      .addColumn('profile_icon_id', 'int4')
      .addColumn('summoner_level', 'int2')
      .addColumn('revision_date', 'timestamptz')
      .addColumn('main_account', 'boolean', (col) => col.defaultTo(false))
      .addUniqueConstraint(`uq_${RIOT_ACCOUNTS_SNAKE_CASE}_riot_puuid`, [
        'riot_puuid',
      ]),
  );
};

export type RiotAccountRow = Selectable<RiotAccountsTable>;
export type InsertRiotAccount = Insertable<RiotAccountsTable>;
export type UpdateRiotAccount = Updateable<RiotAccountsTable>;
