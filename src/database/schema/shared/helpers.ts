import { CreateTableBuilder, sql, type Kysely } from 'kysely';

import type { Database } from '@/database/database.js';

const MODIFIED_AT_TRIGGER_NAME = 'set_modified_at';

export const initiateInfra = async (db: Kysely<Database>) => {
  // Create auto-update modified_at on UPDATE (trigger + function)
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.execute(db);
  await sql`
    CREATE OR REPLACE FUNCTION ${sql.raw(MODIFIED_AT_TRIGGER_NAME)}() RETURNS trigger
    LANGUAGE plpgsql AS $fn$
    BEGIN
      NEW.modified_at := now();
      RETURN NEW;
    END;
    $fn$;
  `.execute(db);
};

const attachModifiedAtTrigger = async (
  db: Kysely<Database>,
  tableName: string,
): Promise<void> => {
  const triggerName = `${tableName}_${MODIFIED_AT_TRIGGER_NAME}`;
  await sql`
    CREATE TRIGGER ${sql.raw(triggerName)}
    BEFORE UPDATE ON ${sql.raw(tableName)}
    FOR EACH ROW
    EXECUTE FUNCTION ${sql.raw(MODIFIED_AT_TRIGGER_NAME)}();
  `.execute(db);
};

const withBaseColumns = <TB extends string>(t: CreateTableBuilder<TB, never>) =>
  t
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('created_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('modified_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    );

/**
 * This helper function creates a table with
 * the base of columns 'id' | 'created_at' | 'modified_at'
 *
 * This avoids having to add those baseline columns in every schema file.
 */
export const createTableWithBase = async <TB extends string>(
  db: Kysely<Database>,
  table: TB,
  build: (
    t: CreateTableBuilder<TB, 'id' | 'created_at' | 'modified_at'>,
  ) => CreateTableBuilder<TB, any>,
) => {
  await build(withBaseColumns(db.schema.createTable(table))).execute();
  await attachModifiedAtTrigger(db, table);
};
