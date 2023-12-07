import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import axiosRetry from 'axios-retry';
import urlcat from "urlcat";
import isStream from "isstream";
import { CarmenAPIConfigError } from "../errors";
import { VehicleAPIOptions } from "./options";
import { VehicleAPIResponse } from "./response";
import { Stream } from "stream";

/**
 * A client for interacting with the Adaptive Recognition Cloud Vehicle API.
 */
export class VehicleAPIClient {
  supportedAPIVersion = "1.4.1";
  private apiUrl: string;

  /**
   * Instantiates the client with a fixed set of options.
   * 
   * @param options An object containing configuration options for the client.
   */
  constructor(private options: VehicleAPIOptions) {
    axiosRetry(axios, {
      retries: options.retryCount || 3,
      retryDelay: axiosRetry.exponentialDelay
    });
    this.apiUrl = this.getParametrizedApiUrl();
  }

  /**
   * Sends a request to the Vehicle API.
   * 
   * @param imageDataOrPath The image (specified with a path, a Buffer or a
   * Node.js ReadStream) to be sent in the request.
   * @returns The response received from the API.
   */
  async send(
    imageDataOrPath: string | Buffer | fs.ReadStream
  ): Promise<VehicleAPIResponse> {
    const formData = this.createFormData(imageDataOrPath);
    const headers = this.createRequestHeaders(formData);
    const httpResponse = await axios.post(this.apiUrl, formData, { headers });
    const response = httpResponse.data as VehicleAPIResponse;

    if (response.version !== this.supportedAPIVersion) {
      console.error(`WARNING: API version mismatch. Expected ${this.supportedAPIVersion}, got ${response.version}.`);
    }

    return response;
  }

  private getImageBytes(
    imagePathOrBuffer: string | Buffer | fs.ReadStream
  ): Buffer | Stream {
    if (isStream(imagePathOrBuffer) || Buffer.isBuffer(imagePathOrBuffer)) {
      return imagePathOrBuffer as Buffer | Stream;
    } else if (
      typeof imagePathOrBuffer === "string" &&
      fs.existsSync(imagePathOrBuffer)
    ) {
      return fs.createReadStream(imagePathOrBuffer);
    } else {
      throw new CarmenAPIConfigError(
        `Argument must be either a valid file path, Stream or Buffer, but was: '${imagePathOrBuffer}'.`
      );
    }
  }

  private createRequestHeaders(formData: FormData) {
    const addIfSet = (h: FormData.Headers, prop: keyof VehicleAPIOptions, key: string) => {
      if (this.options[prop]) h[key] = "true";
    }
    const headers: FormData.Headers = {
      ...formData.getHeaders(),
      "X-Api-Key": this.options.apiKey,
    };
    addIfSet(headers, "disableCallStatistics", "x-disable-call-statistics");
    addIfSet(headers, "disableImageResizing", "x-disable-image-resizing");
    addIfSet(headers, "enableWideRangeAnalysis", "x-enable-wide-range-analysis");
    addIfSet(headers, "enableUnidentifiedLicensePlate", "x-enable-unidentified-license-plate");
    return headers;
  }

  private createFormData(
    imageDataOrPath: string | Buffer | fs.ReadStream
  ): FormData {
    const imageBytes = this.getImageBytes(imageDataOrPath);
    const formData = new FormData();
    formData.append("service", this.createServiceParameter());

    if (this.options.inputImageLocation.location) {
      formData.append("location", this.options.inputImageLocation.location);
    }

    if (this.options.maxReads) {
      formData.append("maxreads", this.options.maxReads);
    }

    if (this.options.regionOfInterest) {
      const coords = [
        this.options.regionOfInterest.topLeft,
        this.options.regionOfInterest.topRight,
        this.options.regionOfInterest.bottomRight,
        this.options.regionOfInterest.bottomLeft,
      ];
      const roi = coords.map((c) => c.join(",")).join(";");
      formData.append("roi", roi);
    }

    formData.append("image", imageBytes);
    return formData;
  }

  private createServiceParameter() {
    const services = [];
    if (this.options.services.anpr) {
      services.push("anpr");
    }
    if (this.options.services.mmr) {
      services.push("mmr");
    }
    if (this.options.services.adr) {
      services.push("adr");
    }
    if (services.length === 0) {
      throw new CarmenAPIConfigError(
        "At least one service (`anpr`, `mmr` or `adr`) must be specified."
      );
    }
    return services.join(",");
  }

  private getParametrizedApiUrl() {
    const baseUrl = this.selectApiBaseUrl();
    return urlcat(baseUrl, "/vehicle/:region", {
      region: this.options.inputImageLocation.region,
    });
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
