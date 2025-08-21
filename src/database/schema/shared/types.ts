export type UserRole = 'Player' | 'Admin' | 'God';

export type LeagueRank =
  | 'Challenger'
  | 'Grandmaster'
  | 'Master'
  | 'Diamond'
  | 'Emerald'
  | 'Platinum'
  | 'Gold'
  | 'Silver'
  | 'Bronze'
  | 'Iron';

export type RosterMoveType =
  | 'Add'
  | 'Drop'
  | 'Change'
  | 'NameChange'
  | 'AltUpdate';

export type LeagueRole = 'Top' | 'Jungle' | 'Middle' | 'Bottom' | 'Support';
export type RosterRole =
  | 'Top'
  | 'Jungle'
  | 'Middle'
  | 'Bottom'
  | 'Support'
  | 'Sub1'
  | 'Sub2'
  | 'Sub3'
  | 'Sub4'
  | 'Sub5'
  | 'TeamLead1'
  | 'TeamLead2'
  | 'Coach'
  | 'Owner';

export type LeagueLane = 'Top' | 'Middle' | 'Bottom';

export type LeagueSide = 'Blue' | 'Red';

export type BestOf = 1 | 3 | 5;

export type MatchType = 'RegularSeason' | 'Playoffs';

export type EventType =
  | 'Tower'
  | 'Inhibitor'
  | 'ChemtechDrake'
  | 'CloudDrake'
  | 'HextechDrake'
  | 'InfernalDrake'
  | 'MountainDrake'
  | 'OceanDrake'
  | 'ElderDragon'
  | 'BaronNashor'
  | 'RiftHerald'
  | 'Kills'
  | 'TurretPlate'
  | 'Voidgrub'
  | 'Atakhan';
