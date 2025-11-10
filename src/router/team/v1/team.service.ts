import type { Kysely } from 'kysely';

import type { Database } from '@/database/database.js';
import {
  BannedChampsQuery,
  DiscordAccountsQuery,
  EmergencySubRequestsQuery,
  LeagueGamesQuery,
  LeagueMatchesQuery,
  PlayerStatsQuery,
  RiotAccountsQuery,
  RosterRequestsQuery,
  SplitsQuery,
  TeamRostersQuery,
  TeamsQuery,
  TeamStatsQuery,
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
  constructor(private db: Kysely<Database>) {}

  /**
   * Helper function to turn TeamRosterRow[] -> Record<string, PlayerDto>
   */
  private createRosterRecord = async (
    roster: TeamRosterRow[],
  ): Promise<Record<string, PlayerDto>> => {
    const playerEntries = await Promise.all(
      roster.map(async (r) => {
        const [user, riotAccounts, discordAccounts] = r.userId
          ? await Promise.all([
              UsersQuery.selectById(this.db, r.userId),
              RiotAccountsQuery.listByUserId(this.db, r.userId),
              DiscordAccountsQuery.listByUserId(this.db, r.userId),
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
  public create = async (
    teamData: InsertTeam,
    rosterData: CreateTeamRoster,
  ): Promise<TeamDto> => {
    const insertedTeam = await TeamsQuery.insert(this.db, teamData);
    const getSplit = await SplitsQuery.selectById(this.db, teamData.splitId);
    // For the roles not listed in 'roster', create default ones.
    const unfulfilledRoles = (() => {
      const used = new Set<RosterRole>(rosterData?.map((r) => r.role));
      return ROSTER_ROLES.filter((r) => !used.has(r)) as RosterRole[];
    })();
    unfulfilledRoles.forEach((role) => {
      rosterData.push({ userId: null, role });
    });
    const insertedRoster = await Promise.all(
      rosterData.map(async (r) => {
        return await TeamRostersQuery.insert(this.db, {
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
      matches: [],
      championStats: {
        picks: [],
        bansBy: [],
        bansAgainst: [],
      },
      rosterRequests: [],
      emergencySubRequests: [],
    };
  };

  /**
   * Creates a singular entry of a roster request from a team.
   */
  public createRosterRequest = async (
    data: InsertRosterRequest,
  ): Promise<RosterRequestDto> => {
    const insertedRosterRequest = await RosterRequestsQuery.insert(
      this.db,
      data,
    );

    return {
      rosterRequest: insertedRosterRequest,
    };
  };

  /**
   * Creates a singular entry of an emergency sub request from a team.
   */
  public createEmergencySubRequest = async (
    data: InsertEmergencySubRequest,
  ): Promise<EmergencySubRequestDto> => {
    const insertedESubRequest = await EmergencySubRequestsQuery.insert(
      this.db,
      data,
    );

    return {
      emergencySubRequest: insertedESubRequest,
    };
  };

  /**
   * Retrieves a singular entry of a team.
   */
  public findById = async (teamId: string): Promise<TeamDto> => {
    const getTeam = await TeamsQuery.selectById(this.db, teamId);
    if (!getTeam) {
      throw new ControllerError(404, 'NotFound', 'Team not found', {
        teamId,
      });
    }
    const getSplit = await SplitsQuery.selectById(this.db, getTeam.splitId);
    const getTeamRoster = await TeamRostersQuery.listByTeamId(this.db, teamId);
    const rosterRecord = await this.createRosterRecord(getTeamRoster);
    const getChampionPicks = await PlayerStatsQuery.selectCountPicksByTeamId(
      this.db,
      teamId,
    );
    const getChampionBansBy = await BannedChampsQuery.selectCountByTeamId(
      this.db,
      teamId,
    );
    const getChampionBansAgainst =
      await BannedChampsQuery.selectCountAgainstByTeamId(this.db, teamId);
    const getRosterRequests = await RosterRequestsQuery.listByTeamId(
      this.db,
      teamId,
    );
    const getEmergencySubRequests =
      await EmergencySubRequestsQuery.listByTeamId(this.db, teamId);
    // Build matches object with the nested array of games played
    const getMatches = await LeagueMatchesQuery.listByTeamId(this.db, teamId);
    for (const match of getMatches) {
      const leagueGameStats = await LeagueGamesQuery.listByMatchId(
        this.db,
        match.id,
      );
      match.games = await Promise.all(
        leagueGameStats.map(async (game) => {
          const side = game.blueTeamId === teamId ? 'Blue' : 'Red';

          return {
            ...game,
            side,
            stats: await TeamStatsQuery.selectByGameAndTeam(
              this.db,
              game.id,
              teamId,
            ),
            players: await PlayerStatsQuery.selectByGameAndTeam(
              this.db,
              game.id,
              teamId,
            ),
          };
        }),
      );
    }

    return {
      team: getTeam,
      split: getSplit!,
      roster: rosterRecord,
      matches: getMatches,
      championStats: {
        picks: getChampionPicks,
        bansBy: getChampionBansBy,
        bansAgainst: getChampionBansAgainst,
      },
      rosterRequests: getRosterRequests,
      emergencySubRequests: getEmergencySubRequests,
    };
  };

  /**
   * Updates a singular entry of a team.
   */
  public replaceById = async (
    teamId: string,
    teamData: UpdateTeam,
  ): Promise<TeamTableDto> => {
    const updatedTeam = await TeamsQuery.updateById(this.db, teamId, teamData);
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
  public replaceTeamRosterById = async (
    teamRosterId: string,
    teamRosterData: UpdateTeamRoster,
  ): Promise<TeamRosterDto> => {
    const updatedTeamRoster = await TeamRostersQuery.updateById(
      this.db,
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
  public updateOrganizationById = async (
    teamId: string,
    organizationId: string,
  ): Promise<TeamTableDto> => {
    const patchedTeam = await TeamsQuery.setOrganizationId(
      this.db,
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
  public updateApprovalInRosterRequest = async (
    approval: boolean,
    rosterRequestId: string,
    userReviewedById: string,
  ): Promise<RosterRequestDto> => {
    const patchedRosterRequest = await RosterRequestsQuery.setApproval(
      this.db,
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
  public updateApprovalInEmergencySubRequest = async (
    approval: boolean,
    emergencySubRequestId: string,
    userReviewedById: string,
  ): Promise<EmergencySubRequestDto> => {
    const patchedEmergencySubRequest =
      await EmergencySubRequestsQuery.setApproval(
        this.db,
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
  public removeById = async (teamId: string): Promise<TeamTableDto> => {
    const deletedTeam = await TeamsQuery.deleteById(this.db, teamId);
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
