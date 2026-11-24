import fs from "fs";
import FormData from "form-data";
import { AxiosInstance } from "axios";
import urlcat from "urlcat";
import { CarmenAPIConfigError } from "../errors";
import { createHttpClient, selectApiBaseUrl } from "../http";
import { TransportAPIOptions } from "./options";
import { TransportationCargoAPIResponse } from "./response";
import { Stream } from "stream";
import { warnOnApiVersionMismatch } from "../version";

export * from "./options";
export * from "./response";
 
export class TransportAPIClient {
  supportedAPIVersion = "1.0.1";
  private apiUrl: string;
  private http: AxiosInstance;

  constructor(private options: TransportAPIOptions) {
    this.http = createHttpClient(options);
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
    const httpResponse = await this.http.post(this.apiUrl, formData, { headers });
    const response = httpResponse.data as TransportationCargoAPIResponse;

    warnOnApiVersionMismatch(this.supportedAPIVersion, response.version);

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
    if (imagePathOrBuffer instanceof Stream || Buffer.isBuffer(imagePathOrBuffer)) {
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
    // Sent whenever set: an explicit false overrides disableISOCode.
    if (this.options.disableAdditionalCode !== undefined) {
      headers["x-disable-additional-code"] = String(this.options.disableAdditionalCode);
    }
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
    const baseUrl = selectApiBaseUrl(this.options);
    return urlcat(baseUrl, "/transport/:type", {
      type: this.options.type,
    });
  }

}
