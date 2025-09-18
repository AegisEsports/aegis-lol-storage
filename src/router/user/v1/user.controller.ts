import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { UserService } from '@/router/user/v1/user.service.js';
import type {
  CreateDiscordAccountBody,
  CreateRiotAccountBody,
  CreateUserBody,
  UpdateDiscordAccountBody,
  UpdateRiotAccountBody,
  UpdateUserBody,
} from './user.zod.js';

export class UserController {
  /**
   * POST - /
   */
  public static createUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {
        user,
        riotAccounts = [],
        discordAccounts = [],
      } = req.body as CreateUserBody;

      res
        .status(201)
        .json(
          await UserService.initialize(user, riotAccounts, discordAccounts),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST - /riot-account
   *
   * Creates a singular entry of a Riot account.
   */
  public static createRiotAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccount } = req.body as CreateRiotAccountBody;

      res.status(201).json(await UserService.createRiotAccount(riotAccount));
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST - /discord-account
   *
   * Creates a singular entry of a Discord account.
   */
  public static createDiscordAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccount } = req.body as CreateDiscordAccountBody;

      res
        .status(201)
        .json(await UserService.createDiscordAccount(discordAccount));
    } catch (err) {
      next(err);
    }
  };

  /**
   * Retrieves a singular entry of a user.
   */
  public static readUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;

      res.status(200).json(await UserService.findById(userId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{userId}
   *
   * Updates a singular entry of a user.
   */
  public static updateUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;
      const { user } = req.body as UpdateUserBody;

      res.status(200).json(await UserService.replaceById(userId!, user));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /riot-account/{riotAccountId}
   *
   * Updates a singular entry to the Riot account. Used for updating
   *   information after retrieving it from the Riot API.
   */
  public static updateRiotAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccountId } = req.params;
      const { riotAccount } = req.body as UpdateRiotAccountBody;

      res
        .status(200)
        .json(
          await UserService.replaceRiotAccountById(riotAccountId!, riotAccount),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /discord-account/{discordAccountId}
   *
   * Updates a singular entry to the Discord account. Used for updating
   *   information after retrieving it from the Discord API.
   */
  public static updateDiscordAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccountId } = req.params;
      const { discordAccount } = req.body as UpdateDiscordAccountBody;

      res
        .status(200)
        .json(
          await UserService.replaceDiscordAccountById(
            discordAccountId!,
            discordAccount,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /riot-account/{riotAccountId}/{userId}
   */
  public static assignUserToRiotAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccountId, userId } = req.params;

      res
        .status(200)
        .json(
          await UserService.updateUserInRiotAccount(riotAccountId!, userId!),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /discord-account/{discordAccountId}/{userId}
   */
  public static assignUserToDiscordAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccountId, userId } = req.params;

      res
        .status(200)
        .json(
          await UserService.updateUserInDiscordAccount(
            discordAccountId!,
            userId!,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{userId}
   */
  public static deleteUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;

      res.status(200).json(await UserService.removeById(userId!));
    } catch (err) {
      next(err);
    }
  };
}
