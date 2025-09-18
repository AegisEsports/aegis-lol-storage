import type { NextFunction, Request, Response } from 'express';

import {
  DiscordAccountsQuery,
  RiotAccountsQuery,
  SplitsQuery,
  TeamRostersQuery,
  TeamsQuery,
  UsersQuery,
} from '@/database/query.js';
import { ROSTER_ROLES, type RosterRole } from '@/database/shared.js';
import type { PlayerDto, TeamDto } from '@/router/team/v1/team.dto.js';
import type { CreateTeamBody } from '@/router/team/v1/team.zod.js';

export const TeamController = {
  /**
   * POST - /
   *
   * Creates a singular entry of a team competing in a split and its team
   *   rosters (if no user is present, team roster will be initialized as null).
   */
  createTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { team, roster } = req.body as CreateTeamBody;
      const insertedTeam = await TeamsQuery.insert(team);
      const getSplit = await SplitsQuery.selectById(team.splitId);
      // For the roles not listed in 'roster', create default ones.
      const unfulfilledRoles = (() => {
        const used = new Set<RosterRole>(roster?.map((r) => r.role));
        return ROSTER_ROLES.filter((r) => !used.has(r)) as RosterRole[];
      })();
      unfulfilledRoles.forEach(async (role) => {
        roster.push({ userId: null, role });
      });
      const insertedRoster = await Promise.all(
        roster.map(async (r) => {
          return await TeamRostersQuery.insert({
            teamId: insertedTeam.id,
            userId: r.userId,
            role: r.role,
          });
        }),
      );
      const playerEntries = await Promise.all(
        insertedRoster.map(async (r) => {
          const [user, riotAccounts, discordAccounts] = r.userId
            ? await Promise.all([
                UsersQuery.selectById(r.userId),
                RiotAccountsQuery.listByUserId(r.userId),
                DiscordAccountsQuery.listByUserId(r.userId),
              ])
            : [null, [], []];
          const playerDto: PlayerDto = {
            role: r.role,
            user: user ?? null,
            riotAccounts,
            discordAccounts,
          };
          return [r.role, playerDto] as const;
        }),
      );
      const rosterRecord = Object.fromEntries(playerEntries) as Record<
        RosterRole,
        PlayerDto
      >;

      const dto: TeamDto = {
        team: insertedTeam,
        split: getSplit!,
        roster: rosterRecord,
        rosterRequests: [],
        emergencySubRequests: [],
      };
      res.status(201).json(dto);
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
