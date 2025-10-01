import { GAME_SKILL_LEVEL_UPS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertGameSkillLevelUp,
  type GameSkillLevelUpRow,
} from '@/database/schema.js';

export class GameSkillLevelUpsQuery {
  // -- INSERT

  static insert(values: InsertGameSkillLevelUp): Promise<GameSkillLevelUpRow> {
    return db
      .insertInto(GAME_SKILL_LEVEL_UPS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<GameSkillLevelUpRow | undefined> {
    return db
      .selectFrom(GAME_SKILL_LEVEL_UPS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  // -- DELETE

  static deleteById(id: string): Promise<GameSkillLevelUpRow | undefined> {
    return db
      .deleteFrom(GAME_SKILL_LEVEL_UPS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
