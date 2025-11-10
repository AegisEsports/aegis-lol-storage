import { Router } from 'express';

import { TeamController } from '@/router/team/v1/team.controller.js';
import {
  deleteTeamParams,
  getTeamParams,
  patchApproveEmergencySubRequestParams,
  patchApproveRosterRequestParams,
  patchDenyEmergencySubRequestParams,
  patchDenyRosterRequestParams,
  patchTeamOrganizationParams,
  postEmergencySubRequestBody,
  postRosterRequestBody,
  postTeamBody,
  putTeamBody,
  putTeamParams,
  putTeamRosterBody,
  putTeamRosterParams,
} from '@/router/team/v1/team.zod.js';
import { validateBody, validateParams } from '@/util/validate.js';

export const teamRouter = Router();
const teamController = new TeamController();

teamRouter.post('/', validateBody(postTeamBody), teamController.createTeam);
teamRouter.post(
  '/roster-request',
  validateBody(postRosterRequestBody),
  teamController.createRosterRequest,
);
teamRouter.post(
  '/emergency-sub-request',
  validateBody(postEmergencySubRequestBody),
  teamController.createEmergencySubRequest,
);
teamRouter.get(
  '/:teamId',
  validateParams(getTeamParams),
  teamController.readTeam,
);
teamRouter.put(
  '/:teamId',
  validateParams(putTeamParams),
  validateBody(putTeamBody),
  teamController.updateTeam,
);
teamRouter.put(
  '/team-roster/:teamRosterId',
  validateParams(putTeamRosterParams),
  validateBody(putTeamRosterBody),
  teamController.updateTeamRoster,
);
teamRouter.patch(
  '/:teamId/:organizationId',
  validateParams(patchTeamOrganizationParams),
  teamController.assignOrganizationToTeam,
);
teamRouter.patch(
  '/roster-request/approve/:rosterRequestId/:reviewedUserId',
  validateParams(patchApproveRosterRequestParams),
  teamController.approveRosterRequest,
);
teamRouter.patch(
  '/roster-request/deny/:rosterRequestId/:reviewedUserId',
  validateParams(patchDenyRosterRequestParams),
  teamController.denyRosterRequest,
);
teamRouter.patch(
  '/emergency-sub-request/approve/:emergencySubRequestId/:reviewedUserId',
  validateParams(patchApproveEmergencySubRequestParams),
  teamController.approveEmergencySubRequest,
);
teamRouter.patch(
  '/emergency-sub-request/deny/:emergencySubRequestId/:reviewedUserId',
  validateParams(patchDenyEmergencySubRequestParams),
  teamController.denyEmergencySubRequest,
);
teamRouter.delete(
  '/:teamId',
  validateParams(deleteTeamParams),
  teamController.deleteTeam,
);
