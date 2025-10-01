import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  GAME_TEAM_GOLDS_SNAKE_CASE,
  LEAGUE_GAMES_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  LEAGUE_SIDES,
  type TableBase,
} from '@/database/shared.js';

export const gameTeamGoldRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  teamId: z.uuid().nullable(),
  minute: z.coerce.number().int().nullable(),
  side: z.enum(LEAGUE_SIDES).nullable(),
  gold: z.coerce.number().int().nullable(),
});
type GameTeamGoldFields = z.infer<typeof gameTeamGoldRowSchema>;
export type GameTeamGoldsTable = TableBase & GameTeamGoldFields;

export const createGameTeamGoldsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, GAME_TEAM_GOLDS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES_SNAKE_CASE}.id`)
          .onDelete('cascade')
          .onUpdate('cascade'),
      )
      .addColumn('team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('minute', 'int2')
      .addColumn('side', 'varchar')
      .addColumn('gold', 'int4'),
  );
};

export type GameTeamGoldRow = Selectable<GameTeamGoldsTable>;
export type InsertGameTeamGold = Insertable<GameTeamGoldsTable>;
export type UpdateGameTeamGold = Updateable<GameTeamGoldsTable>;
