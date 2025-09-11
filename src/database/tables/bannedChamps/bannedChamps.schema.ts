import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  BANNED_CHAMPS_SNAKE_CASE,
  LEAGUE_GAMES_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  LEAGUE_SIDES,
  type TableBase,
} from '@/database/shared.js';

export const bannedChampRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  order: z.coerce.number().int().nullable(),
  sideBannedBy: z.enum(LEAGUE_SIDES).nullable(),
  teamIdBanned: z.uuid().nullable(),
  teamIdAgainst: z.uuid().nullable(),
  champId: z.coerce.number().int().nullable(),
  champName: z.string().min(1).nullable(),
});

type BannedChampFields = z.infer<typeof bannedChampRowSchema>;

export interface BannedChampsTable extends BannedChampFields, TableBase {}

export const createBannedChampsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, BANNED_CHAMPS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES_SNAKE_CASE}.id`)
          .onDelete('cascade'),
      )
      .addColumn('order', 'int2')
      .addColumn('side_banned_by', 'varchar')
      .addColumn('team_id_banned', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_id_against', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('champ_id', 'int2')
      .addColumn('champ_name', 'varchar'),
  );
};

export type BannedChampRow = Selectable<BannedChampsTable>;
export type InsertBannedChamp = Insertable<BannedChampsTable>;
export type UpdateBannedChamp = Updateable<BannedChampsTable>;
