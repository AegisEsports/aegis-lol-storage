import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_MATCHES } from './leagueMatches.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';
import { TEAMS } from './teams.js';

export interface LeagueGamesTable extends TableBase {
  league_match_id: string | null;
  invalidated: boolean | null;
  patch: string | null;
  blue_team_id: string | null;
  red_team_id: string | null;
  winner_team_id: string | null;
  loser_team_id: string | null;
  duration: number | null;
  timestamp_start: Date | null;
}

export const LEAGUE_GAMES = 'league_games';

export const createLeagueGamesTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUE_GAMES, (t) =>
    t
      .addColumn('league_match_id', 'uuid', (col) =>
        col
          .references(`${LEAGUE_MATCHES}.id`)
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

export type LeagueGames = Selectable<LeagueGamesTable>;
export type NewLeagueGames = Insertable<LeagueGamesTable>;
export type UpdateLeagueGames = Updateable<LeagueGamesTable>;
