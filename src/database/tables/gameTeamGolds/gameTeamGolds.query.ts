import { GAME_TEAM_GOLDS } from '@/database/const.js';
import {
  type InsertGameTeamGold,
  type GameTeamGoldRow,
} from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';
import type { DbType } from '@/database/types.js';

export class GameTeamGoldsQuery {
  // -- INSERT

  static insert(
    db: DbType,
    values: InsertGameTeamGold,
  ): Promise<GameTeamGoldRow> {
    return db
      .insertInto(GAME_TEAM_GOLDS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: DbType,
    id: string,
  ): Promise<GameTeamGoldRow | undefined> {
    return db
      .selectFrom(GAME_TEAM_GOLDS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(db: DbType, gameId: string): Promise<GameTeamGoldRow[]> {
    return db
      .selectFrom(GAME_TEAM_GOLDS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .orderBy('minute', 'asc')
      .execute();
  }

  // -- UPDATE (not updateable)

  static async setTeamId(
    db: DbType,
    gameId: string,
    side: LeagueSide,
    teamId: string,
  ) {
    await db
      .updateTable(GAME_TEAM_GOLDS)
      .where('leagueGameId', '=', gameId)
      .where('side', '=', side)
      .set({ teamId })
      .executeTakeFirstOrThrow();
  }

  // -- DELETE

  static deleteById(
    db: DbType,
    id: string,
  ): Promise<GameTeamGoldRow | undefined> {
    return db
      .deleteFrom(GAME_TEAM_GOLDS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
