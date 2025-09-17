import type { NextFunction, Request, Response } from 'express';

export const TeamController = {
  /**
   * POST - /
   *
   * Creates a singular entry of a team competing in a split and its team
   *   rosters (if no user is present, team roster will be initialized as null).
   */
  createTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /roster-request
   *
   * Creates a singular entry of a roster request from a team.
   */
  createRosterRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(201).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST - /emergency-sub-request
   *
   * Creates a singular entry of an emergency sub request from a team.
   */
  createEmergencySubRequest: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.status(201).json();
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
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /{teamId}
   *
   * Updates a singular entry of a team.
   */
  updateTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT - /team-roster/{teamId}
   *
   * Updates a singular entry of the team’s roster.
   */
  updateTeamRoster: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json();
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH - /{teamId}/{organizationId}
   *
   * Assigns an organization to the team.
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
   * Approves a roster request by a user (typically an admin).
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
   * Denies a roster request by a user (typically an admin).
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
   * Approves an emergency sub request by a user (typically an admin).
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
   * Denies an emergency sub request by a user (typically an admin).
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
