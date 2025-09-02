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
  riot_puuid: string;
  user_id: string | null;
  game_name: string | null;
  tag_line: string | null;
  profile_icon_id: number | null;
  summoner_level: number | null;
  revision_date: Date | null;
  main_account: boolean | null;
}

export const RIOT_ACCOUNTS = 'riot_accounts';

export const createRiotAccountsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, RIOT_ACCOUNTS, (t) =>
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
      .addUniqueConstraint(`uq_${RIOT_ACCOUNTS}_riot_puuid`, ['riot_puuid']),
  );
};

export type RiotAccountDb = Selectable<RiotAccountsTable>;
export type NewRiotAccountDb = Insertable<RiotAccountsTable>;
export type UpdateRiotAccountDb = Updateable<RiotAccountsTable>;
