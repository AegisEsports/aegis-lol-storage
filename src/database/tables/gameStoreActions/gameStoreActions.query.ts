import type { Kysely } from 'kysely';

import { GAME_STORE_ACTIONS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertGameStoreAction,
  type GameStoreActionRow,
} from '@/database/schema.js';

export class GameStoreActionsQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
    id: string,
  ): Promise<GameStoreActionRow | undefined> {
    return db
      .selectFrom(GAME_STORE_ACTIONS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
    id: string,
  ): Promise<GameStoreActionRow | undefined> {
    return db
      .deleteFrom(GAME_STORE_ACTIONS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
