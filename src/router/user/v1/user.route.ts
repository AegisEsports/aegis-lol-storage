import { Router } from 'express';

import { UsersController } from '@/router/user/v1/user.controller.js';
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
  putRiotAccountParams,
  putUserBody,
  putUserParams,
} from '@/router/user/v1/user.dto.js';
import { validateBody, validateParams } from '@/util/validate.js';

export const userRouter = Router();

userRouter.post('/', validateBody(postUserBody), UsersController.createUser);
userRouter.post(
  '/riot-account',
  validateBody(postRiotAccountBody),
  UsersController.createRiotAccount,
);
userRouter.post(
  '/discord-account',
  validateBody(postDiscordAccountBody),
  UsersController.createDiscordAccount,
);
userRouter.get('/:userId', validateParams(getUserParams), UsersController.read);
userRouter.put(
  '/:userId',
  validateParams(putUserParams),
  UsersController.updateUser,
);
userRouter.put(
  '/riot-account/:riotAccountId',
  validateParams(putRiotAccountParams),
  validateBody(putUserBody),
  UsersController.updateRiotAccount,
);
userRouter.put(
  '/discord-account/:discordAccountId',
  validateParams(putDiscordAccountParams),
  validateBody(putDiscordAccountBody),
  UsersController.updateDiscordAccount,
);
userRouter.patch(
  '/riot-account/:riotAccountId/:userId',
  validateParams(patchRiotAccountParams),
  UsersController.assignUserToRiotAccount,
);
userRouter.patch(
  '/discord-account/:discordAccountId/:userId',
  validateParams(patchDiscordAccountParams),
  UsersController.assignUserToDiscordAccount,
);
// userRouter.patch('/invalidate/:splitId/:userId', , UsersController.);
userRouter.delete(
  '/:userId',
  validateParams(deleteUserParams),
  UsersController.deleteUser,
);
// userRouter.delete('/riot-account/:riotAccountId', , UsersController.);
// userRouter.delete('/discord-account/:discordAccountId', , UsersController.);
