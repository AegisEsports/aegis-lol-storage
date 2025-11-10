import type { Kysely } from 'kysely';

import { GAME_SKILL_LEVEL_UPS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertGameSkillLevelUp,
  type GameSkillLevelUpRow,
} from '@/database/schema.js';

export class GameSkillLevelUpsQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
    id: string,
  ): Promise<GameSkillLevelUpRow | undefined> {
    return db
      .selectFrom(GAME_SKILL_LEVEL_UPS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByGameId(
    db: Kysely<Database>,
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
    db: Kysely<Database>,
    id: string,
  ): Promise<GameSkillLevelUpRow | undefined> {
    return db
      .deleteFrom(GAME_SKILL_LEVEL_UPS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
