import {
  type DiscordAccountRow,
  type EmergencySubRequestRow,
  type RiotAccountRow,
  type RosterRequestRow,
  type SplitRow,
  type TeamRow,
  type UserRow,
} from '@/database/schema.js';
import type { RosterRole } from '@/database/shared.js';

// TeamDto
export type PlayerDto = {
  role: string;
  user: UserRow | null;
  riotAccounts: RiotAccountRow[];
  discordAccounts: DiscordAccountRow[];
};
export type TeamDto = {
  team: TeamRow;
  split: SplitRow;
  roster: Record<RosterRole, PlayerDto>; // role -> DTO
  rosterRequests: RosterRequestRow[];
  emergencySubRequests: EmergencySubRequestRow[];
};

// RosterRequestDto
export type RosterRequestDto = {
  rosterRequest: RosterRequestRow;
};

// EmergencySubRequestDto
export type EmergencySubRequestDto = {
  emergencySubRequest: EmergencySubRequestDto;
};

// TeamRosterDto
export type TeamRosterDto = {
  teamRoster: TeamRosterDto;
};
