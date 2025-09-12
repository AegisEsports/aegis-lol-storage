import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  LEAGUE_MATCHES_SNAKE_CASE,
  SPLITS_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  BEST_OFS,
  createTableWithBase,
  MATCH_TYPES,
  type TableBase,
} from '@/database/shared.js';

export const leagueMatchRowSchema = z.strictObject({
  homeTeamId: z.uuid().nullable(),
  awayTeamId: z.uuid().nullable(),
  homeScore: z.coerce.number().int().nullable(),
  awayScore: z.coerce.number().int().nullable(),
  splitId: z.uuid().nullable(),
  bestOf: z.coerce.number().pipe(z.union(BEST_OFS.map((n) => z.literal(n)))),
  matchType: z.enum(MATCH_TYPES).nullable(),
  weekNumber: z.coerce.number().int().nullable(),
  scheduledAt: z.iso.date().nullable(),
});

type LeagueMatchFields = z.infer<typeof leagueMatchRowSchema>;

export type LeagueMatchesTable = TableBase & LeagueMatchFields;

export const createLeagueMatchesTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUE_MATCHES_SNAKE_CASE, (t) =>
    t
      .addColumn('home_team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('away_team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('home_score', 'int2')
      .addColumn('away_score', 'int2')
      .addColumn('split_id', 'uuid', (col) =>
        col
          .references(`${SPLITS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('best_of', 'int2')
      .addColumn('match_type', 'varchar')
      .addColumn('week_number', 'varchar')
      .addColumn('scheduled_at', 'timestamptz'),
  );
};

export type LeagueMatchRow = Selectable<LeagueMatchesTable>;
export type InsertLeagueMatch = Insertable<LeagueMatchesTable>;
export type UpdateLeagueMatch = Updateable<LeagueMatchesTable>;
