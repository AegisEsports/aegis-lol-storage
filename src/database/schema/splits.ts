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
  leagueId: string | null;
  splitAbbreviation: string | null;
  splitTime: string | null;
  splitRank: LeagueRank | null;
  riotTournamentId: number | null;
  officialSheetUrl: string | null;
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

export type SplitRow = Selectable<SplitsTable>;
export type InsertSplit = Insertable<SplitsTable>;
export type UpdateSplit = Updateable<SplitsTable>;
