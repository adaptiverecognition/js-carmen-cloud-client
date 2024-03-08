import FormData from "form-data";
import axios from "axios";
import axiosRetry from 'axios-retry';
import urlcat from "urlcat";
import { CarmenAPIConfigError } from "../errors";
import { StorageAndHookAPIOptions } from "./options";
import { StorageStatusResponse } from "./storagestatusresponse";
import { Hooks } from "./hooks";

/**
 * A client for interacting with the Carmen Cloud Storage & Hook API.
 */
export class StorageAndHookAPIClient {
  private apiUrl: string;

  /**
   * Instantiates the client with a fixed set of options.
   * 
   * @param options An object containing configuration options for the client.
   */
  constructor(private options: StorageAndHookAPIOptions) {
    axiosRetry(axios, {
      retries: options.retryCount || 3,
      retryDelay: axiosRetry.exponentialDelay
    });
    this.apiUrl = this.getParametrizedApiUrl();
  }

  /**
   * Gets the current storage status and topic ARN (if it exists).
   * 
   * @returns The current storage status and topic ARN (if it exists).
   */
  async getStorageStatus(): Promise<StorageStatusResponse> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/status');
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as StorageStatusResponse;
  }

  /**
   * Gets the current storage status and topic ARN (if it exists).
   * 
   * @returns The current storage status and topic ARN (if it exists).
   */
  async getHooks(): Promise<Hooks> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/hooks');
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as Hooks;
  }

  private createRequestHeaders() {
    const headers: FormData.Headers = {
      "X-Api-Key": this.options.apiKey,
    };
    return headers;
  }

  private getParametrizedApiUrl() {
    const baseUrl = this.selectApiBaseUrl();
    return urlcat(baseUrl, "/storage");
  }

  private selectApiBaseUrl() {
    if (this.options.endpoint) {
      return this.options.endpoint;
    }
    if (this.options.cloudServiceRegion === "EU") {
      return "https://eu-central-1.api.carmencloud.com";
    }
    if (this.options.cloudServiceRegion === "US") {
      return "https://us-east-1.api.carmencloud.com";
    }
    if (this.options.cloudServiceRegion && this.options.cloudServiceRegion !== "AUTO") {
      throw new CarmenAPIConfigError(
        `Invalid cloud service region: '${this.options.cloudServiceRegion}'.`
      );
    }
    // cloudServiceRegion is not set or AUTO, use latency-based routing
    return "https://api.carmencloud.com";
  }
}
