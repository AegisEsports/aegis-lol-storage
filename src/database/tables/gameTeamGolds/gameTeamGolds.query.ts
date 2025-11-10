import type { Kysely } from 'kysely';

import { GAME_TEAM_GOLDS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertGameTeamGold,
  type GameTeamGoldRow,
} from '@/database/schema.js';
import type { LeagueSide } from '@/database/shared.js';

export class GameTeamGoldsQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
    id: string,
  ): Promise<GameTeamGoldRow | undefined> {
    return db
      .selectFrom(GAME_TEAM_GOLDS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(
    db: Kysely<Database>,
    gameId: string,
  ): Promise<GameTeamGoldRow[]> {
    return db
      .selectFrom(GAME_TEAM_GOLDS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .orderBy('minute', 'asc')
      .execute();
  }

  // -- UPDATE (not updateable)

  static async setTeamId(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
    id: string,
  ): Promise<GameTeamGoldRow | undefined> {
    return db
      .deleteFrom(GAME_TEAM_GOLDS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
