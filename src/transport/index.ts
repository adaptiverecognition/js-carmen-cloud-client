import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import axiosRetry from 'axios-retry';
import urlcat from "urlcat";
import isStream from "isstream";
import { CarmenAPIConfigError } from "../errors";
import { TransportAPIOptions } from "./options";
import { TransportationCargoAPIResponse } from "./response";
import { Stream } from "stream";
 
export class TransportAPIClient {
  supportedAPIVersion = "1.0";
  private apiUrl: string;

  constructor(private options: TransportAPIOptions) {
    axiosRetry(axios, {
      retries: options.retryCount || 3,
      retryDelay: axiosRetry.exponentialDelay
    });
    this.validateOptions(options);
    this.apiUrl = this.getParametrizedApiUrl();
  }

  async send(
    ...imageDataOrPaths: (string | Buffer | fs.ReadStream)[]
  ): Promise<TransportationCargoAPIResponse> {
    if (!imageDataOrPaths || imageDataOrPaths.length === 0) {
      throw new CarmenAPIConfigError("At least one image must be specified.");
    }
    const formData = this.createFormData(imageDataOrPaths);
    const headers = this.createRequestHeaders(formData);
    const httpResponse = await axios.post(this.apiUrl, formData, { headers });
    const response = httpResponse.data as TransportationCargoAPIResponse;

    if (response.version !== this.supportedAPIVersion) {
      console.error(`WARNING: API version mismatch. Expected ${this.supportedAPIVersion}, got ${response.version}.`);
    }

    return response;
  }

  private validateOptions(options: TransportAPIOptions) {
    if (options.maxReads !== undefined && options.maxReads < 1) {
      throw new CarmenAPIConfigError(`maxReads must be at least 1, was: ${options.maxReads}.`);
    }
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
    const addIfSet = (h: FormData.Headers, prop: keyof TransportAPIOptions, key: string) => {
      if (this.options[prop]) h[key] = "true";
    }
    const headers: FormData.Headers = {
      ...formData.getHeaders(),
      "X-Api-Key": this.options.apiKey,
    };
    addIfSet(headers, "disableISOCode", "x-disable-iso-code");
    addIfSet(headers, "disableChecksumCheck", "x-disable-checksum-check");
    addIfSet(headers, "enableFullUsAccrCode", "x-enable-full-us-accr-code");
    addIfSet(headers, "disableImageResizing", "x-disable-image-resizing");
    addIfSet(headers, "enableWideRangeAnalysis", "x-enable-wide-range-analysis");
    return headers;
  }

  private createFormData(
    imageDataOrPaths: (string | Buffer | fs.ReadStream)[]
  ): FormData {
    const formData = new FormData();
    
    if (this.options.maxReads) {
      formData.append("maxreads", this.options.maxReads);
    }
    
    for (const imageDataOrPath of imageDataOrPaths) {
      const imageBytes = this.getImageBytes(imageDataOrPath);
      formData.append("image", imageBytes);
    }

    return formData;
  }

  private getParametrizedApiUrl() {
    const baseUrl = this.selectApiBaseUrl();
    return urlcat(baseUrl, "/transport/:type", {
      type: this.options.type,
    });
  }

  private selectApiBaseUrl() {
    if (this.options.endpoint) {
      return this.options.endpoint;
    }
    if (this.options.cloudServiceRegion === "EU") {
      return "https://api.cloud.adaptiverecognition.com";
    }
    if (this.options.cloudServiceRegion === "US") {
      return "https://api.us.cloud.adaptiverecognition.com";
    }
    throw new CarmenAPIConfigError(
      "Either 'endpoint' or 'cloudServiceRegion' must be specified."
    );
  }
}
