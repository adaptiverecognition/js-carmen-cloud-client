import FormData from "form-data";
import axios from "axios";
import axiosRetry from "axios-retry";
import urlcat from "urlcat";
import { CarmenAPIConfigError } from "../errors";
import { APIFilters, DescriptorAPIOptions, UsagePlanFilters } from "./options";
import { APIStages } from "./apilistresponse";
import { Dimensions } from "./dimensionlistreponse";
import { PaidSubscriptionUsages } from "./paidsubscriptionusageresponse";
import { PaidSubscriptions } from "./paidsubscriptionlistresponse";
import { Prices } from "./prices";
import { Products } from "./productsresponse";
import { UsagePlanIDs } from "./usageplansubscriptionlistresponse";
import { UsagePlanUsage } from "./usageplanusageresponse";
import { UsagePlans } from "./usageplanlistresponse";

/**
 * A client for interacting with the Carmen Cloud Descriptor API.
 */
export class DescriptorAPIClient {
  private apiUrl: string;

  /**
   * Instantiates the client with a fixed set of options.
   *
   * @param options An object containing configuration options for the client.
   */
  constructor(private options: DescriptorAPIOptions) {
    axiosRetry(axios, {
      retries: options.retryCount || 3,
      retryDelay: axiosRetry.exponentialDelay,
    });
    this.apiUrl = this.getParametrizedApiUrl();
  }

  /**
   * Returns the list of available API stages.
   *
   * **API key not required.**
   *
   * @param filters The filters to apply to the list.
   *
   * @returns The API stages that match the filter.
   */
  async getApis(filters: APIFilters = { detailed: false }): Promise<APIStages> {
    const url = urlcat(this.apiUrl, "/apis", filters);
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as APIStages;
  }

  /**
   * Lists available subscription dimensions.
   *
   * **API key not required.**
   *
   * @returns The list of available subscription dimensions.
   */
  async getDimensions(): Promise<Dimensions> {
    const url = urlcat(this.apiUrl, "/dimensions");
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as Dimensions;
  }

  /**
   * Returns the number of free API calls remaining in the current month.
   *
   * **API key required.**
   * 
   * @param product The product for which to get the free call count.
   *
   * @returns The number of free API calls remaining in the current month.
   */
  async getFreeCallCount(product: 'carmen'): Promise<number> {
    this.ensureApiKey();

    const url = urlcat(this.apiUrl, "/free-call-count/:product", { product });
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as number;
  }

  /**
   * Queries paid subscription credit usage for the authenticated user.
   *
   * **API key required.**
   *
   * @param product The ID of the product to query usage for. E.g. 'carmen'.
   * @param starttime The end of the time interval queried as a millisecond
   *     timestamp.
   * @param endtime The end of the time interval queried as a millisecond
   *     timestamp.
   *
   * @returns The number of free API calls remaining in the current month.
   */
  async getPaidSubscriptionUsage(
    product: 'carmen',
    starttime?: number,
    endtime?: number
  ): Promise<PaidSubscriptionUsages> {
    this.ensureApiKey();

    const url = urlcat(
      this.apiUrl,
      "/paid-subscription-usages/:product",
      { product, starttime, endtime }
    );
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as PaidSubscriptionUsages;
  }

  /**
   * Lists the paid subscriptions the authenticated user has. A user can have at
   * most as many paid subscriptions as the number of APIs available (vehicle or
   * transport).
   *
   * **API key required.**
   *
   * @returns The list of paid subscriptions the authenticated user has.
   */
  async getPaidSubscriptions(): Promise<PaidSubscriptions> {
    this.ensureApiKey();

    const url = urlcat(this.apiUrl, "/paid-subscriptions");
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as PaidSubscriptions;
  }

  /**
   * Lists the IDs of the usage plans the authenticated user is a member of.
   *
   * **API key required.**
   *
   * @returns The list of usage plan IDs the authenticated user is subscribed
   * to.
   */
  async getUsagePlanSubscriptions(): Promise<UsagePlanIDs> {
    this.ensureApiKey();

    const url = urlcat(this.apiUrl, "/usageplan-subscriptions");
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as UsagePlanIDs;
  }

  /**
   * Queries usage plan quota usage for the authenticated user.
   *
   * **API key required.**
   *
   * @returns The usage plan quota usage for the authenticated user.
   */
  async getUsagePlanUsage(): Promise<UsagePlanUsage> {
    this.ensureApiKey();

    const url = urlcat(this.apiUrl, "/usageplan-usages");
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as UsagePlanUsage;
  }

  /**
   * Returns the list of available usage plans.
   *
   * **API key not required.**
   * 
   * @param filters The filters to apply to the list.
   *
   * @returns The usage plans that match the filter.
   */
  async getUsagePlans(filters: UsagePlanFilters = {}): Promise<UsagePlans> {
    const url = urlcat(this.apiUrl, "/usageplans", filters);
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as UsagePlans;
  }

  /**
   * Returns the publicly available pricing tiers for the given product.
   *
   * **API key not required.**
   * 
   * @param product The product for which to get the pricing tiers.
   * @param country The two-letter country code for which to get the prices.
   *
   * @returns The pricing tiers for the given product.
   */
  async getPrices(product: 'carmen', country: string): Promise<Prices> {
    const template = country
      ? "/prices/:product/:country"
      : "/prices/:product";
    const url = urlcat(this.apiUrl, template, { product, country });
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as Prices;
  }

  /**
   * Returns the list of available products users can subscribe to.
   *
   * **API key not required.**
   * 
   * @returns The list of available products users can subscribe to.
   */
  async getProducts(): Promise<Products> {
    const url = urlcat(this.apiUrl, "/products");
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as Products;
  }

  /**
   * Returns the API region the client's requests are being routed to. This can
   * be useful for debugging latency-based routing. If you need to connect to a
   * specific region, you can set the `cloudServiceRegion` option in the client.
   *
   * **API key not required.**
   * 
   * @returns 
   */
  async getRegion(): Promise<string> {
    const url = urlcat(this.apiUrl, "/region");
    const headers = this.createRequestHeaders();
    const httpResponse = await axios.get(url, { headers });

    return httpResponse.data as string;
  }

  private ensureApiKey() {
    if (!this.options.apiKey) {
      throw new CarmenAPIConfigError(
        "API key is required for this operation."
      );
    }
  }

  private createRequestHeaders() {
    const headers: FormData.Headers = {};
    if (this.options.apiKey) {
      headers["X-Api-Key"] = this.options.apiKey;
    }
    return headers;
  }

  private getParametrizedApiUrl() {
    return this.selectApiBaseUrl();
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
    if (
      this.options.cloudServiceRegion &&
      this.options.cloudServiceRegion !== "AUTO"
    ) {
      throw new CarmenAPIConfigError(
        `Invalid cloud service region: '${this.options.cloudServiceRegion}'.`
      );
    }
    // cloudServiceRegion is not set or AUTO, use latency-based routing
    return "https://api.carmencloud.com";
  }
}
