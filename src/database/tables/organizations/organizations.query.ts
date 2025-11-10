import { ORGANIZATIONS } from '@/database/const.js';
import {
  type InsertOrganization,
  type OrganizationRow,
  type UpdateOrganization,
} from '@/database/schema.js';
import type { DbType } from '@/database/types.js';

export class OrganizationsQuery {
  // -- INSERT

  static insert(
    db: DbType,
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
    db: DbType,
    id: string,
  ): Promise<OrganizationRow | undefined> {
    return db
      .selectFrom(ORGANIZATIONS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByUserId(db: DbType, userId: string): Promise<OrganizationRow[]> {
    return db
      .selectFrom(ORGANIZATIONS)
      .selectAll()
      .where('ownerId', '=', userId)
      .execute();
  }

  // -- UPDATE

  static updateById(
    db: DbType,
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
    db: DbType,
    id: string,
  ): Promise<OrganizationRow | undefined> {
    return db
      .deleteFrom(ORGANIZATIONS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
