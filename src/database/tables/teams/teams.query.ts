import type { Kysely } from 'kysely';

import {
  LEAGUES,
  ROSTER_REQUESTS,
  SPLITS,
  TEAM_ROSTERS,
  TEAMS,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertTeam,
  type TeamRow,
  type UpdateTeam,
} from '@/database/schema.js';
import type { TeamPlayedInDto } from '@/router/user/v1/user.dto.js';

export class TeamsQuery {
  // -- INSERT

  static insert(db: Kysely<Database>, values: InsertTeam): Promise<TeamRow> {
    return db
      .insertInto(TEAMS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<TeamRow | undefined> {
    return db
      .selectFrom(TEAMS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listBySplitId(
    db: Kysely<Database>,
    splitId: string,
  ): Promise<TeamRow[]> {
    return db
      .selectFrom(`${TEAMS}`)
      .selectAll()
      .where('splitId', '=', splitId)
      .execute();
  }

  static async listPlayedInByUserId(
    db: Kysely<Database>,
    userId: string,
  ): Promise<TeamPlayedInDto[]> {
    // Distinct teams the user has appeared on.
    const teamsForUser = db
      .selectFrom(`${TEAM_ROSTERS} as tr`)
      .where('tr.userId', '=', userId)
      .select('tr.teamId')
      .distinct()
      .as('tu');

    // Earliest approved addition per (team,user)
    const addAgg = db
      .selectFrom(`${ROSTER_REQUESTS} as rr`)
      .where('rr.approved', '=', true)
      .where('rr.rosterMoveType', '=', 'Add')
      .select(['rr.teamId', 'rr.userId'])
      .select((eb) => eb.fn.min('rr.reviewedAt').as('startDate'))
      .groupBy(['rr.teamId', 'rr.userId'])
      .as('aa');

    // Latest approved drop per (team,user)
    const dropAgg = db
      .selectFrom(`${ROSTER_REQUESTS} as rr`)
      .where('rr.approved', '=', true)
      .where('rr.rosterMoveType', '=', 'Drop')
      .select(['rr.teamId', 'rr.userId'])
      .select((eb) => eb.fn.max('rr.reviewedAt').as('endDate'))
      .groupBy(['rr.teamId', 'rr.userId'])
      .as('da');

    // Fallback: earliest roster row per (team,user) if no Add request exists
    const rosterAgg = db
      .selectFrom(`${TEAM_ROSTERS} as tr2`)
      .select(['tr2.teamId', 'tr2.userId'])
      .select((eb) => eb.fn.min('tr2.createdAt').as('rosterStart'))
      .groupBy(['tr2.teamId', 'tr2.userId'])
      .as('ra');

    // Main query
    const rows = await db
      .selectFrom(`${TEAMS} as t`)
      .innerJoin(teamsForUser, 'tu.teamId', 't.id')
      .leftJoin(`${SPLITS} as s`, 's.id', 't.splitId')
      .leftJoin(`${LEAGUES} as l`, 'l.id', 's.leagueId')
      .leftJoin(addAgg, (join) =>
        join.onRef('aa.teamId', '=', 't.id').on('aa.userId', '=', userId),
      )
      .leftJoin(dropAgg, (join) =>
        join.onRef('da.teamId', '=', 't.id').on('da.userId', '=', userId),
      )
      .leftJoin(rosterAgg, (join) =>
        join.onRef('ra.teamId', '=', 't.id').on('ra.userId', '=', userId),
      )
      .selectAll('t') // TeamRow columns
      .select([
        'l.id as leagueId',
        'l.name as leagueName',
        's.id as splitId',
        's.name as splitName',
      ])
      // coalesce Add→roster fallback for startDate
      .select((eb) =>
        eb.fn.coalesce('aa.startDate', 'ra.rosterStart').as('startDate'),
      )
      // endDate from Drops (may be null)
      .select('da.endDate as endDate')
      // Sort: push null endDate last, then endDate desc, then startDate desc
      .select((eb) =>
        eb
          .case()
          .when('da.endDate', 'is', null)
          .then(1)
          .else(0)
          .end()
          .as('endNull'),
      )
      .orderBy('endNull', 'asc') // non-null first if add was not added
      .orderBy('endDate', 'desc') // then newest endDate
      .orderBy('startDate', 'desc')
      .execute();

    return rows.map((r) => ({
      // everything from teams for TeamRow
      id: r.id,
      createdAt: r.createdAt,
      modifiedAt: r.modifiedAt,
      name: r.name,
      splitId: r.splitId,
      organizationId: r.organizationId,
      teamAbbreviation: r.teamAbbreviation,
      teamColor: r.teamColor,
      teamLogoUrl: r.teamLogoUrl,
      // joined fields
      leagueId: r.leagueId ?? null,
      leagueName: r.leagueName ?? null,
      splitName: r.splitName ?? null,
      startDate: r.startDate,
      endDate: r.endDate,
    }));
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
    id: string,
    update: UpdateTeam,
  ): Promise<TeamRow | undefined> {
    return db
      .updateTable(TEAMS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static setOrganizationId(
    db: Kysely<Database>,
    teamId: string,
    organizationId: string,
  ): Promise<TeamRow | undefined> {
    return db
      .updateTable(TEAMS)
      .set({ organizationId })
      .where('id', '=', teamId)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<TeamRow | undefined> {
    return db
      .deleteFrom(TEAMS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
