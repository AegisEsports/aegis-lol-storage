import type { ColumnType } from 'kysely';

/**
 * Wraps around table fields and marks a column as unable to update.
 *
 * Example usage:
 *
 * ```
 * export type DiscordAccountsTable =
 *  TableBase &
 *  MarkNonUpdateable<DiscordAccountFields, 'snowflakeId'>
 *
 * // To mark multiple fields
 * export type EmergencySubRequestsTable =
 *  TableBase &
 *  MarkNonUpdateable<
 *    EmergencySubRequestFields,
 *    'submittedById' | 'userId' | 'teamId' | 'leagueMatchId'
 *  >
 * ```
 *
 * This is so that Updateable<T> can properly mark which fields cannot be used,
 * especially useful in PUT requests.
 */
export type MarkNonUpdateable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: ColumnType<T[P], T[P], never>;
};
