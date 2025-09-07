import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_MATCHES_SNAKE_CASE } from './leagueMatches.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import { TEAMS } from './teams.js';

export interface LeagueGamesTable extends TableBase {
  leagueMatchId: string | null;
  invalidated: boolean | null;
  patch: string | null;
  blueTeamId: string | null;
  redTeamId: string | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  duration: number | null;
  timestampStart: Date | null;
}

export const LEAGUE_GAMES = 'leagueGames';
export const LEAGUE_GAMES_SNAKE_CASE = 'league_games';

export const createLeagueGamesTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUE_GAMES_SNAKE_CASE, (t) =>
    t
      .addColumn('league_match_id', 'uuid', (col) =>
        col
          .references(`${LEAGUE_MATCHES_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('invalidated', 'boolean', (col) =>
        col.notNull().defaultTo(true),
      )
      .addColumn('patch', 'varchar')
      .addColumn('blue_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('red_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('winner_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('loser_team_id', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('duration', 'int2')
      .addColumn('timestamp_start', 'timestamptz'),
  );
};

export type LeagueGameRow = Selectable<LeagueGamesTable>;
export type InsertLeagueGame = Insertable<LeagueGamesTable>;
export type UpdateLeagueGame = Updateable<LeagueGamesTable>;
