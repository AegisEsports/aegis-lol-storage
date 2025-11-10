import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { db } from '@/database/database.js';
import { TeamService } from '@/router/team/v1/team.service.js';
import type {
  CreateEmergencySubRequestBody,
  CreateRosterRequestBody,
  CreateTeamBody,
  UpdateTeamBody,
  UpdateTeamRosterBody,
} from '@/router/team/v1/team.zod.js';

export class TeamController {
  private team: TeamService = new TeamService(db);

  /**
   * POST - /
   */
  public createTeam: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { team, roster } = req.body as CreateTeamBody;

      res.status(201).json(await this.team.create(team, roster));
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST - /roster-request
   */
  public createRosterRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { rosterRequest } = req.body as CreateRosterRequestBody;

      res.status(201).json(await this.team.createRosterRequest(rosterRequest));
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST - /emergency-sub-request
   */
  public createEmergencySubRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { emergencySubRequest } = req.body as CreateEmergencySubRequestBody;

      res
        .status(201)
        .json(await this.team.createEmergencySubRequest(emergencySubRequest));
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET - /{teamId}
   *
   * Retrieves a singular entry of a team and its players.
   */
  public readTeam: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { teamId } = req.params;

      res.status(200).json(await this.team.findById(teamId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /{teamId}
   */
  public updateTeam: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { teamId } = req.params;
      const { team } = req.body as UpdateTeamBody;

      res.status(200).json(await this.team.replaceById(teamId!, team));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT - /team-roster/{teamId}
   */
  public updateTeamRoster: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { teamRosterId } = req.params;
      const { teamRoster } = req.body as UpdateTeamRosterBody;

      res
        .status(200)
        .json(await this.team.replaceTeamRosterById(teamRosterId!, teamRoster));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /{teamId}/{organizationId}
   */
  public assignOrganizationToTeam: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { teamId, organizationId } = req.params;

      res
        .status(200)
        .json(await this.team.updateOrganizationById(teamId!, organizationId!));
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /roster-request/approve/{rosterRequestId}/{reviewedUserId}
   */
  public approveRosterRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { rosterRequestId, reviewedUserId } = req.params;

      res
        .status(200)
        .json(
          await this.team.updateApprovalInRosterRequest(
            true,
            rosterRequestId!,
            reviewedUserId!,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /roster-request/deny/{rosterRequestId}/{reviewedUserId}
   */
  public denyRosterRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { rosterRequestId, reviewedUserId } = req.params;

      res
        .status(200)
        .json(
          await this.team.updateApprovalInRosterRequest(
            false,
            rosterRequestId!,
            reviewedUserId!,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /emergency-sub-request/approve/{emergencySubRequestId}/{reviewedUserId}
   */
  public approveEmergencySubRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { emergencySubRequestId, reviewedUserId } = req.params;

      res
        .status(200)
        .json(
          await this.team.updateApprovalInEmergencySubRequest(
            true,
            emergencySubRequestId!,
            reviewedUserId!,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * PATCH - /emergency-sub-request/deny/{emergencySubRequestId}/{reviewedUserId}
   */
  public denyEmergencySubRequest: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { emergencySubRequestId, reviewedUserId } = req.params;

      res
        .status(200)
        .json(
          await this.team.updateApprovalInEmergencySubRequest(
            false,
            emergencySubRequestId!,
            reviewedUserId!,
          ),
        );
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE - /{teamId}
   *
   * Deletes a singular entry of the team.
   */
  public deleteTeam: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { teamId } = req.params;

      res.status(200).json(await this.team.removeById(teamId!));
    } catch (err) {
      next(err);
    }
  };
}
