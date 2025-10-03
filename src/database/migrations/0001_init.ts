import { sql, type Kysely } from 'kysely';

import type { Database } from '@/database/database.js';
import {
  createBannedChampsTable,
  createDiscordAccountsTable,
  createEmergencySubRequestsTable,
  createGameEventsTable,
  createGameSkillLevelUpsTable,
  createGameStoreActionsTable,
  createGameTeamGoldsTable,
  createLeagueBansTable,
  createLeagueGamesTable,
  createLeagueMatchesTable,
  createLeaguesTable,
  createOrganizationsTable,
  createPlayerStatsTable,
  createRiotAccountsTable,
  createRosterRequestsTable,
  createSplitsTable,
  createTeamRostersTable,
  createTeamsTable,
  createTeamStatsTable,
  createUsersTable,
} from '@/database/schema.js';
import { initiateInfra } from '@/database/shared.js';

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
  await createGameSkillLevelUpsTable(db);
  await createGameStoreActionsTable(db);
  await createGameTeamGoldsTable(db);
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
            AND ((i.indkey::int2[])[1:cardinality(r.fk_attnums)]) = r.fk_attnums
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
