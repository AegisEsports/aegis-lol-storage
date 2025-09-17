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

leagueRouter.post(
  '/',
  validateBody(postLeagueBody),
  LeagueController.createLeague,
);
leagueRouter.post(
  '/league-ban',
  validateBody(postLeagueBanBody),
  LeagueController.createLeagueBan,
);
leagueRouter.get(
  '/:leagueId',
  validateParams(getLeagueParams),
  LeagueController.readLeague,
);
leagueRouter.put(
  '/:leagueId',
  validateParams(putLeagueParams),
  validateBody(putLeagueBody),
  LeagueController.updateLeague,
);
leagueRouter.put(
  '/league-ban/:leagueBanId',
  validateParams(putLeagueBanParams),
  validateBody(putLeagueBanBody),
  LeagueController.updateLeagueBan,
);
// leagueRouter.delete(
//   '/:leagueId',
//   validateParams(deleteLeagueParams),
//   LeagueController.deleteLeague,
// );
leagueRouter.delete(
  '/league-ban/:leagueBanId',
  validateParams(deleteLeagueBanParams),
  LeagueController.deleteLeagueBan,
);
