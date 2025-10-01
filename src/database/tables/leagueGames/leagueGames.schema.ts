import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  LEAGUE_GAMES_SNAKE_CASE,
  LEAGUE_MATCHES_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  LEAGUE_SIDES,
  type TableBase,
} from '@/database/shared.js';

export const leagueGameRowSchema = z.strictObject({
  leagueMatchId: z.uuid().nullable(),
  invalidated: z.coerce.boolean().nullable(),
  patch: z.string().nullable(),
  blueTeamId: z.uuid().nullable(),
  redTeamId: z.uuid().nullable(),
  sideWin: z.enum(LEAGUE_SIDES).nullable(),
  duration: z.coerce.number().int().nullable(),
  startedAt: z.iso.date().nullable(),
});
type LeagueGameFields = z.infer<typeof leagueGameRowSchema>;
export type LeagueGamesTable = TableBase & LeagueGameFields;

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
        col.notNull().defaultTo(false),
      )
      .addColumn('patch', 'varchar')
      .addColumn('blue_team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('red_team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('side_win', 'varchar(4)')
      .addColumn('duration', 'int2')
      .addColumn('started_at', 'timestamptz'),
  );
};

export type LeagueGameRow = Selectable<LeagueGamesTable>;
export type InsertLeagueGame = Insertable<LeagueGamesTable>;
export type UpdateLeagueGame = Updateable<LeagueGamesTable>;
