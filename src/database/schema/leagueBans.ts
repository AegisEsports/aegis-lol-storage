import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUES } from './leagues.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import { TEAMS } from './teams.js';
import { USERS } from './users.js';

export interface LeagueBansTable extends TableBase {
  leagueId: string | null;
  teamIdBanned: string | null;
  userIdBanned: string | null;
}

export const LEAGUE_BANS = 'leagueBans';
export const LEAGUE_BANS_SNAKE_CASE = 'league_bans';

export const createLeagueBansTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUE_BANS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_id', 'uuid', (col) =>
        col
          .references(`${LEAGUES}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_id_banned', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('user_id_banned', 'uuid', (col) =>
        col.references(`${USERS}.id`).onDelete('set null').onUpdate('cascade'),
      ),
  );
};

export type LeagueBanRow = Selectable<LeagueBansTable>;
export type InsertLeagueBan = Insertable<LeagueBansTable>;
export type UpdateLeagueBan = Updateable<LeagueBansTable>;
