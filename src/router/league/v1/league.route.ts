import { Router } from 'express';

import { LeagueController } from '@/router/league/v1/league.controller.js';
import { validateBody, validateParams } from '@/util/validate.js';
import {
  deleteLeagueBanParams,
  // deleteLeagueParams,
  getLeagueParams,
  postLeagueBanBody,
  postLeagueBody,
  putLeagueBanBody,
  putLeagueBanParams,
  putLeagueBody,
  putLeagueParams,
} from './league.zod.js';

export const leagueRouter = Router();
const leagueController = new LeagueController();

leagueRouter.post(
  '/',
  validateBody(postLeagueBody),
  leagueController.createLeague,
);
leagueRouter.post(
  '/league-ban',
  validateBody(postLeagueBanBody),
  leagueController.createLeagueBan,
);
leagueRouter.get(
  '/:leagueId',
  validateParams(getLeagueParams),
  leagueController.readLeague,
);
leagueRouter.put(
  '/:leagueId',
  validateParams(putLeagueParams),
  validateBody(putLeagueBody),
  leagueController.updateLeague,
);
leagueRouter.put(
  '/league-ban/:leagueBanId',
  validateParams(putLeagueBanParams),
  validateBody(putLeagueBanBody),
  leagueController.updateLeagueBan,
);
// leagueRouter.delete(
//   '/:leagueId',
//   validateParams(deleteLeagueParams),
//   leagueController.deleteLeague,
// );
leagueRouter.delete(
  '/league-ban/:leagueBanId',
  validateParams(deleteLeagueBanParams),
  leagueController.deleteLeagueBan,
);
