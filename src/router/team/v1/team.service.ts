import {
  DiscordAccountsQuery,
  EmergencySubRequestsQuery,
  RiotAccountsQuery,
  RosterRequestsQuery,
  SplitsQuery,
  TeamRostersQuery,
  TeamsQuery,
  UsersQuery,
} from '@/database/query.js';
import type {
  InsertEmergencySubRequest,
  InsertRosterRequest,
  InsertTeam,
  TeamRosterRow,
  UpdateTeam,
  UpdateTeamRoster,
} from '@/database/schema.js';
import { ROSTER_ROLES, type RosterRole } from '@/database/shared.js';
import ControllerError from '@/util/errors/controllerError.js';
import type {
  EmergencySubRequestDto,
  PlayerDto,
  RosterRequestDto,
  TeamDto,
  TeamRosterDto,
  TeamTableDto,
} from './team.dto.js';
import type { CreateTeamRoster } from './team.zod.js';

export class TeamService {
  /**
   * Helper function to turn TeamRosterRow[] -> Record<string, PlayerDto>
   */
  private static createRosterRecord = async (
    roster: TeamRosterRow[],
  ): Promise<Record<string, PlayerDto>> => {
    const playerEntries = await Promise.all(
      roster.map(async (r) => {
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

    return Object.fromEntries(playerEntries) as Record<RosterRole, PlayerDto>;
  };

  /**
   * Creates a singular entry of a team competing in a split and its team
   *   rosters (if no user is present, team roster will be initialized as null).
   */
  public static create = async (
    teamData: InsertTeam,
    rosterData: CreateTeamRoster,
  ): Promise<TeamDto> => {
    const insertedTeam = await TeamsQuery.insert(teamData);
    const getSplit = await SplitsQuery.selectById(teamData.splitId);
    // For the roles not listed in 'roster', create default ones.
    const unfulfilledRoles = (() => {
      const used = new Set<RosterRole>(rosterData?.map((r) => r.role));
      return ROSTER_ROLES.filter((r) => !used.has(r)) as RosterRole[];
    })();
    unfulfilledRoles.forEach(async (role) => {
      rosterData.push({ userId: null, role });
    });
    const insertedRoster = await Promise.all(
      rosterData.map(async (r) => {
        return await TeamRostersQuery.insert({
          teamId: insertedTeam.id,
          userId: r.userId,
          role: r.role,
        });
      }),
    );
    const rosterRecord = await this.createRosterRecord(insertedRoster);

    return {
      team: insertedTeam,
      split: getSplit!,
      roster: rosterRecord,
      rosterRequests: [],
      emergencySubRequests: [],
    };
  };

  /**
   * Creates a singular entry of a roster request from a team.
   */
  public static createRosterRequest = async (
    data: InsertRosterRequest,
  ): Promise<RosterRequestDto> => {
    const insertedRosterRequest = await RosterRequestsQuery.insert(data);

    return {
      rosterRequest: insertedRosterRequest,
    };
  };

  /**
   * Creates a singular entry of an emergency sub request from a team.
   */
  public static createEmergencySubRequest = async (
    data: InsertEmergencySubRequest,
  ): Promise<EmergencySubRequestDto> => {
    const insertedESubRequest = await EmergencySubRequestsQuery.insert(data);

    return {
      emergencySubRequest: insertedESubRequest,
    };
  };

  /**
   * Retrieves a singular entry of a team.
   */
  public static findById = async (teamId: string): Promise<TeamDto> => {
    const getTeam = await TeamsQuery.selectById(teamId);
    if (!getTeam) {
      throw new ControllerError(404, 'NotFound', 'Team not found', {
        teamId,
      });
    }
    const getSplit = await SplitsQuery.selectById(getTeam.splitId);
    const getTeamRoster = await TeamRostersQuery.listByTeamId(teamId);
    const rosterRecord = await this.createRosterRecord(getTeamRoster);
    const getRosterRequests = await RosterRequestsQuery.listByTeamId(teamId);
    const getEmergencySubRequests =
      await EmergencySubRequestsQuery.listByTeamId(teamId);

    return {
      team: getTeam,
      split: getSplit!,
      roster: rosterRecord,
      rosterRequests: getRosterRequests,
      emergencySubRequests: getEmergencySubRequests,
    };
  };

  /**
   * Updates a singular entry of a team.
   */
  public static replaceById = async (
    teamId: string,
    teamData: UpdateTeam,
  ): Promise<TeamTableDto> => {
    const updatedTeam = await TeamsQuery.updateById(teamId, teamData);
    if (!updatedTeam) {
      throw new ControllerError(404, 'NotFound', 'Team not found', {
        teamId,
      });
    }

    return {
      team: updatedTeam,
    };
  };

  /**
   * Updates a singular entry of the team’s roster.
   */
  public static replaceTeamRosterById = async (
    teamRosterId: string,
    teamRosterData: UpdateTeamRoster,
  ): Promise<TeamRosterDto> => {
    const updatedTeamRoster = await TeamRostersQuery.updateById(
      teamRosterId,
      teamRosterData,
    );
    if (!updatedTeamRoster) {
      throw new ControllerError(404, 'NotFound', 'Team roster not found', {
        teamRosterId,
      });
    }

    return {
      teamRoster: updatedTeamRoster,
    };
  };

  /**
   * Assigns an organization to the team.
   */
  public static updateOrganizationById = async (
    teamId: string,
    organizationId: string,
  ): Promise<TeamTableDto> => {
    const patchedTeam = await TeamsQuery.setOrganizationId(
      teamId,
      organizationId,
    );
    if (!patchedTeam) {
      throw new ControllerError(404, 'NotFound', 'Team not found', {
        teamId,
      });
    }

    return {
      team: patchedTeam,
    };
  };

  /**
   * Approves/denies a roster request by a user (by an admin).
   */
  public static updateApprovalInRosterRequest = async (
    approval: boolean,
    rosterRequestId: string,
    userReviewedById: string,
  ): Promise<RosterRequestDto> => {
    const patchedRosterRequest = await RosterRequestsQuery.setApproval(
      approval,
      rosterRequestId,
      userReviewedById,
    );
    if (!patchedRosterRequest) {
      throw new ControllerError(404, 'NotFound', 'Roster request not found', {
        rosterRequestId,
      });
    }

    return {
      rosterRequest: patchedRosterRequest,
    };
  };

  /**
   * Approves/denies an emergency sub request by a user (by an admin).
   */
  public static updateApprovalInEmergencySubRequest = async (
    approval: boolean,
    emergencySubRequestId: string,
    userReviewedById: string,
  ): Promise<EmergencySubRequestDto> => {
    const patchedEmergencySubRequest =
      await EmergencySubRequestsQuery.setApproval(
        approval,
        emergencySubRequestId,
        userReviewedById,
      );
    if (!patchedEmergencySubRequest) {
      throw new ControllerError(
        404,
        'NotFound',
        'Emergency sub request not found',
        {
          emergencySubRequestId,
        },
      );
    }

    return {
      emergencySubRequest: patchedEmergencySubRequest,
    };
  };

  /**
   * Deletes a singular entry of a team.
   */
  public static removeById = async (teamId: string): Promise<TeamTableDto> => {
    const deletedTeam = await TeamsQuery.deleteById(teamId);
    if (!deletedTeam) {
      throw new ControllerError(404, 'NotFound', 'Team not found', {
        teamId,
      });
    }

    return {
      team: deletedTeam,
    };
  };
}
