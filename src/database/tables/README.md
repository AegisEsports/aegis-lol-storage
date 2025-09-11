# Overview

## Const

```typescript
export const NAME = '';
export const NAME_SNAKE_CASE = '_';
```

## Schema

```typescript
import {
  type Insertable,
  type Kysely,
  type Selectable,
  type Updateable,
} from 'kysely';

import { TABLE_NAME_SNAKE_CASE } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export interface NAMETable extends TableBase {
  SAMPLE_COLUMN: string | null;
}

export const TABLE_NAME = '';
export const TABLE_NAME_SNAKE_CASE = '';

export const createUsersTable = async (db: Kysely<Database>): Promise<void> => {
  await createTableWithBase(db, TABLE_NAME_SNAKE_CASE, (t) =>
    t.addColumn('SAMPLE_COLUMN', 'varchar'),
  );
};

export type NAMERow = Selectable<NAMETable>;
export type NAMEInsert = Insertable<NAMETable>;
export type NAMEUpdate = Updateable<NAMETable>;
```

## Query

```typescript
import { db } from '@/database/database.js';
import {} from '@/database/schema.js';

export class NAMEQuery {
  // -- INSERT

  static insert(values: Insert): Promise<Row> {
    return db
      .insertInto(TABLE_NAME)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<Row | undefined> {
    return db
      .selectFrom(TABLE_NAME)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(id: string, update: Update): Promise<Row | undefined> {
    return db
      .updateTable(TABLE_NAME)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(id: string): Promise<Row | undefined> {
    return db
      .deleteFrom(TABLE_NAME)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
```
