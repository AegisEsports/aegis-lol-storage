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

export interface RiotAccountsTable extends TableBase {
  riotPuuid: string;
  userId: string | null;
  gameName: string | null;
  tagLine: string | null;
  profileIconId: number | null;
  summonerLevel: number | null;
  revisionDate: Date | null;
  mainAccount: boolean | null;
}

export const RIOT_ACCOUNTS = 'riotAccounts';
export const RIOT_ACCOUNTS_SNAKE_CASE = 'riot_accounts';

export const createRiotAccountsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, RIOT_ACCOUNTS_SNAKE_CASE, (t) =>
    t
      .addColumn('riot_puuid', 'varchar', (col) => col.notNull())
      .addColumn('user_id', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('game_name', 'varchar')
      .addColumn('tag_line', 'varchar')
      .addColumn('profile_icon_id', 'int4')
      .addColumn('summoner_level', 'int2')
      .addColumn('revision_date', 'timestamptz')
      .addColumn('main_account', 'boolean')
      .addUniqueConstraint(`uq_${RIOT_ACCOUNTS_SNAKE_CASE}_riot_puuid`, [
        'riot_puuid',
      ]),
  );
};

export type RiotAccountRow = Selectable<RiotAccountsTable>;
export type InsertRiotAccount = Insertable<RiotAccountsTable>;
export type UpdateRiotAccount = Updateable<RiotAccountsTable>;
