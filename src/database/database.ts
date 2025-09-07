import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';

import pool from '@/config/pool.js';
import type {
  BANNED_CHAMPS,
  BannedChampsTable,
} from './schema/bannedChamps.js';
import type {
  DISCORD_ACCOUNTS,
  DiscordAccountsTable,
} from './schema/discordAccounts.js';
import type {
  EMERGENCY_SUB_REQUESTS,
  EmergencySubRequestsTable,
} from './schema/emergencySubRequests.js';
import type { GAME_EVENTS, GameEventsTable } from './schema/gameEvents.js';
import type { LEAGUE_BANS, LeagueBansTable } from './schema/leagueBans.js';
import type { LEAGUE_GAMES, LeagueGamesTable } from './schema/leagueGames.js';
import type {
  LEAGUE_MATCHES,
  LeagueMatchesTable,
} from './schema/leagueMatches.js';
import type { LEAGUES, LeaguesTable } from './schema/leagues.js';
import type {
  ORGANIZATIONS,
  OrganizationsTable,
} from './schema/organizations.js';
import type { PLAYER_STATS, PlayerStatsTable } from './schema/playerStats.js';
import type {
  RIOT_ACCOUNTS,
  RiotAccountsTable,
} from './schema/riotAccounts.js';
import type {
  RIOT_MATCH_DATA,
  RiotMatchDataTable,
} from './schema/riotMatchData.js';
import type {
  ROSTER_REQUESTS,
  RosterRequestsTable,
} from './schema/rosterRequests.js';
import type { SPLITS, SplitsTable } from './schema/splits.js';
import type { TEAM_ROSTERS, TeamRostersTable } from './schema/teamRosters.js';
import type { TEAMS, TeamsTable } from './schema/teams.js';
import type { TEAM_STATS, TeamStatsTable } from './schema/teamStats.js';
import type { USERS, UsersTable } from './schema/users.js';

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
