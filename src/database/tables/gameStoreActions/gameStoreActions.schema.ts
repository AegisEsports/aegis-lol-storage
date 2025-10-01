import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  GAME_STORE_ACTIONS_SNAKE_CASE,
  LEAGUE_GAMES_SNAKE_CASE,
  RIOT_ACCOUNTS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  STORE_ACTION_TYPES,
  type TableBase,
} from '@/database/shared.js';

export const gameStoreActionRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  riotPuuid: z.string().nullable(),
  champId: z.coerce.number().int().nullable(),
  gameTimestamp: z.coerce.number().int().nullable(),
  type: z.enum(STORE_ACTION_TYPES),
  itemId: z.coerce.number().int().nullable(),
});
type GameStoreActionFields = z.infer<typeof gameStoreActionRowSchema>;
export type GameStoreActionsTable = TableBase & GameStoreActionFields;

export const createGameStoreActionsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, GAME_STORE_ACTIONS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_game_id', 'uuid', (col) =>
        col
          .notNull()
          .references(`${LEAGUE_GAMES_SNAKE_CASE}.id`)
          .onDelete('cascade')
          .onUpdate('cascade'),
      )
      .addColumn('riot_puuid', 'varchar', (col) =>
        col
          .references(`${RIOT_ACCOUNTS_SNAKE_CASE}.riot_puuid`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('champ_id', 'int2')
      .addColumn('game_timestamp', 'int4')
      .addColumn('type', 'varchar')
      .addColumn('item_id', 'int4'),
  );
};

export type GameStoreActionRow = Selectable<GameStoreActionsTable>;
export type InsertGameStoreAction = Insertable<GameStoreActionsTable>;
export type UpdateGameStoreAction = Updateable<GameStoreActionsTable>;
