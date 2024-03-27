/**
 * An object containing configuration options for the Storage & Hook API client.
 */
export interface StorageAndHookAPIOptions {
  /**
   * The API key to be used for authentication.
   */
  apiKey: string;

  /**
   * The URL of the API endpoint to call. Optional
   * if `cloudServiceRegion` is also set. Overrides
   * `cloudServiceRegion` if both properties are set.
   */
  endpoint?: string;

  /**
   * The cloud service region to use - `"AUTO"` for latency-based
   * automatic routing (default), `"EU"` for Europe and `"US"` for
   * the United States. Has no effect if `endpoint` is also set.
   */
  cloudServiceRegion?: "AUTO" | "EU" | "US";

  /**
   * How many times the request should be retried in case of a 5XX response
   * status code. Default: 3.
   */
  retryCount?: number;
}

/**
 * Contains options for filtering events.
 */
export interface EventFilters {
  /**
   * The maximum number of events to return. Default: 200.
   */
  limit?: number;

  /**
   * The order in which to return events. Default: `"asc"`.
   */
  order?: 'asc' | 'desc';

  /**
   * The token to continue a previous request. If provided, the request will return
   * events after the last event of the previous request.
   */
  'continuation-token'?: string;

  /**
   * The timestamp of the event to start at. If provided, the request will return
   * events after or at the provided timestamp.
   * 
   * **NOTE:** `before` and `after`˙are mutually exclusive.
   */
  before?: number;

  /**
   * The timestamp of the event to end at. If provided, the request will return
   * events before or at the provided timestamp.
   * 
   * **NOTE:** `before` and `after`˙are mutually exclusive.
   */
  after?: number;
}
