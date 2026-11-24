import fs from "fs";
import FormData from "form-data";
import { AxiosInstance } from "axios";
import urlcat from "urlcat";
import { CarmenAPIConfigError } from "../errors";
import { createHttpClient, selectApiBaseUrl } from "../http";
import { VehicleAPIOptions } from "./options";
import { VehicleAPIResponse } from "./response";
import { Stream } from "stream";
import { warnOnApiVersionMismatch } from "../version";

export * from "./options";
export * from "./response";

/**
 * A client for interacting with the Carmen Cloud Vehicle API.
 */
export class VehicleAPIClient {
  supportedAPIVersion = "1.4.2";
  private apiUrl: string;
  private http: AxiosInstance;

  /**
   * Instantiates the client with a fixed set of options.
   * 
   * @param options An object containing configuration options for the client.
   */
  constructor(private options: VehicleAPIOptions) {
    this.http = createHttpClient(options);
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
    const httpResponse = await this.http.post(this.apiUrl, formData, { headers });
    const response = httpResponse.data as VehicleAPIResponse;

    warnOnApiVersionMismatch(this.supportedAPIVersion, response.version);

    return response;
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
    const baseUrl = selectApiBaseUrl(this.options);
    return urlcat(baseUrl, "/vehicle/:region", {
      region: this.options.inputImageLocation.region.toLowerCase(),
    });
  }

}
