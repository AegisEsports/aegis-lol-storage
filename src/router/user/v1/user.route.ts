import { Router } from 'express';

import { UserController } from '@/router/user/v1/user.controller.js';
import {
  deleteUserParams,
  getRiotAccountByPuuidParams,
  getRiotAccountParams,
  getUserParams,
  patchDiscordAccountParams,
  patchRiotAccountParams,
  postDiscordAccountBody,
  postRiotAccountBody,
  postUserBody,
  putDiscordAccountBody,
  putDiscordAccountParams,
  putRiotAccountBody,
  putRiotAccountParams,
  putUserBody,
  putUserParams,
} from '@/router/user/v1/user.zod.js';
import { validateBody, validateParams } from '@/util/validate.js';

export const userRouter = Router();
const userController = new UserController();

userRouter.post('/', validateBody(postUserBody), userController.createUser);
userRouter.post(
  '/riot-account',
  validateBody(postRiotAccountBody),
  userController.createRiotAccount,
);
userRouter.post(
  '/discord-account',
  validateBody(postDiscordAccountBody),
  userController.createDiscordAccount,
);
userRouter.get(
  '/:userId',
  validateParams(getUserParams),
  userController.readUser,
);
userRouter.get(
  '/riot-account/:riotAccountId',
  validateParams(getRiotAccountParams),
  userController.readRiotAccount,
);
userRouter.get(
  '/riot-account/by-puuid/:riotPuuid',
  validateParams(getRiotAccountByPuuidParams),
  userController.readRiotAccountByPuuid,
);
userRouter.put(
  '/:userId',
  validateParams(putUserParams),
  validateBody(putUserBody),
  userController.updateUser,
);
userRouter.put(
  '/riot-account/:riotAccountId',
  validateParams(putRiotAccountParams),
  validateBody(putRiotAccountBody),
  userController.updateRiotAccount,
);
userRouter.put(
  '/discord-account/:discordAccountId',
  validateParams(putDiscordAccountParams),
  validateBody(putDiscordAccountBody),
  userController.updateDiscordAccount,
);
userRouter.patch(
  '/riot-account/:riotAccountId/:userId',
  validateParams(patchRiotAccountParams),
  userController.assignUserToRiotAccount,
);
userRouter.patch(
  '/discord-account/:discordAccountId/:userId',
  validateParams(patchDiscordAccountParams),
  userController.assignUserToDiscordAccount,
);
// userRouter.patch('/invalidate/:splitId/:userId', , UsersController.);
userRouter.delete(
  '/:userId',
  validateParams(deleteUserParams),
  userController.deleteUser,
);
// userRouter.delete('/riot-account/:riotAccountId', , UsersController.);
// userRouter.delete('/discord-account/:discordAccountId', , UsersController.);
