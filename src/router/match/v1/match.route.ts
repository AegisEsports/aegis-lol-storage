import { Router } from 'express';

import { MatchController } from '@/router/match/v1/match.controller.js';
import {
  deleteMatchParams,
  getMatchParams,
  patchMatchTeamParams,
  postMatchBody,
  putMatchBody,
  putMatchParams,
} from '@/router/match/v1/match.zod.js';
import { validateBody, validateParams } from '@/util/validate.js';

export const matchRouter = Router();
const matchController = new MatchController();

matchRouter.post('/', validateBody(postMatchBody), matchController.createMatch);
matchRouter.get(
  '/:matchId',
  validateParams(getMatchParams),
  matchController.readMatch,
);
matchRouter.put(
  '/:matchId',
  validateParams(putMatchParams),
  validateBody(putMatchBody),
  matchController.updateMatch,
);
matchRouter.patch(
  '/:matchId/:side/:teamId',
  validateParams(patchMatchTeamParams),
  matchController.assignTeamToMatch,
);
matchRouter.delete(
  '/:matchId',
  validateParams(deleteMatchParams),
  matchController.deleteMatch,
);
