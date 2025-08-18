import { CreateTableBuilder, sql, type Kysely } from 'kysely';

import type { Database } from '@/database/database.js';

const MODIFIED_AT_TRIGGER_NAME = 'set_modified_at';

export const initiateInfra = async (db: Kysely<Database>) => {
  // Create auto-update modified_at on UPDATE (trigger + function)
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`.execute(db);
  await sql`
    CREATE OR REPLACE FUNCTION ${MODIFIED_AT_TRIGGER_NAME}() RETURNS trigger AS $$
    BEGIN
      NEW.modified_at := now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db);
};

const attachModifiedAtTrigger = async (
  db: Kysely<Database>,
  tableName: string,
): Promise<void> => {
  await sql`
    CREATE TRIGGER ${tableName}_${MODIFIED_AT_TRIGGER_NAME}
    BEFORE UPDATE ON ${tableName}
    FOR EACH ROW
    EXECUTE FUNCTION ${MODIFIED_AT_TRIGGER_NAME}();
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
