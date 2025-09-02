import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import type { Database } from '@/database/database.js';
import { LEAGUE_GAMES } from './leagueGames.js';
import type { TableBase } from './shared/base.js';
import { createTableWithBase } from './shared/helpers.js';

export interface RiotMatchDataTable extends TableBase {
  riot_match_id: number | null;
  league_game_id: string | null;
  raw_match_data: object | null;
  raw_timeline_data: object | null;
}

export const RIOT_MATCH_DATA = 'riot_match_data';

export const createRiotMatchDataTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, RIOT_MATCH_DATA, (t) =>
    t
      .addColumn('riot_match_id', 'varchar', (col) => col.notNull())
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .references(`${LEAGUE_GAMES}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('raw_match_data', 'json')
      .addColumn('raw_timeline_data', 'json'),
  );
};

export type RiotMatchDataDb = Selectable<RiotMatchDataTable>;
export type NewRiotMatchDataDb = Insertable<RiotMatchDataTable>;
export type UpdateRiotMatchDataDb = Updateable<RiotMatchDataTable>;
