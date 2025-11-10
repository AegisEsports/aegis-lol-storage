import { LEAGUE_BANS, USERS } from '@/database/const.js';
import {
  type InsertLeagueBan,
  type LeagueBanRow,
  type UpdateLeagueBan,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';
import type { UsersBannedInLeagueDto } from '@/router/league/v1/league.dto.js';

export class LeagueBansQuery {
  // -- INSERT

  static insert(db: DbType, values: InsertLeagueBan): Promise<LeagueBanRow> {
    return db
      .insertInto(LEAGUE_BANS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(db: DbType, id: string): Promise<LeagueBanRow | undefined> {
    return db
      .selectFrom(LEAGUE_BANS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByUserId(db: DbType, userId: string): Promise<LeagueBanRow[]> {
    return db
      .selectFrom(LEAGUE_BANS)
      .selectAll()
      .where('userIdBanned', '=', userId)
      .execute();
  }

  static listByLeagueId(
    db: DbType,
    leagueId: string,
  ): Promise<UsersBannedInLeagueDto[]> {
    return db
      .selectFrom(`${LEAGUE_BANS} as lb`)
      .innerJoin(`${USERS} as u`, 'u.id', 'lb.userIdBanned')
      .where('lb.leagueId', '=', leagueId)
      .where('lb.userIdBanned', 'is not', null)
      .selectAll('lb')
      .select(['u.username as username'])
      .orderBy('lb.bannedDate', 'desc')
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: DbType,
    id: string,
    update: UpdateLeagueBan,
  ): Promise<LeagueBanRow | undefined> {
    return db
      .updateTable(LEAGUE_BANS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(db: DbType, id: string): Promise<LeagueBanRow | undefined> {
    return db
      .deleteFrom(LEAGUE_BANS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
