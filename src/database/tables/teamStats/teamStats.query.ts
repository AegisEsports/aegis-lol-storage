import { sql } from 'kysely';

import {
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  TEAM_STATS,
  TEAMS,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import { type InsertTeamStat, type TeamStatRow } from '@/database/schema.js';
import { RECORD_LIMIT } from '@/database/shared.js';
import type { LeagueSide } from '@/database/shared.js';
import type { GameTeamStatRow } from '@/router/game/v1/game.dto.js';
import type {
  TeamStatOverallDto,
  TeamStatRecordDamageAt15Dto,
  TeamStatRecordFirstBloodTimestampDto,
  TeamStatRecordFirstInhibitorTimestampDto,
  TeamStatRecordFirstTowerTimestampDto,
  TeamStatRecordGoldAt15Dto,
  TeamStatRecordKillsAt15Dto,
  TeamStatRecordWardsClearedAt15Dto,
  TeamStatRecordWardsPlacedAt15Dto,
} from '@/router/split/v1/split.dto.js';
import type { TeamStatPlayedInDto } from '@/router/team/v1/team.dto.js';

/**
 * Helper function to build the base query for team stat records (used in multiple places).
 */
const teamStatRecordBaseQuery = (splitId: string) => {
  return db
    .selectFrom(`${TEAM_STATS} as ts`)
    .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ts.leagueGameId')
    .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
    .leftJoin(`${TEAMS} as t`, 't.id', 'ts.teamId') // this team
    .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId') // blue side in game
    .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId') // red side in game
    .where('m.splitId', '=', splitId)
    .where((eb) => eb('g.invalidated', '=', eb.val(false)))
    .select((eb) => [
      'ts.leagueGameId',
      't.name as teamName',
      // opponent name from side
      sql<string>`
        CASE 
          WHEN ${eb.ref('ts.side')} = 'Blue' THEN ${eb.ref('tr.name')}
          ELSE ${eb.ref('tb.name')}
        END
      `.as('opposingTeamName'),
    ]);
};

export class TeamStatsQuery {
  // -- INSERT

  static insert(values: InsertTeamStat): Promise<TeamStatRow> {
    return db
      .insertInto(TEAM_STATS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<TeamStatRow | undefined> {
    return db
      .selectFrom(TEAM_STATS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async selectByGameAndTeam(
    gameId: string,
    teamId: string,
  ): Promise<TeamStatPlayedInDto> {
    const row = await db
      .selectFrom(`${TEAM_STATS} as ts_me`)
      .leftJoin(
        `${TEAM_STATS} as ts_opp`,
        (join) =>
          join
            .onRef('ts_opp.leagueGameId', '=', 'ts_me.leagueGameId')
            .on('ts_opp.teamId', '<>', teamId), // opponent = same game, different team
      )
      .where('ts_me.leagueGameId', '=', gameId)
      .where('ts_me.teamId', '=', teamId)
      .select((eb) => [
        eb.ref('ts_me.totalKills').as('totalKills'),
        eb.ref('ts_me.totalGold').as('totalGold'),
        eb.ref('ts_me.totalTowers').as('totalTowers'),
        eb.ref('ts_me.totalDragons').as('totalDragons'),

        eb.ref('ts_opp.totalKills').as('opposingKills'),
        eb.ref('ts_opp.totalGold').as('opposingGold'),
        eb.ref('ts_opp.totalTowers').as('opposingTowers'),
        eb.ref('ts_opp.totalDragons').as('opposingDragons'),
      ])
      .executeTakeFirst();

    return (
      row ?? {
        totalKills: null,
        totalGold: null,
        totalTowers: null,
        totalDragons: null,
        opposingKills: null,
        opposingGold: null,
        opposingTowers: null,
        opposingDragons: null,
      }
    );
  }

  static selectByGameAndSide(
    gameId: string,
    side: LeagueSide,
  ): Promise<TeamStatRow> {
    return db
      .selectFrom(TEAM_STATS)
      .selectAll()
      .where('leagueGameId', '=', gameId)
      .where('side', '=', side)
      .executeTakeFirstOrThrow();
  }

  static listByGameId(gameId: string): Promise<GameTeamStatRow[]> {
    return db
      .selectFrom(`${TEAM_STATS} as ts`)
      .innerJoin(`${TEAMS} as t`, 't.id', 'ts.teamId')
      .selectAll('ts')
      .select('t.name as teamName')
      .where('ts.leagueGameId', '=', gameId)
      .orderBy('side', 'asc')
      .execute();
  }

  static async listOverallBySplitId(
    splitId: string,
  ): Promise<TeamStatOverallDto[]> {
    return db
      .selectFrom(`${TEAMS} as t`)
      .innerJoin(`${TEAM_STATS} as ts`, 'ts.teamId', 't.id')
      .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ts.leagueGameId')
      .where('t.splitId', '=', splitId)
      .where('g.invalidated', '=', false)
      .groupBy(['t.id'])
      .select((eb) => [
        't.id as teamId',
        't.name as teamName',
        't.teamAbbreviation as teamAbbreviation',

        eb.fn.avg<number>('g.duration').as('averageDuration'),
        eb.fn.count<number>('g.id').as('gamesPlayed'),

        // wins/losses from boolean win
        sql<number>`sum(case when ${eb.ref('ts.win')} then 1 else 0 end)`.as(
          'totalWins',
        ),
        sql<number>`sum(case when ${eb.ref('ts.win')} then 0 else 1 end)`.as(
          'totalLosses',
        ),

        // core totals
        eb.fn.sum<number>('ts.totalKills').as('totalKills'),
        eb.fn.sum<number>('ts.totalDeaths').as('totalDeaths'),

        sql<number>`sum(case when ${eb.ref('ts.firstBlood')} then 1 else 0 end)`.as(
          'totalFirstBloods',
        ),
        sql<number>`sum(case when ${eb.ref('ts.firstTower')} then 1 else 0 end)`.as(
          'totalFirstTowers',
        ),
        sql<number>`sum(case when ${eb.ref('ts.firstInhibitor')} then 1 else 0 end)`.as(
          'totalFirstInhibitors',
        ),
        sql<number>`sum(case when ${eb.ref('ts.firstVoidgrub')} then 1 else 0 end)`.as(
          'totalFirstVoidGrubs',
        ),
        sql<number>`sum(case when ${eb.ref('ts.firstDragon')} then 1 else 0 end)`.as(
          'totalFirstDragons',
        ),
        sql<number>`sum(case when ${eb.ref('ts.firstHerald')} then 1 else 0 end)`.as(
          'totalFirstHeralds',
        ),
        sql<number>`sum(case when ${eb.ref('ts.firstAtakhan')} then 1 else 0 end)`.as(
          'totalFirstAtakhan',
        ),
        sql<number>`sum(case when ${eb.ref('ts.firstBaron')} then 1 else 0 end)`.as(
          'totalFirstBarons',
        ),

        // per-minute averages (simple mean of per-game rates)
        eb.fn
          .avg<number>('ts.damageDealtPerMinute')
          .as('averageDamageToChampsPerMinute'),
        eb.fn.avg<number>('ts.goldPerMinute').as('averageGoldPerMinute'),
        eb.fn
          .avg<number>('ts.creepScorePerMinute')
          .as('averageCreepScorePerMinute'),
        eb.fn
          .avg<number>('ts.visionScorePerMinute')
          .as('averageVisionScorePerMinute'),

        // derive wards per minute from totals & duration: avg( (total / (duration/60)) )
        sql<number>`avg( ( ${eb.ref('ts.totalWardsPlaced')}::float * 60.0 ) / nullif(${eb.ref('g.duration')}, 0) )`.as(
          'averageWardsPlacedPerMinute',
        ),
        sql<number>`avg( ( ${eb.ref('ts.totalWardTakedowns')}::float * 60.0 ) / nullif(${eb.ref('g.duration')}, 0) )`.as(
          'averageWardTakedownsPerMinute',
        ),

        // timeline means
        eb.fn.avg<number>('ts.killsAt10').as('averageKillsAt10'),
        eb.fn.avg<number>('ts.killsAt15').as('averageKillsAt15'),
        eb.fn.avg<number>('ts.killsAt20').as('averageKillsAt20'),

        eb.fn.avg<number>('ts.csAt10').as('averageCsAt10'),
        eb.fn.avg<number>('ts.csAt15').as('averageCsAt15'),
        eb.fn.avg<number>('ts.csAt20').as('averageCsAt20'),

        eb.fn.avg<number>('ts.goldAt10').as('averageGoldAt10'),
        eb.fn.avg<number>('ts.goldAt15').as('averageGoldAt15'),
        eb.fn.avg<number>('ts.goldAt20').as('averageGoldAt20'),

        eb.fn.avg<number>('ts.xpAt10').as('averageXpAt10'),
        eb.fn.avg<number>('ts.xpAt15').as('averageXpAt15'),
        eb.fn.avg<number>('ts.xpAt20').as('averageXpAt20'),

        eb.fn.avg<number>('ts.damageAt10').as('averageDamageAt10'),
        eb.fn.avg<number>('ts.damageAt15').as('averageDamageAt15'),
        eb.fn.avg<number>('ts.damageAt20').as('averageDamageAt20'),

        eb.fn.avg<number>('ts.wardsPlacedAt10').as('averageWardsPlacedAt10'),
        eb.fn.avg<number>('ts.wardsPlacedAt15').as('averageWardsPlacedAt15'),
        eb.fn.avg<number>('ts.wardsPlacedAt20').as('averageWardsPlacedAt20'),

        eb.fn.avg<number>('ts.wardsClearedAt10').as('averageWardsCleared10'),
        eb.fn.avg<number>('ts.wardsClearedAt15').as('averageWardsCleared15'),
        eb.fn.avg<number>('ts.wardsClearedAt20').as('averageWardsCleared20'),

        // diff means
        eb.fn.avg<number>('ts.killsDiff10').as('averageKillsDiff10'),
        eb.fn.avg<number>('ts.killsDiff15').as('averageKillsDiff15'),
        eb.fn.avg<number>('ts.killsDiff20').as('averageKillsDiff20'),

        eb.fn.avg<number>('ts.csDiff10').as('averageCsDiff10'),
        eb.fn.avg<number>('ts.csDiff15').as('averageCsDiff15'),
        eb.fn.avg<number>('ts.csDiff20').as('averageCsDiff20'),

        eb.fn.avg<number>('ts.goldDiff10').as('averageGoldDiff10'),
        eb.fn.avg<number>('ts.goldDiff15').as('averageGoldDiff15'),
        eb.fn.avg<number>('ts.goldDiff20').as('averageGoldDiff20'),

        eb.fn.avg<number>('ts.xpDiff10').as('averageXpDiff10'),
        eb.fn.avg<number>('ts.xpDiff15').as('averageXpDiff15'),
        eb.fn.avg<number>('ts.xpDiff20').as('averageXpDiff20'),

        eb.fn.avg<number>('ts.damageDiff10').as('averageDamageDiff10'),
        eb.fn.avg<number>('ts.damageDiff15').as('averageDamageDiff15'),
        eb.fn.avg<number>('ts.damageDiff20').as('averageDamageDiff20'),

        eb.fn.avg<number>('ts.wardsPlacedDiff10').as('averageWardsDiff10'),
        eb.fn.avg<number>('ts.wardsPlacedDiff15').as('averageWardsDiff15'),
        eb.fn.avg<number>('ts.wardsPlacedDiff20').as('averageWardsDiff20'),

        eb.fn
          .avg<number>('ts.wardsClearedDiff10')
          .as('averageWardTakedownDiff10'),
        eb.fn
          .avg<number>('ts.wardsClearedDiff15')
          .as('averageWardTakedownDiff15'),
        eb.fn
          .avg<number>('ts.wardsClearedDiff20')
          .as('averageWardTakedownDiff20'),
      ])
      .orderBy('t.name', 'asc')
      .execute();
  }

  // For TeamStatRecords

  static listFirstTowerTimestampRecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordFirstTowerTimestampDto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select('ts.firstTowerTimestamp')
      .orderBy('ts.firstTowerTimestamp', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listFirstBloodTimestampRecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordFirstBloodTimestampDto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select('ts.firstBloodTimestamp')
      .orderBy('ts.firstBloodTimestamp', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listFirstInhibitorTimestampRecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordFirstInhibitorTimestampDto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select('ts.firstInhibitorTimestamp')
      .orderBy('ts.firstInhibitorTimestamp', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listKillsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordKillsAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.killsAt15', 'ts.killsDiff15'])
      .orderBy('ts.killsAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listGoldAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordGoldAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.goldAt15', 'ts.goldDiff15'])
      .orderBy('ts.goldAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listDamageAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordDamageAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.damageAt15', 'ts.damageDiff15'])
      .orderBy('ts.damageAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listWardsPlacedAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordWardsPlacedAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.wardsPlacedAt15', 'ts.wardsPlacedDiff15'])
      .orderBy('ts.wardsPlacedAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listWardsClearedAt15RecordsBySplitId(
    splitId: string,
  ): Promise<TeamStatRecordWardsClearedAt15Dto[]> {
    return teamStatRecordBaseQuery(splitId)
      .select(['ts.wardsClearedAt15', 'ts.wardsClearedDiff15'])
      .orderBy('ts.wardsClearedAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  // -- UPDATE (not replaceable)

  static setTeamId(gameId: string, side: LeagueSide, teamId: string) {
    return db
      .updateTable(TEAM_STATS)
      .where('side', '=', side)
      .where('leagueGameId', '=', gameId)
      .set({ teamId })
      .executeTakeFirstOrThrow();
  }

  // -- DELETE

  static deleteById(id: string): Promise<TeamStatRow | undefined> {
    return db
      .deleteFrom(TEAM_STATS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
