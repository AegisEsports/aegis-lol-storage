import type { ColumnType, GeneratedAlways } from 'kysely';

export type TableBase = {
  /** DB generates UUID */
  id: GeneratedAlways<string>;
  /** DEFAULT now(), not settable */
  createdAt: ColumnType<string, never, never>;
  /** DEFAULT now(), not settable, trigger update */
  modifiedAt: ColumnType<string, never, never>;
};
