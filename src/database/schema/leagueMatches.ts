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
  homeTeamId: string | null;
  awayTeamId: string | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  splitId: string | null;
  bestOf: BestOf | null;
  homeScore: number | null;
  awayScore: number | null;
  matchType: MatchType | null;
  weekNumber: number | null;
  scheduleTimestamp: Date | null;
}

export const LEAGUE_MATCHES = 'leagueMatches';
export const LEAGUE_MATCHES_SNAKE_CASE = 'league_matches';

export const createLeagueMatchesTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUE_MATCHES_SNAKE_CASE, (t) =>
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

export type LeagueMatchRow = Selectable<LeagueMatchesTable>;
export type InsertLeagueMatch = Insertable<LeagueMatchesTable>;
export type UpdateLeagueMatch = Updateable<LeagueMatchesTable>;
