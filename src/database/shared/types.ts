export const USER_ROLES = ['Player', 'Admin', 'God'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const LEAGUE_RANKS = [
  'Challenger',
  'Grandmaster',
  'Master',
  'Diamond',
  'Emerald',
  'Platinum',
  'Gold',
  'Silver',
  'Bronze',
  'Iron',
] as const;
export type LeagueRank = (typeof LEAGUE_RANKS)[number];

export const ROSTER_MOVE_TYPES = [
  'Add',
  'Drop',
  'RoleChange',
  'NameChange',
  'AltUpdate',
] as const;
export type RosterMoveType = (typeof ROSTER_MOVE_TYPES)[number];

export const LEAGUE_ROLES = [
  'Top',
  'Jungle',
  'Middle',
  'Bottom',
  'Support',
] as const;
export type LeagueRole = (typeof LEAGUE_ROLES)[number];

export const ROSTER_ROLES = [
  'Top',
  'Jungle',
  'Middle',
  'Bottom',
  'Support',
  'Sub1',
  'Sub2',
  'Sub3',
  'Sub4',
  'Sub5',
  'TeamLead1',
  'TeamLead2',
  'Coach',
  'Owner',
] as const;
export type RosterRole = (typeof ROSTER_ROLES)[number];

export const LEAGUE_LANES = ['Top', 'Middle', 'Bottom'] as const;
export type LeagueLane = (typeof LEAGUE_LANES)[number];

export const LEAGUE_SIDES = ['Blue', 'Red'] as const;
export type LeagueSide = (typeof LEAGUE_SIDES)[number];

export const BEST_OFS = [1, 3, 5] as const;
export type BestOf = (typeof BEST_OFS)[number];

export const MATCH_TYPES = ['RegularSeason', 'Playoffs', 'PlayIn'] as const;
export type MatchType = (typeof MATCH_TYPES)[number];

export const EVENT_TYPES = [
  'Tower',
  'Inhibitor',
  'ChemtechDrake',
  'CloudDrake',
  'HextechDrake',
  'InfernalDrake',
  'MountainDrake',
  'OceanDrake',
  'ElderDragon',
  'BaronNashor',
  'RiftHerald',
  'Kills',
  'TurretPlate',
  'Voidgrub',
  'Atakhan',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];
