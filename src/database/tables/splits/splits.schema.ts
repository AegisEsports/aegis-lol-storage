import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import { LEAGUES_SNAKE_CASE, SPLITS_SNAKE_CASE } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  LEAGUE_RANKS,
  type TableBase,
} from '@/database/shared.js';

export const splitRowSchema = z.strictObject({
  name: z.string().nullable(),
  leagueId: z.uuid().nullable(),
  splitAbbreviation: z.string().nullable(),
  splitTime: z.string().nullable(),
  splitRank: z.enum(LEAGUE_RANKS).nullable(),
  riotTournamentId: z.coerce.number().int().nullable(),
  officialSheetUrl: z.string().nullable(),
  active: z.coerce.boolean().nullable(),
});

type SplitFields = z.infer<typeof splitRowSchema>;

export type SplitsTable = TableBase & SplitFields;

export const createSplitsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, SPLITS_SNAKE_CASE, (t) =>
    t
      .addColumn('name', 'varchar')
      .addColumn('league_id', 'uuid', (col) =>
        col
          .references(`${LEAGUES_SNAKE_CASE}.id`)
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
