import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';

import pool from '@/config/pool.js';
import type {
  BANNED_CHAMPS,
  DISCORD_ACCOUNTS,
  EMERGENCY_SUB_REQUESTS,
  GAME_EVENTS,
  LEAGUE_BANS,
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  LEAGUES,
  ORGANIZATIONS,
  PLAYER_STATS,
  RIOT_ACCOUNTS,
  RIOT_MATCH_DATA,
  ROSTER_REQUESTS,
  SPLITS,
  TEAM_ROSTERS,
  TEAM_STATS,
  TEAMS,
  USERS,
} from '@/database/const.js';
import type {
  BannedChampsTable,
  DiscordAccountsTable,
  EmergencySubRequestsTable,
  GameEventsTable,
  LeagueBansTable,
  LeagueGamesTable,
  LeagueMatchesTable,
  LeaguesTable,
  OrganizationsTable,
  PlayerStatsTable,
  RiotAccountsTable,
  RiotMatchDataTable,
  RosterRequestsTable,
  SplitsTable,
  TeamRostersTable,
  TeamsTable,
  TeamStatsTable,
  UsersTable,
} from '@/database/schema.js';

export type Database = {
  [LEAGUES]: LeaguesTable;
  [USERS]: UsersTable;
  [ORGANIZATIONS]: OrganizationsTable;
  [RIOT_ACCOUNTS]: RiotAccountsTable;
  [SPLITS]: SplitsTable;
  [DISCORD_ACCOUNTS]: DiscordAccountsTable;
  [TEAMS]: TeamsTable;
  [TEAM_ROSTERS]: TeamRostersTable;
  [ROSTER_REQUESTS]: RosterRequestsTable;
  [LEAGUE_MATCHES]: LeagueMatchesTable;
  [LEAGUE_BANS]: LeagueBansTable;
  [EMERGENCY_SUB_REQUESTS]: EmergencySubRequestsTable;
  [LEAGUE_GAMES]: LeagueGamesTable;
  [GAME_EVENTS]: GameEventsTable;
  [RIOT_MATCH_DATA]: RiotMatchDataTable;
  [PLAYER_STATS]: PlayerStatsTable;
  [TEAM_STATS]: TeamStatsTable;
  [BANNED_CHAMPS]: BannedChampsTable;
};

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});
