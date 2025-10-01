import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';

import pool from '@/config/pool.js';
import type {
  BANNED_CHAMPS,
  DISCORD_ACCOUNTS,
  EMERGENCY_SUB_REQUESTS,
  GAME_EVENTS,
  GAME_SKILL_LEVEL_UPS,
  GAME_STORE_ACTIONS,
  GAME_TEAM_GOLDS,
  LEAGUE_BANS,
  LEAGUE_GAMES,
  LEAGUE_MATCHES,
  LEAGUES,
  ORGANIZATIONS,
  PLAYER_STATS,
  RIOT_ACCOUNTS,
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
  GameSkillLevelUpsTable,
  GameStoreActionsTable,
  GameTeamGoldsTable,
  LeagueBansTable,
  LeagueGamesTable,
  LeagueMatchesTable,
  LeaguesTable,
  OrganizationsTable,
  PlayerStatsTable,
  RiotAccountsTable,
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
  [GAME_SKILL_LEVEL_UPS]: GameSkillLevelUpsTable;
  [GAME_STORE_ACTIONS]: GameStoreActionsTable;
  [GAME_TEAM_GOLDS]: GameTeamGoldsTable;
  [PLAYER_STATS]: PlayerStatsTable;
  [TEAM_STATS]: TeamStatsTable;
  [BANNED_CHAMPS]: BannedChampsTable;
};

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
  plugins: [new CamelCasePlugin()],
});
