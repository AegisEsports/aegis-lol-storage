import type { Kysely } from 'kysely';

import { ORGANIZATIONS } from '@/database/const.js';
import type { Database } from '@/database/database.js';
import {
  type InsertOrganization,
  type OrganizationRow,
  type UpdateOrganization,
} from '@/database/schema.js';

export class OrganizationsQuery {
  // -- INSERT

  static insert(
    db: Kysely<Database>,
    values: InsertOrganization,
  ): Promise<OrganizationRow> {
    return db
      .insertInto(ORGANIZATIONS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(
    db: Kysely<Database>,
    id: string,
  ): Promise<OrganizationRow | undefined> {
    return db
      .selectFrom(ORGANIZATIONS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByUserId(
    db: Kysely<Database>,
    userId: string,
  ): Promise<OrganizationRow[]> {
    return db
      .selectFrom(ORGANIZATIONS)
      .selectAll()
      .where('ownerId', '=', userId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: Kysely<Database>,
    id: string,
    update: UpdateOrganization,
  ): Promise<OrganizationRow | undefined> {
    return db
      .updateTable(ORGANIZATIONS)
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  // -- DELETE

  static deleteById(
    db: Kysely<Database>,
    id: string,
  ): Promise<OrganizationRow | undefined> {
    return db
      .deleteFrom(ORGANIZATIONS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
