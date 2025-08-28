import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import type { BestOf, MatchType } from './shared/types.js';
import { SPLITS } from './splits.js';
import { TEAMS } from './teams.js';

export interface LeagueMatchesTable extends TableBase {
  home_team_id: string | null;
  away_team_id: string | null;
  winner_team_id: string | null;
  loser_team_id: string | null;
  split_id: string | null;
  best_of: BestOf | null;
  home_score: number | null;
  away_score: number | null;
  match_type: MatchType | null;
  week_number: number | null;
  schedule_timestamp: Date | null;
}

export const LEAGUE_MATCHES = 'league_matches';

export const createLeagueMatchesTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUE_MATCHES, (t) =>
    t
      .addColumn('home_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('away_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('winner_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('loser_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('split_id', 'uuid', (col) =>
        col.references(`${SPLITS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('best_of', 'int2')
      .addColumn('home_score', 'int2')
      .addColumn('away_score', 'int2')
      .addColumn('match_type', 'varchar')
      .addColumn('week_number', 'varchar')
      .addColumn('schedule_timestamp', 'timestamptz'),
  );
};

export type LeagueMatche = Selectable<LeagueMatchesTable>;
export type NewLeagueMatche = Insertable<LeagueMatchesTable>;
export type UpdateLeagueMatche = Updateable<LeagueMatchesTable>;
