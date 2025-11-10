import { GAME_STORE_ACTIONS } from '@/database/const.js';
import {
  type InsertGameStoreAction,
  type GameStoreActionRow,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class GameStoreActionsQuery {
  // -- INSERT

  static insert(
    db: DbType,
    values: InsertGameStoreAction,
  ): Promise<GameStoreActionRow> {
    return db
      .insertInto(GAME_STORE_ACTIONS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: DbType,
    id: string,
  ): Promise<GameStoreActionRow | undefined> {
    return db
      .selectFrom(GAME_STORE_ACTIONS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(
    db: DbType,
    gameId: string,
  ): Promise<GameStoreActionRow[]> {
    return db
      .selectFrom(GAME_STORE_ACTIONS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .orderBy('gameTimestamp', 'asc')
      .execute();
  }

  // -- UPDATE

  // -- DELETE

  static deleteById(
    db: DbType,
    id: string,
  ): Promise<GameStoreActionRow | undefined> {
    return db
      .deleteFrom(GAME_STORE_ACTIONS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
