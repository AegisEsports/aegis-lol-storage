import type { Kysely } from 'kysely';

import type { Database } from '@/database/database.js';
import {
  DiscordAccountsQuery,
  LeagueBansQuery,
  LeagueGamesQuery,
  OrganizationsQuery,
  RiotAccountsQuery,
  TeamsQuery,
  UsersQuery,
} from '@/database/query.js';
import type {
  InsertDiscordAccount,
  InsertRiotAccount,
  InsertUser,
  UpdateDiscordAccount,
  UpdateRiotAccount,
  UpdateUser,
} from '@/database/schema.js';
import type {
  DiscordAccountDto,
  RiotAccountDto,
  UserDto,
  UserTableDto,
} from '@/router/user/v1/user.dto.js';
import ControllerError from '@/util/errors/controllerError.js';

export class UserService {
  constructor(private db: Kysely<Database>) {}

  /**
   * Creates a singular entry of a user, along with its listed Riot + Discord
   *   accounts.
   */
  public initialize = async (
    userData: InsertUser,
    riotAccounts: InsertRiotAccount[],
    discordAccounts: InsertDiscordAccount[],
  ): Promise<UserDto> => {
    const insertedUser = await UsersQuery.insert(this.db, userData);
    const [insertedRiotAccounts, insertedDiscordAccounts] = await Promise.all([
      Promise.all(
        riotAccounts.map((account) =>
          RiotAccountsQuery.insert(this.db, account),
        ),
      ),
      Promise.all(
        discordAccounts.map((account) =>
          DiscordAccountsQuery.insert(this.db, account),
        ),
      ),
    ]);

    return {
      user: insertedUser,
      teams: [],
      games: [],
      riotAccounts: insertedRiotAccounts,
      discordAccounts: insertedDiscordAccounts,
      organizationsOwn: [],
      leagueBans: [],
    };
  };

  /**
   * Creates a singular entry of a Riot account.
   */
  public createRiotAccount = async (
    riotAccount: InsertRiotAccount,
  ): Promise<RiotAccountDto> => {
    const insertedRiotAccount = await RiotAccountsQuery.insert(
      this.db,
      riotAccount satisfies InsertRiotAccount,
    );

    return {
      riotAccount: insertedRiotAccount,
    };
  };

  /**
   * Creates a singular entry of a Discord account.
   */
  public createDiscordAccount = async (
    discordAccount: InsertDiscordAccount,
  ): Promise<DiscordAccountDto> => {
    const insertedDiscordAccount = await DiscordAccountsQuery.insert(
      this.db,
      discordAccount satisfies InsertDiscordAccount,
    );

    return {
      discordAccount: insertedDiscordAccount,
    };
  };

  /**
   * Retrieves a singular entry of a user.
   */
  public findById = async (userId: string): Promise<UserDto> => {
    const getUser = await UsersQuery.selectById(this.db, userId);
    if (!getUser) {
      throw new ControllerError(404, 'NotFound', 'User not found', {
        userId,
      });
    }
    const getTeams = await TeamsQuery.listPlayedInByUserId(this.db, userId);
    const getGames = await LeagueGamesQuery.listPlayedInByUserId(
      this.db,
      userId,
    );
    const getRiotAccounts = await RiotAccountsQuery.listByUserId(
      this.db,
      userId,
    );
    const getDiscordAccounts = await DiscordAccountsQuery.listByUserId(
      this.db,
      userId,
    );
    const getOrganizations = await OrganizationsQuery.listByUserId(
      this.db,
      userId,
    );
    const getLeagueBans = await LeagueBansQuery.listByUserId(this.db, userId);

    return {
      user: getUser,
      teams: getTeams,
      games: getGames,
      riotAccounts: getRiotAccounts,
      discordAccounts: getDiscordAccounts,
      organizationsOwn: getOrganizations,
      leagueBans: getLeagueBans,
    };
  };

  /**
   * Retrieves a singular entry of a Riot account by its id
   */
  public findRiotAccountById = async (
    riotAccountId: string,
  ): Promise<RiotAccountDto> => {
    const getRiotAccount = await RiotAccountsQuery.selectById(
      this.db,
      riotAccountId,
    );
    if (!getRiotAccount) {
      throw new ControllerError(404, 'NotFound', 'Riot account not found', {
        riotAccountId,
      });
    }

    return {
      riotAccount: getRiotAccount,
    };
  };

  /**
   * Retrieves a singular entry of a Riot account by its puuid
   */
  public findRiotAccountByPuuid = async (
    riotPuuid: string,
  ): Promise<RiotAccountDto> => {
    const getRiotAccount = await RiotAccountsQuery.selectByPuuid(
      this.db,
      riotPuuid,
    );
    if (!getRiotAccount) {
      throw new ControllerError(
        404,
        'NotFound',
        'Riot account not found through puuid',
        {
          riotPuuid,
        },
      );
    }

    return {
      riotAccount: getRiotAccount,
    };
  };

  /**
   * Updates a singular entry of a user.
   */
  public replaceById = async (
    userId: string,
    userData: UpdateUser,
  ): Promise<UserTableDto> => {
    const updatedUser = await UsersQuery.updateById(this.db, userId, userData);
    if (!updatedUser) {
      throw new ControllerError(404, 'NotFound', 'User not found', {
        userId,
      });
    }

    return {
      user: updatedUser,
    };
  };

  /**
   * Updates a singular entry to the Riot account. Used for updating
   *   information after retrieving it from the Riot API.
   */
  public replaceRiotAccountById = async (
    riotAccountId: string,
    riotAccountData: UpdateRiotAccount,
  ): Promise<RiotAccountDto> => {
    const updatedAccount = await RiotAccountsQuery.updateById(
      this.db,
      riotAccountId,
      riotAccountData,
    );
    if (!updatedAccount) {
      throw new ControllerError(404, 'NotFound', 'Riot account not found', {
        riotAccountId,
      });
    }

    return {
      riotAccount: updatedAccount,
    };
  };

  /**
   * Updates a singular entry to the Discord account. Used for updating
   *   information after retrieving it from the Discord API.
   */
  public replaceDiscordAccountById = async (
    discordAccountId: string,
    discordAccountData: UpdateDiscordAccount,
  ): Promise<DiscordAccountDto> => {
    const updatedAccount = await DiscordAccountsQuery.updateById(
      this.db,
      discordAccountId,
      discordAccountData,
    );
    if (!updatedAccount) {
      throw new ControllerError(404, 'NotFound', 'Discord account not found', {
        discordAccountId,
      });
    }

    return {
      discordAccount: updatedAccount,
    };
  };

  /**
   * Assigns a user to the Riot account.
   */
  public updateUserInRiotAccount = async (
    riotAccountId: string,
    userId: string,
  ): Promise<RiotAccountDto> => {
    const patchedRiotAccount = await RiotAccountsQuery.setWithUserId(
      this.db,
      riotAccountId!,
      userId!,
    );
    if (!patchedRiotAccount) {
      throw new ControllerError(404, 'NotFound', 'Riot account not found', {
        riotAccountId,
      });
    }

    return {
      riotAccount: patchedRiotAccount,
    };
  };

  /**
   * Assigns a user to the Discord account.
   */
  public updateUserInDiscordAccount = async (
    discordAccountId: string,
    userId: string,
  ): Promise<DiscordAccountDto> => {
    const patchedDiscordAccount = await DiscordAccountsQuery.setWithUserId(
      this.db,
      discordAccountId!,
      userId!,
    );
    if (!patchedDiscordAccount) {
      throw new ControllerError(404, 'NotFound', 'Discord account not found', {
        riotAccountId: discordAccountId,
      });
    }

    return {
      discordAccount: patchedDiscordAccount,
    };
  };

  /**
   * Deletes a singular entry of a user.
   */
  public removeById = async (userId: string): Promise<UserTableDto> => {
    const deletedUser = await UsersQuery.deleteById(this.db, userId);
    if (!deletedUser) {
      throw new ControllerError(404, 'NotFound', 'User not found', {
        userId,
      });
    }

    return {
      user: deletedUser,
    };
  };
}
