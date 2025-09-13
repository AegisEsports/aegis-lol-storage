import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  RIOT_MATCH_DATA_SNAKE_CASE,
  LEAGUE_GAMES_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const riotMatchDataRowSchema = z.strictObject({
  riotMatchId: z.coerce.number().int(),
  leagueGameId: z.uuid(),
  rawMatchData: z.record(z.string(), z.unknown()).nullable(),
  rawTimelineData: z.record(z.string(), z.unknown()).nullable(),
});
type RiotMatchDataFields = z.infer<typeof riotMatchDataRowSchema>;
export type RiotMatchDataTable = TableBase & RiotMatchDataFields;

export const createRiotMatchDataTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, RIOT_MATCH_DATA_SNAKE_CASE, (t) =>
    t
      .addColumn('riot_match_id', 'varchar', (col) => col.notNull())
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES_SNAKE_CASE}.id`)
          .onDelete('cascade')
          .onUpdate('cascade'),
      )
      .addColumn('raw_match_data', 'json')
      .addColumn('raw_timeline_data', 'json'),
  );
};

export type RiotMatchDataRow = Selectable<RiotMatchDataTable>;
export type InsertRiotMatchData = Insertable<RiotMatchDataTable>;
export type UpdateRiotMatchData = Updateable<RiotMatchDataTable>;
