import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';
import z from 'zod';

import {
  EMERGENCY_SUB_REQUESTS_SNAKE_CASE,
  LEAGUE_MATCHES_SNAKE_CASE,
  TEAMS_SNAKE_CASE,
  USERS_SNAKE_CASE,
} from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const emergencySubRequestRowSchema = z.strictObject({
  submittedById: z.uuid().nullable(),
  userId: z.uuid().nullable(),
  teamId: z.uuid().nullable(),
  leagueMatchId: z.uuid().nullable(),
  approved: z.coerce.boolean().nullable(),
  approvedAt: z.iso.date().nullable(),
  reviewedById: z.uuid().nullable(),
});

type EmergencySubRequestFields = z.infer<typeof emergencySubRequestRowSchema>;

export interface EmergencySubRequestsTable
  extends EmergencySubRequestFields,
    TableBase {}

export const createEmergencySubRequestsTable = async (
  db: Kysely<Database>,
): Promise<void> => {
  await createTableWithBase(db, EMERGENCY_SUB_REQUESTS_SNAKE_CASE, (t) =>
    t
      .addColumn('submitted_by_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('user_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('team_id', 'uuid', (col) =>
        col
          .references(`${TEAMS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('league_match_id', 'uuid', (col) =>
        col
          .references(`${LEAGUE_MATCHES_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      )
      .addColumn('approved', 'boolean')
      .addColumn('reviewed_by_id', 'uuid', (col) =>
        col
          .references(`${USERS_SNAKE_CASE}.id`)
          .onDelete('set null')
          .onUpdate('cascade'),
      ),
  );
};

export type EmergencySubRequestRow = Selectable<EmergencySubRequestsTable>;
export type InsertEmergencySubRequest = Insertable<EmergencySubRequestsTable>;
export type UpdateEmergencySubRequest = Updateable<EmergencySubRequestsTable>;
