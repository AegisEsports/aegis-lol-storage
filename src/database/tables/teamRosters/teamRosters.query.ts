import type { Kysely } from 'kysely';

import { TEAM_ROSTERS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertTeamRoster,
  type TeamRosterRow,
  type UpdateTeamRoster,
} from '@/database/schema.js';

export class TeamRostersQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
    values: InsertTeamRoster,
  ): Promise<TeamRosterRow> {
    return db
      .insertInto(TEAM_ROSTERS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<TeamRosterRow | undefined> {
    return db
      .selectFrom(TEAM_ROSTERS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByTeamId(
    db: Kysely<Database>,
    teamId: string,
  ): Promise<TeamRosterRow[]> {
    return db
      .selectFrom(TEAM_ROSTERS)
      .selectAll()
      .where('teamId', '=', teamId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
    id: string,
    update: UpdateTeamRoster,
  ): Promise<TeamRosterRow | undefined> {
    return db
      .updateTable(TEAM_ROSTERS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<TeamRosterRow | undefined> {
    return db
      .deleteFrom(TEAM_ROSTERS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
