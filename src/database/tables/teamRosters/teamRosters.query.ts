import { TEAM_ROSTERS } from '@/database/const.js';
import {
  type InsertTeamRoster,
  type TeamRosterRow,
  type UpdateTeamRoster,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class TeamRostersQuery {
  // -- INSERT

  static insert(db: DbType, values: InsertTeamRoster): Promise<TeamRosterRow> {
    return db
      .insertInto(TEAM_ROSTERS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: DbType,
    id: string,
  ): Promise<TeamRosterRow | undefined> {
    return db
      .selectFrom(TEAM_ROSTERS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByTeamId(db: DbType, teamId: string): Promise<TeamRosterRow[]> {
    return db
      .selectFrom(TEAM_ROSTERS)
      .selectAll()
      .where('teamId', '=', teamId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: DbType,
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
    db: DbType,
    id: string,
  ): Promise<TeamRosterRow | undefined> {
    return db
      .deleteFrom(TEAM_ROSTERS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
