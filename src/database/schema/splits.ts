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
import type { LeagueRank } from './shared/types.js';

export interface SplitsTable extends TableBase {
  name: string | null;
  league_id: string | null;
  split_abbreviation: string | null;
  split_time: string | null;
  split_rank: LeagueRank | null;
  riot_tournament_id: number | null;
  official_sheet_url: string | null;
  active: boolean | null;
}

export const SPLITS = 'splits';

export const createSplitsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, SPLITS, (t) =>
    t
      .addColumn('name', 'varchar')
      .addColumn('league_id', 'uuid', (col) =>
        col
          .references(`${LEAGUES}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('split_abbreviation', 'varchar')
      .addColumn('split_time', 'varchar')
      .addColumn('split_rank', 'varchar')
      .addColumn('riot_tournament_id', 'int4')
      .addColumn('official_sheet_url', 'varchar')
      .addColumn('active', 'boolean'),
  );
};

export type SplitDb = Selectable<SplitsTable>;
export type NewSplitDb = Insertable<SplitsTable>;
export type UpdateSplitDb = Updateable<SplitsTable>;
