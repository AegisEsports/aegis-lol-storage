import { sql } from 'kysely';

import {
  EMERGENCY_SUB_REQUESTS,
  GAME_EVENTS,
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  PLAYER_STATS,
  RIOT_ACCOUNTS,
  SPLITS,
  TEAM_STATS,
  TEAMS,
} from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertLeagueGame,
  type LeagueGameRow,
  type TeamStatFields,
  type UpdateLeagueGame,
} from '@/database/schema.js';
import { RECORD_LIMIT } from '@/database/shared.js';
import type {
  DragonStatsDto,
  GameDetailDto,
  GameStatRecordCreepScorePerMinuteDto,
  GameStatRecordDamagePerMinuteDto,
  GameStatRecordGoldPerMinuteDto,
  GameStatRecordTotalKillsAt15Dto,
  GameStatRecordTotalKillsDto,
  GameStatRecordVisionScorePerMinuteDto,
  SidesStatsDto,
  TeamGameStatDto,
} from '@/router/split/v1/split.dto.js';
import type { PlayerGamePlayedInDto } from '@/router/user/v1/user.dto.js';

/**
 * Helper type to extract only numeric fields from TeamStatFields
 * (used for building dynamic queries)
 */
type NumericTeamStatKey = {
  [K in keyof TeamStatFields]: TeamStatFields[K] extends number | null
    ? K
    : never;
}[keyof TeamStatFields];
/**
 * Helper function to build the base query for team stat records (used in multiple places).
 */
const gameStatsRecordBaseQuery = (
  splitId: string,
  statColumn: NumericTeamStatKey,
) => {
  // Subquery: sum both teams per game
  const tsAgg = db
    .selectFrom(`${TEAM_STATS} as ts`)
    .select((eb) => [
      `ts.leagueGameId as tsLeagueGameId`,
      eb.fn.sum<number>(`ts.${statColumn}`).as(statColumn),
    ])
    .groupBy('tsLeagueGameId')
    .as('t');

  return db
    .selectFrom(`${LEAGUE_GAMES} as g`)
    .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
    .leftJoin(tsAgg, 't.tsLeagueGameId', 'g.id')
    .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId')
    .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId')
    .where('m.splitId', '=', splitId)
    .where((eb) => eb('g.invalidated', '=', eb.val(false)))
    .select([
      'g.id as leagueGameId',
      'tb.name as blueTeamName',
      'tr.name as redTeamName',
      'g.duration',
      `t.${statColumn} as ${statColumn}`,
    ]);
};

export class LeagueGamesQuery {
  // -- INSERT

  static insert(values: InsertLeagueGame): Promise<LeagueGameRow> {
    return db
      .insertInto(LEAGUE_GAMES)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<LeagueGameRow | undefined> {
    return db
      .selectFrom(LEAGUE_GAMES)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static async listPlayedInByUserId(
    userId: string,
  ): Promise<PlayerGamePlayedInDto[]> {
    return await db
      .selectFrom(`${PLAYER_STATS} as ps`)
      .innerJoin(`${RIOT_ACCOUNTS} as ra`, 'ra.riotPuuid', 'ps.riotPuuid') // puuid belongs to exactly one user
      .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'ps.leagueGameId')
      .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
      .innerJoin(`${SPLITS} as s`, 's.id', 'm.splitId')
      // e-sub (approved) on the same match for this user
      .leftJoin(`${EMERGENCY_SUB_REQUESTS} as es`, (join) =>
        join
          .onRef('es.leagueMatchId', '=', 'g.leagueMatchId')
          .on('es.userId', '=', userId)
          .on('es.approved', '=', true),
      )
      // names for blue/red teams from the game row
      .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId')
      .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId')
      .where('ra.userId', '=', userId)
      // -- LeagueGameRow fields
      .selectAll('g')
      // role & side from stats
      .select([
        's.id as splitId',
        's.name as splitName',
        'ps.playerRole as role',
        'ps.side as side',
        'ps.win as win',
        'ps.champName as champName',
        'ps.summoner1Id as summonerSpell1Id',
        'ps.summoner2Id as summonerSpell2Id',
        'ps.kills as kills',
        'ps.deaths as deaths',
        'ps.assists as assists',
        'ps.gold as gold',
        'ps.creepScore as creepScore',
      ])
      // eSubbed: approved e-sub row exists for this match & user
      .select((eb) =>
        eb
          .case()
          .when(eb.ref('es.id'), 'is', null)
          .then(false)
          .else(true)
          .end()
          .as('eSubbed'),
      )
      // teamName: whichever team the player is on (blue or red)
      .select((eb) =>
        eb
          .case()
          .when(eb.ref('ps.teamId'), '=', eb.ref('g.blueTeamId'))
          .then(eb.ref('tb.name'))
          .when(eb.ref('ps.teamId'), '=', eb.ref('g.redTeamId'))
          .then(eb.ref('tr.name'))
          .else(null)
          .end()
          .as('teamName'),
      )
      // opposingTeamName: the other team in the game
      .select((eb) =>
        eb
          .case()
          .when(eb.ref('ps.teamId'), '=', eb.ref('g.blueTeamId'))
          .then(eb.ref('tr.name'))
          .when(eb.ref('ps.teamId'), '=', eb.ref('g.redTeamId'))
          .then(eb.ref('tb.name'))
          .else(null)
          .end()
          .as('opposingTeamName'),
      )
      .orderBy('g.startedAt', 'desc')
      .execute();
  }

  static listByMatchId(matchId: string): Promise<LeagueGameRow[]> {
    return db
      .selectFrom(LEAGUE_GAMES)
      .selectAll()
      .where('leagueMatchId', '=', matchId)
      .orderBy('gameNumber', 'asc')
      .execute();
  }

  static async listBySplitId(splitId: string): Promise<GameDetailDto[]> {
    const rows = await db
      .selectFrom(`${LEAGUE_GAMES} as g`)
      .leftJoin(`${TEAMS} as tb`, 'tb.id', 'g.blueTeamId')
      .leftJoin(`${TEAMS} as tr`, 'tr.id', 'g.redTeamId')
      .leftJoin(`${TEAM_STATS} as tsb`, (join) =>
        join
          .onRef('tsb.leagueGameId', '=', 'g.id')
          .on('tsb.side', '=', sql.lit('Blue')),
      )
      .leftJoin(`${TEAM_STATS} as tsr`, (join) =>
        join
          .onRef('tsr.leagueGameId', '=', 'g.id')
          .on('tsr.side', '=', sql.lit('Red')),
      )
      // ---- LATERAL: Blue dragons
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom(`${GAME_EVENTS} as e`)
            .whereRef('e.leagueGameId', '=', 'g.id')
            .whereRef('e.teamId', '=', 'g.blueTeamId')
            .where('e.eventType', '=', 'Dragon')
            .select(
              sql<
                string[]
              >`coalesce(array_agg(e.objective_sub_type order by e.game_timestamp), '{}')`.as(
                'dragons',
              ),
            )
            .as('bd'),
        (join) => join.onTrue(),
      )
      // ---- LATERAL: Red dragons
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom(`${GAME_EVENTS} as e`)
            .whereRef('e.leagueGameId', '=', 'g.id')
            .whereRef('e.teamId', '=', 'g.redTeamId')
            .where('e.eventType', '=', 'Dragon')
            .select(
              sql<
                string[]
              >`coalesce(array_agg(e.objective_sub_type order by e.game_timestamp), '{}')`.as(
                'dragons',
              ),
            )
            .as('rd'),
        (join) => join.onTrue(),
      )
      .where((eb) =>
        eb.or([eb('tb.splitId', '=', splitId), eb('tr.splitId', '=', splitId)]),
      )
      .select([
        'g.id as leagueGameId',
        'g.leagueMatchId',
        'g.startedAt as playedAt',
        'g.invalidated',
        'g.sideWin',
        'g.blueTeamId',
        'g.redTeamId',
        'tb.name as blueTeamName',
        'tr.name as redTeamName',

        // Blue side
        'tsb.totalKills as bTotalKills',
        'tsb.totalGold as bTotalGold',
        'tsb.totalTowers as bTotalTowers',
        'tsb.totalVoidgrubs as bTotalVoidgrubs',
        'tsb.totalHeralds as bTotalHeralds',
        'tsb.totalAtakhans as bTotalAtakhans',
        'tsb.totalBarons as bTotalBarons',
        'tsb.totalInhibitors as bTotalInhibitors',

        // Red side
        'tsr.totalKills as rTotalKills',
        'tsr.totalGold as rTotalGold',
        'tsr.totalTowers as rTotalTowers',
        'tsr.totalVoidgrubs as rTotalVoidgrubs',
        'tsr.totalHeralds as rTotalHeralds',
        'tsr.totalAtakhans as rTotalAtakhans',
        'tsr.totalBarons as rTotalBarons',
        'tsr.totalInhibitors as rTotalInhibitors',

        // dragon type arrays
        'bd.dragons as bDragonTypes',
        'rd.dragons as rDragonTypes',
      ])
      .orderBy('g.startedAt', 'asc')
      .execute();

    const toTeamStat = (p: {
      kills: number | null;
      gold: number | null;
      towers: number | null;
      voidGrubs: number | null;
      dragons: string[] | null;
      heralds: number | null;
      atakhans: number | null;
      barons: number | null;
      inhibitors: number | null;
    }): TeamGameStatDto => ({
      kills: p.kills ?? null,
      gold: p.gold ?? null,
      towers: p.towers ?? null,
      voidGrubs: p.voidGrubs ?? null,
      dragons: p.dragons ?? [],
      heralds: p.heralds ?? null,
      atakhans: p.atakhans ?? null,
      barons: p.barons ?? null,
      inhibitors: p.inhibitors ?? null,
    });

    return rows.map(
      (r): GameDetailDto => ({
        leagueGameId: r.leagueGameId,
        leagueMatchId: r.leagueMatchId ?? null,
        playedAt: r.playedAt ?? null,
        blueTeamId: r.blueTeamId ?? null,
        blueTeamName: r.blueTeamName ?? null,
        redTeamId: r.redTeamId ?? null,
        redTeamName: r.redTeamName ?? null,
        invalidated: !!r.invalidated,
        sideWin: r.sideWin ?? null,
        blueTeamStat: toTeamStat({
          kills: r.bTotalKills,
          gold: r.bTotalGold,
          towers: r.bTotalTowers,
          voidGrubs: r.bTotalVoidgrubs,
          dragons: r.bDragonTypes,
          heralds: r.bTotalHeralds,
          atakhans: r.bTotalAtakhans,
          barons: r.bTotalBarons,
          inhibitors: r.bTotalInhibitors,
        }),
        redTeamStat: toTeamStat({
          kills: r.rTotalKills,
          gold: r.rTotalGold,
          towers: r.rTotalTowers,
          voidGrubs: r.rTotalVoidgrubs,
          dragons: r.rDragonTypes,
          heralds: r.rTotalHeralds,
          atakhans: r.rTotalAtakhans,
          barons: r.rTotalBarons,
          inhibitors: r.rTotalInhibitors,
        }),
      }),
    );
  }

  static selectSidesBySplitId(
    splitId: string,
  ): Promise<SidesStatsDto | undefined> {
    return db
      .selectFrom(`${LEAGUE_GAMES} as g`)
      .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
      .where('m.splitId', '=', splitId)
      .select((eb) => [
        sql<number>`count(*) filter (where ${eb.ref('g.sideWin')} = 'Blue')`.as(
          'blueWins',
        ),
        sql<number>`count(*) filter (where ${eb.ref('g.sideWin')} = 'Red')`.as(
          'redWins',
        ),
      ])
      .executeTakeFirst();
  }

  static selectDragonsBySplitId(
    splitId: string,
  ): Promise<DragonStatsDto | undefined> {
    return db
      .selectFrom(`${GAME_EVENTS} as e`)
      .innerJoin(`${LEAGUE_GAMES} as g`, 'g.id', 'e.leagueGameId')
      .innerJoin(`${LEAGUE_MATCHES} as m`, 'm.id', 'g.leagueMatchId')
      .where('m.splitId', '=', splitId)
      .where((eb) => eb('g.invalidated', '=', eb.val(false)))
      .select((eb) => [
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Cloud_Drake')`.as(
          'cloud',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Ocean_Drake')`.as(
          'ocean',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Infernal_Drake')`.as(
          'infernal',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Mountain_Drake')`.as(
          'mountain',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Hextech_Drake')`.as(
          'hextech',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Chemtech_Drake')`.as(
          'chemtech',
        ),
        sql<number>`count(*) filter (where ${eb.ref('e.eventType')} = 'Elder_Drake')`.as(
          'elder',
        ),
      ])
      .executeTakeFirst(); // always returns one row with 0s, but keep `undefined` in signature if you prefer
  }

  // For GameStatRecords

  static listTotalKillsRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordTotalKillsDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'totalKills')
      .orderBy('t.totalKills', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listTotalKillsAt15RecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordTotalKillsAt15Dto[]> {
    return gameStatsRecordBaseQuery(splitId, 'killsAt15')
      .orderBy('t.killsAt15', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listCreepScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordCreepScorePerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'creepScorePerMinute')
      .orderBy('t.creepScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listGoldPerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordGoldPerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'goldPerMinute')
      .orderBy('t.goldPerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listDamagePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordDamagePerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'damageDealtPerMinute')
      .orderBy('t.damageDealtPerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  static listVisionScorePerMinuteRecordsBySplitId(
    splitId: string,
  ): Promise<GameStatRecordVisionScorePerMinuteDto[]> {
    return gameStatsRecordBaseQuery(splitId, 'visionScorePerMinute')
      .orderBy('t.visionScorePerMinute', 'desc')
      .limit(RECORD_LIMIT)
      .execute();
  }

  // -- UPDATE

  static updateById(
    id: string,
    update: UpdateLeagueGame,
  ): Promise<LeagueGameRow | undefined> {
    return db
      .updateTable(LEAGUE_GAMES)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  static setMatchId(
    gameId: string,
    matchId: string,
  ): Promise<LeagueGameRow | undefined> {
    return db
      .updateTable(LEAGUE_GAMES)
      .set({ leagueMatchId: matchId })
      .where('id', '=', gameId)
      .returningAll()
      .executeTakeFirst();
  }

  static setDraftLink(
    gameId: string,
    draftLink: string | null,
  ): Promise<LeagueGameRow | undefined> {
    return db
      .updateTable(LEAGUE_GAMES)
      .set({ draftLink })
      .where('id', '=', gameId)
      .returningAll()
      .executeTakeFirst();
  }

  static setBlueTeam(
    gameId: string,
    teamId: string,
  ): Promise<LeagueGameRow | undefined> {
    return db
      .updateTable(LEAGUE_GAMES)
      .set({ blueTeamId: teamId })
      .where('id', '=', gameId)
      .returningAll()
      .executeTakeFirst();
  }

  static setRedTeam(
    gameId: string,
    teamId: string,
  ): Promise<LeagueGameRow | undefined> {
    return db
      .updateTable(LEAGUE_GAMES)
      .set({ redTeamId: teamId })
      .where('id', '=', gameId)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Sets the game numbers for all games in a match, ordered by startedAt ascending.
   * Returns the number of games updated.
   * Must be called after every insertion/update to leagueMatchId
   */
  static async setGameNumbersByMatchId(matchId: string): Promise<number> {
    const ids: { id: string }[] = await db
      .selectFrom(LEAGUE_GAMES)
      .select(['id'])
      .where('leagueMatchId', '=', matchId)
      .orderBy('startedAt', 'asc')
      .execute();

    for (const [number, id] of ids.map((r) => r.id).entries()) {
      await db
        .updateTable(LEAGUE_GAMES)
        .set({ gameNumber: number + 1 })
        .where('id', '=', id)
        .returningAll()
        .execute();
    }

    return ids.length;
  }

  // -- DELETE

  static deleteById(id: string): Promise<LeagueGameRow | undefined> {
    return db
      .deleteFrom(LEAGUE_GAMES)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
