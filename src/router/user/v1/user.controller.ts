import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '@/database/database.js';
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
  private user: UserService = new UserService(db);

  /**
   * POST - /
   */
  public createUser: RequestHandler = async (
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
        .json(await this.user.create(user, riotAccounts, discordAccounts));
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST - /riot-account
   *
   * Creates a singular entry of a Riot account.
   */
  public createRiotAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccount } = req.body as CreateRiotAccountBody;

      res.status(201).json(await this.user.createRiotAccount(riotAccount));
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST - /discord-account
   */
  public createDiscordAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccount } = req.body as CreateDiscordAccountBody;

      res
        .status(201)
        .json(await this.user.createDiscordAccount(discordAccount));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{userId}
   */
  public readUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;

      res.status(200).json(await this.user.findById(userId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /riot-account/{riotAccountId}
   */
  public readRiotAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccountId } = req.params;

      res.status(200).json(await this.user.findRiotAccountById(riotAccountId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /riot-account/by-puuid/{riotPuuid}
   */
  public readRiotAccountByPuuid: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotPuuid } = req.params;

      res.status(200).json(await this.user.findRiotAccountByPuuid(riotPuuid!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{userId}
   */
  public updateUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;
      const { user } = req.body as UpdateUserBody;

      res.status(200).json(await this.user.replaceById(userId!, user));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /riot-account/{riotAccountId}
   */
  public updateRiotAccount: RequestHandler = async (
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
          await this.user.replaceRiotAccountById(riotAccountId!, riotAccount),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /discord-account/{discordAccountId}
   */
  public updateDiscordAccount: RequestHandler = async (
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
          await this.user.replaceDiscordAccountById(
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
  public assignUserToRiotAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { riotAccountId, userId } = req.params;

      res
        .status(200)
        .json(await this.user.updateUserInRiotAccount(riotAccountId!, userId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /discord-account/{discordAccountId}/{userId}
   */
  public assignUserToDiscordAccount: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { discordAccountId, userId } = req.params;

      res
        .status(200)
        .json(
          await this.user.updateUserInDiscordAccount(
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
  public deleteUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;

      res.status(200).json(await this.user.removeById(userId!));
    } catch (err) {
      next(err);
    }
  };
}
