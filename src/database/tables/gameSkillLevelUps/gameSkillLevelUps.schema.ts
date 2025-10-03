import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  GAME_SKILL_LEVEL_UPS_SNAKE_CASE,
  LEAGUE_GAMES_SNAKE_CASE,
  RIOT_ACCOUNTS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  createTableWithBase,
  SKILL_LEVEL_UP_TYPE,
  SKILL_SLOTS,
  type TableBase,
} from '@/database/shared.js';

export const gameSkillLevelUpRowSchema = z.strictObject({
  leagueGameId: z.uuid(),
  riotPuuid: z.string().nullable(),
  champId: z.coerce.number().int().nullable(),
  gameTimestamp: z.coerce.number().int().nullable(),
  skillNumber: z.coerce.number().int().nullable(),
  skillSlot: z.enum(SKILL_SLOTS).nullable(),
  type: z.enum(SKILL_LEVEL_UP_TYPE).nullable(),
});
export type GameSkillLevelUpFields = z.infer<typeof gameSkillLevelUpRowSchema>;
export type GameSkillLevelUpsTable = TableBase & GameSkillLevelUpFields;

export const createGameSkillLevelUpsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, GAME_SKILL_LEVEL_UPS_SNAKE_CASE, (t) =>
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
      .addColumn('skillNumber', 'int2')
      .addColumn('skill_slot', 'varchar(2)')
      .addColumn('type', 'varchar'),
  );
};

export type GameSkillLevelUpRow = Selectable<GameSkillLevelUpsTable>;
export type InsertGameSkillLevelUp = Insertable<GameSkillLevelUpsTable>;
export type UpdateGameSkillLevelUp = Updateable<GameSkillLevelUpsTable>;
