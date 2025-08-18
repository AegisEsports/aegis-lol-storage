import { sql, type Kysely } from 'kysely';

import type { Database } from '@/database/database.js';
import { createBannedChampsTable } from '@/database/schema/bannedChamps.js';
import { createDiscordAccountsTable } from '@/database/schema/discordAccounts.js';
import { createEmergencySubRequestsTable } from '@/database/schema/emergencySubRequests.js';
import { createGameEventsTable } from '@/database/schema/gameEvents.js';
import { createLeagueBansTable } from '@/database/schema/leagueBans.js';
import { createLeagueGamesTable } from '@/database/schema/leagueGames.js';
import { createLeagueMatchesTable } from '@/database/schema/leagueMatches.js';
import { createLeaguesTable } from '@/database/schema/leagues.js';
import { createOrganizationsTable } from '@/database/schema/organizations.js';
import { createPlayerStatsTable } from '@/database/schema/playerStats.js';
import { createRiotAccountsTable } from '@/database/schema/riotAccounts.js';
import { createRiotMatchDataTable } from '@/database/schema/riotMatchData.js';
import { createRosterRequestsTable } from '@/database/schema/rosterRequests.js';
import { initiateInfra } from '@/database/schema/shared/helpers.js';
import { createSplitsTable } from '@/database/schema/splits.js';
import { createTeamRostersTable } from '@/database/schema/teamRosters.js';
import { createTeamsTable } from '@/database/schema/teams.js';
import { createTeamStatsTable } from '@/database/schema/teamStats.js';
import { createUsersTable } from '@/database/schema/users.js';

export const up = async (db: Kysely<Database>): Promise<void> => {
  // Create auto-update modified_at on UPDATE (trigger + function)
  await initiateInfra(db);

  // Create tables with schemas
  await createLeaguesTable(db);
  await createUsersTable(db);
  await createSplitsTable(db);
  await createRiotAccountsTable(db);
  await createDiscordAccountsTable(db);
  await createOrganizationsTable(db);
  await createTeamsTable(db);
  await createTeamRostersTable(db);
  await createRosterRequestsTable(db);
  await createLeagueMatchesTable(db);
  await createLeagueBansTable(db);
  await createEmergencySubRequestsTable(db);
  await createLeagueGamesTable(db);
  await createGameEventsTable(db);
  await createRiotMatchDataTable(db);
  await createPlayerStatsTable(db);
  await createTeamStatsTable(db);
  await createBannedChampsTable(db);

  // Create missing indexes for ALL foreign keys in a schema
  await sql`
    -- Skips FKs already covered by ANY existing index (unique or not).
    CREATE OR REPLACE FUNCTION ensure_fk_indexes(target_schema text DEFAULT 'public')
    RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
      r record;
      idx_name text;
      cols_sql text;
    BEGIN
      FOR r IN
        SELECT
          ns.nspname  AS schemaname,
          cl.relname  AS tablename,
          co.conname  AS constraint_name,
          co.conrelid AS table_oid,
          co.conkey   AS fk_attnums, -- smallint[]
          ARRAY_AGG(a.attname ORDER BY k.ordinality) AS fk_cols
        FROM pg_constraint co
        JOIN pg_class cl        ON cl.oid = co.conrelid
        JOIN pg_namespace ns    ON ns.oid = cl.relnamespace
        JOIN LATERAL unnest(co.conkey) WITH ORDINALITY AS k(attnum, ordinality) ON TRUE
        JOIN pg_attribute a     ON a.attrelid = cl.oid AND a.attnum = k.attnum
        WHERE co.contype = 'f'
          AND ns.nspname = target_schema
        GROUP BY ns.nspname, cl.relname, co.conname, co.conrelid, co.conkey
      LOOP
        -- If there is NO existing index whose leading columns equal the FK columns...
        IF NOT EXISTS (
          SELECT 1
          FROM pg_index i
          WHERE i.indrelid = r.table_oid
            AND i.indisvalid
            AND i.indisready
            -- Leading columns must match the FK column attnums in order:
            AND i.indkey::int[] [1:array_length(r.fk_attnums,1)] = r.fk_attnums::int[]
        ) THEN
          idx_name := format('idx_%s_%s_fk', r.tablename, array_to_string(r.fk_cols, '_'));
          cols_sql := array_to_string(ARRAY(SELECT format('%I', c) FROM unnest(r.fk_cols) AS c), ', ');
          EXECUTE format('CREATE INDEX %I ON %I.%I (%s)', idx_name, r.schemaname, r.tablename, cols_sql);
        END IF;
      END LOOP;
    END $$;
  `.execute(db);
  await sql`SELECT ensure_fk_indexes('public')`.execute(db);
};

export const down = async (db: Kysely<Database>): Promise<void> => {
  // NOTE: this wipes the entire 'public' schema.
  await sql`DROP SCHEMA IF EXISTS public CASCADE`.execute(db);
  await sql`CREATE SCHEMA public`.execute(db);

  // Re-grant defaults so new objects are creatable
  await sql`GRANT USAGE, CREATE ON SCHEMA public TO PUBLIC`.execute(db);
};
