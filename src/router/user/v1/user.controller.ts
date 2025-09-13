import type { NextFunction, Request, Response } from 'express';

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
import ControllerError from '@/util/errors/controllerError.js';
import type {
  CreateDiscordAccountBody,
  CreateRiotAccountBody,
  CreateUserBody,
  DiscordAccountDto,
  RiotAccountDto,
  UpdateDiscordAccountBody,
  UpdateRiotAccountBody,
  UpdateUserBody,
  UserDto,
} from './user.dto.js';

export const UserController = {
  /**
   * POST - /
   *
   * Creates a singular entry of a user. It will also create multiple entries of
   *    Riot accounts and Discord accounts if included in body.
   */
  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        user: { userRole, username, nickname = null },
        riotAccounts = [],
        discordAccounts = [],
      } = req.body as CreateUserBody;
      const insertedUser = await UsersQuery.insert({
        userRole,
        username,
        nickname,
      } satisfies InsertUser);
      const [insertedRiotAccounts, insertedDiscordAccounts] = await Promise.all(
        [
          Promise.all(riotAccounts.map(RiotAccountsQuery.insert)),
          Promise.all(discordAccounts.map(DiscordAccountsQuery.insert)),
        ],
      );

      const dto: UserDto = {
        user: insertedUser,
        teams: [],
        games: [],
        riotAccounts: insertedRiotAccounts,
        discordAccounts: insertedDiscordAccounts,
        organizationsOwn: [],
        leagueBans: [],
      };
      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /riot-account
   *
   * Creates a singular entry of a Riot account.
   */
  createRiotAccount: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccount } = req.body as CreateRiotAccountBody;
      const insertedRiotAccount = await RiotAccountsQuery.insert(
        riotAccount satisfies InsertRiotAccount,
      );
      const dto: RiotAccountDto = {
        riotAccount: insertedRiotAccount,
      };

      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /discord-account
   *
   * Creates a singular entry of a Discord account.
   */
  createDiscordAccount: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccount } = req.body as CreateDiscordAccountBody;
      const insertedDiscordAccount = await DiscordAccountsQuery.insert(
        discordAccount satisfies InsertDiscordAccount,
      );
      const dto: DiscordAccountDto = {
        discordAccount: insertedDiscordAccount,
      };

      res.status(201).json(dto);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET - /{userId}
   *
   * Retrieves a singular entry of a user.
   */
  readUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as { userId: string };
      const getUser = await UsersQuery.selectById(userId);
      if (!getUser) {
        throw new ControllerError(404, 'NotFound', 'User not found', {
          userId,
        });
      }
      const getTeams = await TeamsQuery.listPlayedInByUserId(userId);
      const getGames = await LeagueGamesQuery.listPlayedInByUserId(userId);
      const getRiotAccounts = await RiotAccountsQuery.listByUserId(userId);
      const getDiscordAccounts =
        await DiscordAccountsQuery.listByUserId(userId);
      const getOrganizations = await OrganizationsQuery.listByUserId(userId);
      const getLeagueBans = await LeagueBansQuery.listByUserId(userId);

      const dto: UserDto = {
        user: getUser,
        teams: getTeams,
        games: getGames,
        riotAccounts: getRiotAccounts,
        discordAccounts: getDiscordAccounts,
        organizationsOwn: getOrganizations,
        leagueBans: getLeagueBans,
      };
      res.status(200).json(dto);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /{userId}
   *
   * Updates a singular entry of a user.
   */
  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { user } = req.body as UpdateUserBody;
      const updatedUser = await UsersQuery.updateById(
        userId!,
        user satisfies UpdateUser,
      );
      if (!updatedUser) {
        throw new ControllerError(404, 'NotFound', 'User not found', {
          userId,
        });
      }

      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /riot-account/{riotAccountId}
   *
   * Updates a singular entry to the Riot account. Used for updating
   *   information after retrieving it from the Riot API.
   */
  updateRiotAccount: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccountId } = req.params;
      const { riotAccount } = req.body as UpdateRiotAccountBody;
      const updatedAccount = await RiotAccountsQuery.updateById(
        riotAccountId!,
        riotAccount satisfies UpdateRiotAccount,
      );
      if (!updatedAccount) {
        throw new ControllerError(404, 'NotFound', 'Riot account not found', {
          riotAccountId,
        });
      }

      res.status(200).json(updatedAccount);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /discord-account/{discordAccountId}
   *
   * Updates a singular entry to the Discord account. Used for updating
   *   information after retrieving it from the Discord API.
   */
  updateDiscordAccount: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccountId } = req.params;
      const { discordAccount } = req.body as UpdateDiscordAccountBody;
      const updatedAccount = await DiscordAccountsQuery.updateById(
        discordAccountId!,
        discordAccount satisfies UpdateDiscordAccount,
      );
      if (!updatedAccount) {
        throw new ControllerError(
          404,
          'NotFound',
          'Discord account not found',
          {
            discordAccountId,
          },
        );
      }

      res.status(200).json(updatedAccount);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /riot-account/{riotAccountId}/{userId}
   *
   * Assigns a user to the Riot account. No body necessary.
   */
  assignUserToRiotAccount: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccountId, userId } = req.params;
      const patchedRiotAccount = await RiotAccountsQuery.patchWithUserId(
        riotAccountId!,
        userId!,
      );
      if (!patchedRiotAccount) {
        throw new ControllerError(404, 'NotFound', 'Riot account not found', {
          riotAccountId,
        });
      }

      res.status(200).json(patchedRiotAccount);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /discord-account/{discordAccountId}/{userId}
   *
   * Assigns a user to the Discord account. No body necessary.
   */
  assignUserToDiscordAccount: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccountId, userId } = req.params;
      const patchedDiscordAccount = await DiscordAccountsQuery.patchWithUserId(
        discordAccountId!,
        userId!,
      );
      if (!patchedDiscordAccount) {
        throw new ControllerError(
          404,
          'NotFound',
          'Discord account not found',
          {
            riotAccountId: discordAccountId,
          },
        );
      }

      res.status(200).json(patchedDiscordAccount);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE - /{userId}
   *
   * Deletes a singular entry of a user.
   */
  deleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const deleted = await UsersQuery.deleteById(userId!);

      res.status(200).json(deleted);
    } catch (err) {
      next(err);
    }
  },
};
