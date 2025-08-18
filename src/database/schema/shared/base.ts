import type { ColumnType, Generated } from 'kysely';

export interface TableBase {
  /** DB generates UUID */
  id: Generated<string>;
  /** DEFAULT now(), not settable */
  created_at: ColumnType<Date, never, never>;
  /** DEFAULT now(), not settable, trigger update */
  modified_at: ColumnType<Date, never, never>;
}
