import { GAME_SKILL_LEVEL_UPS } from '@/database/const.js';
import {
  type InsertGameSkillLevelUp,
  type GameSkillLevelUpRow,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class GameSkillLevelUpsQuery {
  // -- INSERT

  static insert(
    db: DbType,
    values: InsertGameSkillLevelUp,
  ): Promise<GameSkillLevelUpRow> {
    return db
      .insertInto(GAME_SKILL_LEVEL_UPS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: DbType,
    id: string,
  ): Promise<GameSkillLevelUpRow | undefined> {
    return db
      .selectFrom(GAME_SKILL_LEVEL_UPS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(
    db: DbType,
    gameId: string,
  ): Promise<GameSkillLevelUpRow[]> {
    return db
      .selectFrom(GAME_SKILL_LEVEL_UPS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .orderBy('riotPuuid', 'asc')
      .orderBy('gameTimestamp', 'asc')
      .execute();
  }

  // -- UPDATE

  // -- DELETE

  static deleteById(
    db: DbType,
    id: string,
  ): Promise<GameSkillLevelUpRow | undefined> {
    return db
      .deleteFrom(GAME_SKILL_LEVEL_UPS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
