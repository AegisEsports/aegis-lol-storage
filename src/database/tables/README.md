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
import z from 'zod';

import { NAMES_SNAKE_CASE } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import { createTableWithBase, type TableBase } from '@/database/shared.js';

export const nameRowSchema = z.strictObject({});
type NameFields = z.infer<typeof nameRowSchema>;
export type NamesTable = TableBase & NameFields;

export const createNamesTable = async (db: Kysely<Database>): Promise<void> => {
  await createTableWithBase(db, NAMES_SNAKE_CASE, (t) =>
    t.addColumn('COLUMN', 'varchar'),
  );
};

export type NameRow = Selectable<NamesTable>;
export type InsertName = Insertable<NamesTable>;
export type UpdateName = Updateable<NamesTable>;
```

## Query

```typescript
import type { Kysely } from 'kysely';

import { TABLE_NAME } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertName,
  type UpdateName,
  type NameRow,
} from '@/database/schema.js';

export class NamesQuery {
  // -- INSERT

  static insert(db: Kysely<Database>, values: InsertName): Promise<NameRow> {
    return db
      .insertInto(TABLE_NAME)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<NameRow | undefined> {
    return db
      .selectFrom(TABLE_NAME)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
    id: string,
    update: UpdateName,
  ): Promise<NameRow | undefined> {
    return db
      .updateTable(TABLE_NAME)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<NameRow | undefined> {
    return db
      .deleteFrom(TABLE_NAME)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
```
