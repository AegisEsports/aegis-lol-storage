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
  'Unknown',
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

export const MATCH_SIDES = ['Away', 'Home'] as const;
export type MatchSide = (typeof MATCH_SIDES)[number];

export const BEST_OFS = [1, 3, 5] as const;
export type BestOf = (typeof BEST_OFS)[number];

export const MATCH_TYPES = ['RegularSeason', 'Playoffs', 'PlayIn'] as const;
export type MatchType = (typeof MATCH_TYPES)[number];

export const EVENT_TYPES = [
  'Building',
  'Dragon',
  'Baron_Nashor',
  'Rift_Herald',
  'Kill',
  'Voidgrub',
  'Atakhan',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const OBJECTIVE_TYPES = [
  'Turret_Plate',
  'Outer_Tower',
  'Inner_Tower',
  'Base_Tower',
  'Nexus_Tower',
  'Inhibitor',
  'Chemtech_Dragon',
  'Cloud_Dragon',
  'Hextech_Dragon',
  'Infernal_Dragon',
  'Mountain_Dragon',
  'Ocean_Dragon',
  'Elder_Dragon',
] as const;
export type ObjectiveType = (typeof OBJECTIVE_TYPES)[number];

export const SKILL_SLOTS = ['Q', 'W', 'E', 'R'];
export type SkillSlots = (typeof SKILL_SLOTS)[number];

export const SKILL_LEVEL_UP_TYPE = ['Normal', 'Evolve'];
export type SkillLevelUpTypes = (typeof SKILL_LEVEL_UP_TYPE)[number];

export const STORE_ACTION_TYPES = ['Purchase', 'Sell'];
export type StoreActionTypes = (typeof STORE_ACTION_TYPES)[number];

export const IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.bmp',
  '.tiff',
  '.avif',
] as const;
export type ImageExtensions = (typeof IMAGE_EXTENSIONS)[number];
