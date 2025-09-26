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

matchRouter.post('/', validateBody(postMatchBody), MatchController.createMatch);
matchRouter.get(
  '/:matchId',
  validateParams(getMatchParams),
  MatchController.readMatch,
);
matchRouter.put(
  '/:matchId',
  validateParams(putMatchParams),
  validateBody(putMatchBody),
  MatchController.updateMatch,
);
matchRouter.patch(
  '/:matchId/:side/:teamId',
  validateParams(patchMatchTeamParams),
  MatchController.assignTeamToMatch,
);
matchRouter.delete(
  '/:matchId',
  validateParams(deleteMatchParams),
  MatchController.deleteMatch,
);
