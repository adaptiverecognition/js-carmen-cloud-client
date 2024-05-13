/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * The first element contains the number of requests used, the second one contains the number of remaining requests for a specific day. Otherwise, it contains two-element arrays of numbers for each day in the current month. The first element is the number of requests used, the second element is the number of requests remaining from the quota on the day.
 *
 * @minItems 2
 * @maxItems 2
 */
export type DailyQuotaUsage = [number, number];
/**
 * Quota Usage for a single Usage Plan. If the array is empty, the user hasn't used the usage plan in the current period, their entire quota is still available.
 *
 * This interface was referenced by `UsagePlanQuotaUsage`'s JSON-Schema definition
 * via the `patternProperty` "^[a-z0-9]+$".
 */
export type UsagePlanUsage = DailyQuotaUsage[];

/**
 * Quota usage data for the Usage Plans the authenticated user is a member of, between a start and end date. Property keys other than `startDate` and `endDate` are usage plan IDs.
 */
export type UsagePlanQuotaUsage = {
  startDate: string;
  endDate: string;
} & {
  [k: string]: UsagePlanUsage;
}
