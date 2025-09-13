import { ORGANIZATIONS } from '@/database/const.js';
import { db } from '@/database/database.js';
import {
  type InsertOrganization,
  type OrganizationRow,
  type UpdateOrganization,
} from '@/database/schema.js';

export class OrganizationsQuery {
  // -- INSERT

  static insert(values: InsertOrganization): Promise<OrganizationRow> {
    return db
      .insertInto(ORGANIZATIONS)
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // -- SELECT

  static selectById(id: string): Promise<OrganizationRow | undefined> {
    return db
      .selectFrom(ORGANIZATIONS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  static listByUserId(userId: string): Promise<OrganizationRow[]> {
    return db
      .selectFrom(ORGANIZATIONS)
      .selectAll()
      .where('ownerId', '=', userId)
      .execute();
  }

  // -- UPDATE

  static updateById(
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

  static deleteById(id: string): Promise<OrganizationRow | undefined> {
    return db
      .deleteFrom(ORGANIZATIONS)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }
}
