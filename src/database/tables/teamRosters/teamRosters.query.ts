import { TEAM_ROSTERS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertTeamRoster,
  type TeamRosterRow,
  type UpdateTeamRoster,
} from '@/database/schema.js';

export class TeamRostersQuery {
  // -- INSERT

  static insert(values: InsertTeamRoster): Promise<TeamRosterRow> {
    return db
      .insertInto(TEAM_ROSTERS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<TeamRosterRow | undefined> {
    return db
      .selectFrom(TEAM_ROSTERS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
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

  static deleteById(id: string): Promise<TeamRosterRow | undefined> {
    return db
      .deleteFrom(TEAM_ROSTERS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
