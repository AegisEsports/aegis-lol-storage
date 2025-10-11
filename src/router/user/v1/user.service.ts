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
  /**
   * Creates a singular entry of a user, along with its listed Riot + Discord
   *   accounts.
   */
  public static initialize = async (
    userData: InsertUser,
    riotAccounts: InsertRiotAccount[],
    discordAccounts: InsertDiscordAccount[],
  ): Promise<UserDto> => {
    const insertedUser = await UsersQuery.insert(userData);
    const [insertedRiotAccounts, insertedDiscordAccounts] = await Promise.all([
      Promise.all(riotAccounts.map(RiotAccountsQuery.insert)),
      Promise.all(discordAccounts.map(DiscordAccountsQuery.insert)),
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
  public static createRiotAccount = async (
    riotAccount: InsertRiotAccount,
  ): Promise<RiotAccountDto> => {
    const insertedRiotAccount = await RiotAccountsQuery.insert(
      riotAccount satisfies InsertRiotAccount,
    );

    return {
      riotAccount: insertedRiotAccount,
    };
  };

  /**
   * Creates a singular entry of a Discord account.
   */
  public static createDiscordAccount = async (
    discordAccount: InsertDiscordAccount,
  ): Promise<DiscordAccountDto> => {
    const insertedDiscordAccount = await DiscordAccountsQuery.insert(
      discordAccount satisfies InsertDiscordAccount,
    );

    return {
      discordAccount: insertedDiscordAccount,
    };
  };

  /**
   * Retrieves a singular entry of a user.
   */
  public static findById = async (userId: string): Promise<UserDto> => {
    const getUser = await UsersQuery.selectById(userId);
    if (!getUser) {
      throw new ControllerError(404, 'NotFound', 'User not found', {
        userId,
      });
    }
    const getTeams = await TeamsQuery.listPlayedInByUserId(userId);
    const getGames = await LeagueGamesQuery.listPlayedInByUserId(userId);
    const getRiotAccounts = await RiotAccountsQuery.listByUserId(userId);
    const getDiscordAccounts = await DiscordAccountsQuery.listByUserId(userId);
    const getOrganizations = await OrganizationsQuery.listByUserId(userId);
    const getLeagueBans = await LeagueBansQuery.listByUserId(userId);

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
  public static findRiotAccountById = async (
    riotAccountId: string,
  ): Promise<RiotAccountDto> => {
    const getRiotAccount = await RiotAccountsQuery.selectById(riotAccountId);
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
  public static findRiotAccountByPuuid = async (
    riotPuuid: string,
  ): Promise<RiotAccountDto> => {
    const getRiotAccount = await RiotAccountsQuery.selectByPuuid(riotPuuid);
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
  public static replaceById = async (
    userId: string,
    userData: UpdateUser,
  ): Promise<UserTableDto> => {
    const updatedUser = await UsersQuery.updateById(userId, userData);
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
  public static replaceRiotAccountById = async (
    riotAccountId: string,
    riotAccountData: UpdateRiotAccount,
  ): Promise<RiotAccountDto> => {
    const updatedAccount = await RiotAccountsQuery.updateById(
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
  public static replaceDiscordAccountById = async (
    discordAccountId: string,
    discordAccountData: UpdateDiscordAccount,
  ): Promise<DiscordAccountDto> => {
    const updatedAccount = await DiscordAccountsQuery.updateById(
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
  public static updateUserInRiotAccount = async (
    riotAccountId: string,
    userId: string,
  ): Promise<RiotAccountDto> => {
    const patchedRiotAccount = await RiotAccountsQuery.setWithUserId(
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
  public static updateUserInDiscordAccount = async (
    discordAccountId: string,
    userId: string,
  ): Promise<DiscordAccountDto> => {
    const patchedDiscordAccount = await DiscordAccountsQuery.setWithUserId(
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
  public static removeById = async (userId: string): Promise<UserTableDto> => {
    const deletedUser = await UsersQuery.deleteById(userId);
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
