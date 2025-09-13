import { Router } from 'express';

import { UserController } from '@/router/user/v1/user.controller.js';
import {
  deleteUserParams,
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
} from '@/router/user/v1/user.dto.js';
import { validateBody, validateParams } from '@/util/validate.js';

export const userRouter = Router();

userRouter.post('/', validateBody(postUserBody), UserController.createUser);
userRouter.post(
  '/riot-account',
  validateBody(postRiotAccountBody),
  UserController.createRiotAccount,
);
userRouter.post(
  '/discord-account',
  validateBody(postDiscordAccountBody),
  UserController.createDiscordAccount,
);
userRouter.get(
  '/:userId',
  validateParams(getUserParams),
  UserController.readUser,
);
userRouter.put(
  '/:userId',
  validateParams(putUserParams),
  validateBody(putUserBody),
  UserController.updateUser,
);
userRouter.put(
  '/riot-account/:riotAccountId',
  validateParams(putRiotAccountParams),
  validateBody(putRiotAccountBody),
  UserController.updateRiotAccount,
);
userRouter.put(
  '/discord-account/:discordAccountId',
  validateParams(putDiscordAccountParams),
  validateBody(putDiscordAccountBody),
  UserController.updateDiscordAccount,
);
userRouter.patch(
  '/riot-account/:riotAccountId/:userId',
  validateParams(patchRiotAccountParams),
  UserController.assignUserToRiotAccount,
);
userRouter.patch(
  '/discord-account/:discordAccountId/:userId',
  validateParams(patchDiscordAccountParams),
  UserController.assignUserToDiscordAccount,
);
// userRouter.patch('/invalidate/:splitId/:userId', , UsersController.);
userRouter.delete(
  '/:userId',
  validateParams(deleteUserParams),
  UserController.deleteUser,
);
// userRouter.delete('/riot-account/:riotAccountId', , UsersController.);
// userRouter.delete('/discord-account/:discordAccountId', , UsersController.);
