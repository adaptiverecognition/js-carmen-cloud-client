import FormData from "form-data";
import axios from "axios";
import axiosRetry from 'axios-retry';
import urlcat from "urlcat";
import { CarmenAPIConfigError } from "../errors";
import { EventFilters, StorageAndHookAPIOptions } from "./options";
import { StorageStatusResponse } from "./storagestatusresponse";
import { Hooks } from "./hooks";
import { Hook } from "./hook";
import { UpdateHookRequest } from "./updatehookrequest";
import { StorageStatusRequest } from "./apistoragestatusrequest";
import { CreateHookRequest } from "./createhookrequest";
import { EventsResponse } from "./eventsresponse";

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
   * Lists stored events for the API specified. Only events created in the last
   * 24 hours are retained.
   * 
   * @param api The API the events of which to query. Valid values are `vehicle`
   * and `transport`.
   * @returns The list of events and an optional continuation token if there
   * is more than one page.
   */
  async getEvents(api: 'vehicle' | 'transport', filters?: EventFilters): Promise<EventsResponse> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/events/:api', { api, ...filters });
    console.log(url);
    console.log(headers);
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as EventsResponse;
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
   * Enables or disables storage based on the settings specified.
   * 
   * @param apis An object with optional boolean properties `vehicle` and
   * `transport`. If the property value is `true`, storage will be enabled for
   * the API specified. If it is `false`, it will be disabled. If unspecified,
   * it will be left as it is.
   * @returns The updated storage status and topic ARN (if it exists).
   */
  async updateStorageStatus(apis: StorageStatusRequest): Promise<StorageStatusResponse> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/status');
    const httpResponse = await axios.patch(url, apis, { headers });

    return httpResponse.data as StorageStatusResponse;
  }

  /**
   * List currently registered webhooks.
   * 
   * @returns An array of Hook objects.
   */
  async getHooks(): Promise<Hooks> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/hooks');
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as Hooks;
  }

  /**
   * Get the attributes of a webhook.
   * 
   * @param hookUrl The URL of the webhook.
   * 
   * @returns A Hook object that contains the attributes of the webhook specified.
   */
  async getHook(hookUrl: string): Promise<Hook> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/hooks/:hookUrl', { hookUrl });
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as Hook;
  }

  /**
   * Registers a new webhook
   * 
   * @param hook The attributes of the hook to create: its URL and the APIs to
   * subscribe to.
   * 
   * @returns A Hook object with the attributes of the newly created webhook.
   */
  async createHook(hook: CreateHookRequest): Promise<Hook> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/hooks');
    const httpResponse = await axios.post(url, hook, { headers });

    return httpResponse.data as Hook;
  }

  /**
   * Updates which APIs a webhook is subscribed to.
   * 
   * @param hookUrl The URL of the webhook.
   * @param apis An object with optional boolean properties `vehicle` and
   * `transport`. If the property value is `true`, the hook will receive events
   * from the API specified. If it is `false`, it will not. If unspecified, the
   * current setting will be kept.
   * 
   * @returns A Hook object with the attributes of the webhook after the update.
   */
  async updateHook(hookUrl: string, apis: UpdateHookRequest): Promise<Hook> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/hooks/:hookUrl', { hookUrl });
    const httpResponse = await axios.patch(url, apis, { headers });

    return httpResponse.data as Hook;
  }

  /**
   * Deletes a webhook.
   * 
   * @param hookUrl The URL of the webhook to delete.
   */
  async deleteHook(hookUrl: string): Promise<void> {
    const headers = this.createRequestHeaders();
    const url = urlcat(this.apiUrl, '/hooks/:hookUrl', { hookUrl });
    await axios.delete(url, { headers });
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
