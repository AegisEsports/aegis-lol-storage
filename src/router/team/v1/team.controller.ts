import type { NextFunction, Request, Response } from 'express';

import { TeamService } from '@/router/team/v1/team.service.js';
import type {
  CreateEmergencySubRequestBody,
  CreateRosterRequestBody,
  CreateTeamBody,
  UpdateTeamBody,
  UpdateTeamRosterBody,
} from '@/router/team/v1/team.zod.js';

export const TeamController = {
  /**
   * POST - /
   */
  createTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { team, roster } = req.body as CreateTeamBody;

      res.status(201).json(await TeamService.create(team, roster));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /roster-request
   */
  createRosterRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { rosterRequest } = req.body as CreateRosterRequestBody;

      res
        .status(201)
        .json(await TeamService.createRosterRequest(rosterRequest));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /emergency-sub-request
   */
  createEmergencySubRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { emergencySubRequest } = req.body as CreateEmergencySubRequestBody;

      res
        .status(201)
        .json(await TeamService.createEmergencySubRequest(emergencySubRequest));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET - /{teamId}
   *
   * Retrieves a singular entry of a team and its players.
   */
  readTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.params;

      res.status(200).json(await TeamService.findById(teamId!));
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /{teamId}
   */
  updateTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamId } = req.params;
      const { team } = req.body as UpdateTeamBody;

      res.status(200).json(await TeamService.replaceById(teamId!, team));
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /team-roster/{teamId}
   */
  updateTeamRoster: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { teamRosterId } = req.params;
      const { teamRoster } = req.body as UpdateTeamRosterBody;

      res
        .status(200)
        .json(
          await TeamService.replaceTeamRosterById(teamRosterId!, teamRoster),
        );
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /{teamId}/{organizationId}
   */
  assignOrganizationToTeam: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /roster-request/approve/{teamRosterId}/{reviewedUserId}
   *
   * Approves a roster request by a user (by an admin).
   */
  approveRosterRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /roster-request/deny/{teamRosterId}/{reviewedUserId}
   *
   * Denies a roster request by a user (by an admin).
   */
  denyRosterRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /emergency-sub-request/approve/{teamRosterId}/{reviewedUserId}
   *
   * Approves an emergency sub request by a user (by an admin).
   */
  approveEmergencySubRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /emergency-sub-request/deny/{teamRosterId}/{reviewedUserId}
   *
   * Denies an emergency sub request by a user (by an admin).
   */
  denyEmergencySubRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE - /{teamId}
   *
   * Deletes a singular entry of the team.
   */
  deleteTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(501).json();
    } catch (err) {
      next(err);
    }
  },
};
