import {
  EmergencySubRequestsQuery,
  RosterRequestsQuery,
  SplitsQuery,
  TeamsQuery,
} from '@/database/query.js';
import type { InsertSplit, UpdateSplit } from '@/database/schema.js';
import type { SplitDto, SplitTableDto } from '@/router/split/v1/split.dto.js';
import ControllerError from '@/util/errors/controllerError.js';

export class SplitService {
  /**
   * Creates a singular entry of a split.
   */
  public static create = async (splitData: InsertSplit): Promise<SplitDto> => {
    const insertedSplit = await SplitsQuery.insert(splitData);

    return {
      split: insertedSplit,
      teams: [],
      rosterRequests: [],
      emergencySubRequests: [],
      overallStats: {
        sides: {
          numberBlueSides: null,
          numberRedSides: null,
        },
        games: [],
      },
    };
  };

  /**
   * Retrieves a singular entry of a split.
   */
  public static findById = async (splitId: string): Promise<SplitDto> => {
    const getSplit = await SplitsQuery.selectById(splitId);
    if (!getSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }
    const getTeams = await TeamsQuery.listBySplitId(splitId);
    const getRosterRequests = await RosterRequestsQuery.listBySplitId(splitId);
    const getEmergencySubRequests =
      await EmergencySubRequestsQuery.listBySplitId(splitId);

    return {
      split: getSplit,
      teams: getTeams,
      rosterRequests: getRosterRequests,
      emergencySubRequests: getEmergencySubRequests,
      overallStats: {
        // Implement in AEGIS-27
        sides: {
          numberBlueSides: null,
          numberRedSides: null,
        },
        games: [],
      },
    };
  };

  /**
   * Updates a singular entry of a split.
   */
  public static replaceById = async (
    splitId: string,
    splitData: UpdateSplit,
  ): Promise<SplitTableDto> => {
    const updatedSplit = await SplitsQuery.updateById(splitId!, splitData);
    if (!updatedSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }

    return {
      split: updatedSplit,
    };
  };

  /**
   * Deletes a singular entry of a split.
   */
  public static removeById = async (
    splitId: string,
  ): Promise<SplitTableDto> => {
    const deletedSplit = await SplitsQuery.deleteById(splitId);
    if (!deletedSplit) {
      throw new ControllerError(404, 'NotFound', 'Split not found', {
        splitId,
      });
    }

    return {
      split: deletedSplit,
    };
  };
}
