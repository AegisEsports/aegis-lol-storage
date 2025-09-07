import type {
  DiscordAccountRow,
  InsertDiscordAccount,
  UpdateDiscordAccount,
} from '@/database/schema/discordAccounts.js';
import type { LeagueBanRow } from '@/database/schema/leagueBans.js';
import type { LeagueGameRow } from '@/database/schema/leagueGames.js';
import type { OrganizationRow } from '@/database/schema/organizations.js';
import type {
  InsertRiotAccount,
  RiotAccountRow,
  UpdateRiotAccount,
} from '@/database/schema/riotAccounts.js';
import type { TeamRow } from '@/database/schema/teams.js';
import type {
  InsertUser,
  UpdateUser,
  UserRow,
} from '@/database/schema/users.js';

// POST - /
export type CreateUserParameters = {
  user: InsertUser;
  riotAccounts: List<InsertRiotAccount>;
  discordAccounts: List<InsertDiscordAccount>;
};

// POST - /riot-account
export type CreateRiotAccountParameters = {
  riotAccount: InsertRiotAccount;
};

// POST - /discord-account
export type CreateDiscordAccountParameters = {
  discordAccount: InsertDiscordAccount;
};

// GET - /{userId}
export type UserDto = {
  user: UserRow;
  teams: List<
    TeamRow & {
      startDate: string; // when they were added to the roster
      endDate: string; // when they were removed from the roster
      leagueId: string;
      leagueName: string;
      splitId: string;
      splitName: string;
    }
  >; // sorted by startDate
  games: List<
    LeagueGameRow & {
      eSubbed: boolean;
    }
  >;
  riotAccounts: List<RiotAccountRow>;
  discordAccounts: List<DiscordAccountRow>;
  organizationsOwn: List<OrganizationRow>;
  leagueBans: List<
    LeagueBanRow & {
      bannedDate: string;
    }
  >;
};

// PUT - /{userId}
export type UpdateUserParameters = {
  user: UpdateUser;
};

// PUT - /riot-account/{riotAccountId}
export type UpdateRiotAccountParameters = {
  riotAccount: UpdateRiotAccount;
};

// PUT - /discord-account/{discordAccountId}
export type UpdateDiscordAccountParameters = {
  discordAccount: UpdateDiscordAccount;
};
