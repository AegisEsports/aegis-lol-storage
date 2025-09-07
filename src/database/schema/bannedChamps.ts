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
import type { LeagueSide } from './shared/types.js';
import { TEAMS } from './teams.js';

export interface BannedChampsTable extends TableBase {
  leagueGameId: string;
  order: number | null;
  sideBannedBy: LeagueSide | null;
  teamIdBanned: string | null;
  teamIdAgainst: string | null;
  champId: number | null;
  champName: string | null;
}

export const BANNED_CHAMPS = 'bannedChamps';
export const BANNED_CHAMPS_SNAKE_CASE = 'banned_champs';

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
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('team_id_against', 'uuid', (col) =>
        col.references(`${TEAMS}.id`).onDelete('set null').onUpdate('cascade'),
      )
      .addColumn('champ_id', 'int2')
      .addColumn('champ_name', 'varchar'),
  );
};

export type BannedChampRow = Selectable<BannedChampsTable>;
export type InsertBannedChamp = Insertable<BannedChampsTable>;
export type UpdateBannedChamp = Updateable<BannedChampsTable>;
