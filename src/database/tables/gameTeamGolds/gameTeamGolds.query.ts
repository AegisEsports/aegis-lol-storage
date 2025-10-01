import { GAME_TEAM_GOLDS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertGameTeamGold,
  type GameTeamGoldRow,
} from '@/database/schema.js';

export class GameTeamGoldsQuery {
  // -- INSERT

  static insert(values: InsertGameTeamGold): Promise<GameTeamGoldRow> {
    return db
      .insertInto(GAME_TEAM_GOLDS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<GameTeamGoldRow | undefined> {
    return db
      .selectFrom(GAME_TEAM_GOLDS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  // -- DELETE

  static deleteById(id: string): Promise<GameTeamGoldRow | undefined> {
    return db
      .deleteFrom(GAME_TEAM_GOLDS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
