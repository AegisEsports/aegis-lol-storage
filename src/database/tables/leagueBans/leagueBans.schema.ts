import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  LEAGUE_BANS_SNAKE_CASE,
  LEAGUES_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const leagueBanRowSchema = z.strictObject({
  leagueId: z.uuid().nullable(),
  teamIdBanned: z.uuid().nullable(),
  userIdBanned: z.uuid().nullable(),
  bannedDate: z.iso.date().nullable(),
});
type LeagueBanFields = z.infer<typeof leagueBanRowSchema>;
export type LeagueBansTable = TableBase & LeagueBanFields;

export const createLeagueBansTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, LEAGUE_BANS_SNAKE_CASE, (t) =>
    t
      .addColumn('league_id', 'uuid', (col) =>
        col
          .references(`${LEAGUES_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_id_banned', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('user_id_banned', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('banned_date', 'timestamptz'),
  );
};

export type LeagueBanRow = Selectable<LeagueBansTable>;
export type InsertLeagueBan = Insertable<LeagueBansTable>;
export type UpdateLeagueBan = Updateable<LeagueBansTable>;
