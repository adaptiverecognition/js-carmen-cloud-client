/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A list of events that match the query parameters and an optional continuation token for paging
 */
export interface EventsResponse {
  /**
   * A list of events that match the query parameters
   */
  events: {
    /**
     * The original event object, preserving the structure as it would have been returned by the API.
     */
    event: {
      [k: string]: unknown;
    };
    /**
     * An array of URLs where the images sent with the original request can be downloaded.
     */
    attachmentURLs: string[];
    /**
     * The millisecond-based Unix timestamp of the time the event was created.
     */
    creationTimestamp: number;
    /**
     * The API the event originates from. At the time of writing this documentation, the available APIs were `vehicle` and `transport` (Vehicle API and Transportation & Cargo API).
     */
    api: string;
    [k: string]: unknown;
  }[];
  /**
   * A token that can be passed in the query parameter `continuation-token` in the next request to continue pagination after the last event in the current batch.
   */
  continuationToken?: string;
  [k: string]: unknown;
}
