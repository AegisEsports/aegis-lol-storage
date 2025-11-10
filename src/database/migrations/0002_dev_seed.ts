/**
 * Seed the database with initial data.
 * We only seed data for development/testing purposes here.
 */

import type { Kysely } from 'kysely';

import type { Database } from '@/database/database.js';
import { GameService } from '@/router/game/v1/game.service.js';
import { LeagueService } from '@/router/league/v1/league.service.js';
import { MatchService } from '@/router/match/v1/match.service.js';
import { SplitService } from '@/router/split/v1/split.service.js';
import { TeamService } from '@/router/team/v1/team.service.js';

export const up = async (db: Kysely<Database>): Promise<void> => {
  const league = new LeagueService(db);
  const split = new SplitService(db);
  const team = new TeamService(db);
  const match = new MatchService(db);
  const game = new GameService(db);

  /**
   * We will accomplish the following:
   * 1) Create a league
   * 2) Create a split
   * 3) Create 5 teams
   * 4) Create the matches with those teams simulated from
   *  Summer 2025 AVL Piltover group and the games.
   */
  // 1)
  const leagueData = await league.create({
    name: 'Aegis Leagues',
    riotProviderId: null,
  });
  // 2)
  const splitData = await split.create({
    name: 'Aegis Vanguard League',
    leagueId: leagueData.league.id,
    splitAbbreviation: 'AVL',
    splitTime: 'Summer 2025',
    splitRank: 'Grandmaster',
    riotTournamentId: null,
    officialSheetUrl: null,
    active: true,
  });
  // 3)
  const teamFBP = await team.create(
    {
      name: 'Final Boss Friends',
      splitId: splitData.split.id,
      organizationId: null,
      teamAbbreviation: 'FBP',
      teamColor: '#FFFFFF',
    },
    [],
  );
  const teamCT = await team.create(
    {
      name: 'Coopa Troopas',
      splitId: splitData.split.id,
      organizationId: null,
      teamAbbreviation: 'CT',
      teamColor: '#FFFFFF',
    },
    [],
  );
  const teamG7 = await team.create(
    {
      name: 'Gang7 Mirage',
      splitId: splitData.split.id,
      organizationId: null,
      teamAbbreviation: 'G7',
      teamColor: '#FFFFFF',
    },
    [],
  );
  const teamOTL = await team.create(
    {
      name: 'OTL Black',
      splitId: splitData.split.id,
      organizationId: null,
      teamAbbreviation: 'OTL',
      teamColor: '#FFFFFF',
    },
    [],
  );
  const teamKHAN = await team.create(
    {
      name: 'Khan Esports',
      splitId: splitData.split.id,
      organizationId: null,
      teamAbbreviation: 'KHAN',
      teamColor: '#FFFFFF',
    },
    [],
  );
  // 4)
  const match1 = await match.create({
    awayTeamId: teamFBP.team.id,
    homeTeamId: teamKHAN.team.id,
    awayScore: 2,
    homeScore: 0,
    sideWin: 'Away',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 1,
    scheduledAt: null,
  });
  await game.create(
    match1.match.id,
    teamFBP.team.id,
    teamKHAN.team.id,
    'NA1_5339538629',
    null,
  );
  await game.create(
    match1.match.id,
    teamKHAN.team.id,
    teamFBP.team.id,
    'NA1_5339567593',
    null,
  );
  const match2 = await match.create({
    awayTeamId: teamG7.team.id,
    homeTeamId: teamCT.team.id,
    awayScore: 0,
    homeScore: 2,
    sideWin: 'Home',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 1,
    scheduledAt: null,
  });
  await game.create(
    match2.match.id,
    teamG7.team.id,
    teamCT.team.id,
    'NA1_5339629383',
    null,
  );
  await game.create(
    match2.match.id,
    teamG7.team.id,
    teamCT.team.id,
    'NA1_5339690320',
    null,
  );
  const match3 = await match.create({
    awayTeamId: teamOTL.team.id,
    homeTeamId: teamFBP.team.id,
    awayScore: 0,
    homeScore: 2,
    sideWin: 'Home',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 2,
    scheduledAt: null,
  });
  await game.create(
    match3.match.id,
    teamOTL.team.id,
    teamFBP.team.id,
    'NA1_5344997734',
    null,
  );
  await game.create(
    match3.match.id,
    teamFBP.team.id,
    teamOTL.team.id,
    'NA1_5345057675',
    null,
  );
  const match4 = await match.create({
    awayTeamId: teamCT.team.id,
    homeTeamId: teamKHAN.team.id,
    awayScore: 1,
    homeScore: 2,
    sideWin: 'Home',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 2,
    scheduledAt: null,
  });
  await game.create(
    match4.match.id,
    teamCT.team.id,
    teamKHAN.team.id,
    'NA1_5344999179',
    null,
  );
  await game.create(
    match4.match.id,
    teamKHAN.team.id,
    teamCT.team.id,
    'NA1_5345048157',
    null,
  );
  await game.create(
    match4.match.id,
    teamCT.team.id,
    teamKHAN.team.id,
    'NA1_5345099657',
    null,
  );
  const match5 = await match.create({
    awayTeamId: teamFBP.team.id,
    homeTeamId: teamG7.team.id,
    awayScore: 2,
    homeScore: 1,
    sideWin: 'Away',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 2,
    scheduledAt: null,
  });
  await game.create(
    match5.match.id,
    teamFBP.team.id,
    teamG7.team.id,
    'NA1_5350120468',
    null,
  );
  await game.create(
    match5.match.id,
    teamG7.team.id,
    teamFBP.team.id,
    'NA1_5350166472',
    null,
  );
  await game.create(
    match5.match.id,
    teamG7.team.id,
    teamFBP.team.id,
    'NA1_5350209851',
    null,
  );
  const match6 = await match.create({
    awayTeamId: teamKHAN.team.id,
    homeTeamId: teamOTL.team.id,
    awayScore: 0,
    homeScore: 2,
    sideWin: 'Home',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 3,
    scheduledAt: null,
  });
  await game.create(
    match6.match.id,
    teamKHAN.team.id,
    teamOTL.team.id,
    'NA1_5352930939',
    null,
  );
  await game.create(
    match6.match.id,
    teamOTL.team.id,
    teamKHAN.team.id,
    'NA1_5352972271',
    null,
  );
  const match7 = await match.create({
    awayTeamId: teamCT.team.id,
    homeTeamId: teamFBP.team.id,
    awayScore: 0,
    homeScore: 2,
    sideWin: 'Home',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 4,
    scheduledAt: null,
  });
  await game.create(
    match7.match.id,
    teamCT.team.id,
    teamFBP.team.id,
    'NA1_5355155018',
    null,
  );
  await game.create(
    match7.match.id,
    teamFBP.team.id,
    teamCT.team.id,
    'NA1_5355214369',
    null,
  );
  const match8 = await match.create({
    awayTeamId: teamG7.team.id,
    homeTeamId: teamOTL.team.id,
    awayScore: 2,
    homeScore: 1,
    sideWin: 'Away',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 4,
    scheduledAt: null,
  });
  await game.create(
    match8.match.id,
    teamG7.team.id,
    teamOTL.team.id,
    'NA1_5355166817',
    null,
  );
  await game.create(
    match8.match.id,
    teamG7.team.id,
    teamOTL.team.id,
    'NA1_5355207412',
    null,
  );
  await game.create(
    match8.match.id,
    teamOTL.team.id,
    teamG7.team.id,
    'NA1_5355261226',
    null,
  );
  const match9 = await match.create({
    awayTeamId: teamKHAN.team.id,
    homeTeamId: teamG7.team.id,
    awayScore: 0,
    homeScore: 2,
    sideWin: 'Home',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 5,
    scheduledAt: null,
  });
  await game.create(
    match9.match.id,
    teamKHAN.team.id,
    teamG7.team.id,
    'NA1_5365053376',
    null,
  );
  await game.create(
    match9.match.id,
    teamKHAN.team.id,
    teamG7.team.id,
    'NA1_5365092877',
    null,
  );
  const match10 = await match.create({
    awayTeamId: teamOTL.team.id,
    homeTeamId: teamCT.team.id,
    awayScore: 0,
    homeScore: 2,
    sideWin: 'Home',
    splitId: splitData.split.id,
    bestOf: 3,
    matchType: 'RegularSeason',
    weekNumber: 5,
    scheduledAt: null,
  });
  await game.create(
    match10.match.id,
    teamOTL.team.id,
    teamCT.team.id,
    'NA1_5365051663',
    null,
  );
  await game.create(
    match10.match.id,
    teamCT.team.id,
    teamOTL.team.id,
    'NA1_5365085932',
    null,
  );
};

export const down = async (): Promise<void> => {
  // Leaving this blank for now when it's needed.
};
