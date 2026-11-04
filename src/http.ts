import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { CarmenAPIConfigError } from "./errors";

/** Regions the Carmen Cloud APIs are served from. */
export type CloudServiceRegion = "AUTO" | "EU" | "US";

/** Options shared by every client in this package. */
export interface CommonClientOptions {
  /**
   * Overrides the API base URL (e.g. `https://api.dev.carmencloud.com`).
   * Takes precedence over `cloudServiceRegion`.
   */
  endpoint?: string;
  /**
   * The region to send requests to. `AUTO` (the default) uses latency-based
   * routing.
   */
  cloudServiceRegion?: CloudServiceRegion;
  /** How many times a failed request is retried. Default: 3. */
  retryCount?: number;
}

/**
 * Creates the axios instance a client uses. Each client gets its own
 * instance, so retry settings never leak into the caller's global axios.
 */
export function createHttpClient(options: CommonClientOptions): AxiosInstance {
  const http = axios.create();
  axiosRetry(http, {
    retries: options.retryCount ?? 3,
    retryDelay: axiosRetry.exponentialDelay,
  });
  return http;
}

/** Resolves the API base URL from `endpoint` / `cloudServiceRegion`. */
export function selectApiBaseUrl(options: CommonClientOptions): string {
  if (options.endpoint) {
    return options.endpoint.replace(/\/+$/, "");
  }
  switch (options.cloudServiceRegion ?? "AUTO") {
    case "EU":
      return "https://eu-central-1.api.carmencloud.com";
    case "US":
      return "https://us-east-1.api.carmencloud.com";
    case "AUTO":
      return "https://api.carmencloud.com";
    default:
      throw new CarmenAPIConfigError(
        `Invalid cloud service region: '${options.cloudServiceRegion}'.`
      );
  }
}
