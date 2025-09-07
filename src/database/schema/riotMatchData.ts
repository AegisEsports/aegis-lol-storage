import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_GAMES_SNAKE_CASE } from './leagueGames.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';

export interface RiotMatchDataTable extends TableBase {
  riotMatchId: number;
  leagueGameId: string;
  rawMatchData: object | null;
  rawTimelineData: object | null;
}

export const RIOT_MATCH_DATA = 'riotMatchData';
export const RIOT_MATCH_DATA_SNAKE_CASE = 'riot_match_data';

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
