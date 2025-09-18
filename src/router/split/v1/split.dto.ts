import type {
  EmergencySubRequestRow,
  RosterRequestRow,
  SplitRow,
  TeamRow,
} from '@/database/schema.js';

// SplitDto
export type SplitSidesStatsDto = {
  numberBlueSides: number | null;
  numberRedSides: number | null;
};
export type SplitGameStatsDto = {
  duration: number | null;
  totalKills: number | null;
  totalKillsAt15: number | null;
  killsPerMinute: number | null;
  damageToChampionsPerMinute: number | null;
  visionScorePerMinute: number | null;
};
export type SplitDto = {
  split: SplitRow;
  teams: TeamRow[];
  rosterRequests: RosterRequestRow[];
  emergencySubRequests: EmergencySubRequestRow[];
  overallStats: {
    sides: SplitSidesStatsDto;
    games: SplitGameStatsDto[];
  };
};

// SplitTableDto
export type SplitTableDto = {
  split: SplitRow;
};
