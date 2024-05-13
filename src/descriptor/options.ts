import { APIStage } from "./apilistresponse";
import { UsagePlan } from "./usageplanlistresponse";

/**
 * An object containing configuration options for the Descriptor API client.
 */
export interface DescriptorAPIOptions {
  /**
   * The API key to be used for authentication. Setting an API key is optional
   * because some API resources are public. However, calling a resource that
   * require an API key without one will result in an exception. The API key
   * requirement is indicated in documentation for each client method.
   */
  apiKey?: string;

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

export type APIFilters = {
    // Exclude all object and array properties, and make everything optional
    [P in keyof APIStage as APIStage[P] extends object | any[] ? never : P]?: APIStage[P]
} & {
    detailed: boolean
};

export type UsagePlanFilters = {
  // Exclude all object and array properties, and make everything optional
  [P in keyof UsagePlan as UsagePlan[P] extends object | any[] ? never : P]?: UsagePlan[P]
};
