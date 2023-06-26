/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as dotenv from "dotenv";
import fs from "fs";
import Ajv from "ajv";
import responseSchema from "../../assets/transport/response.schema.json";
import semver from "semver";
import { TransportAPIClient } from "../../src";
import { CarmenAPIConfigError } from "../../src";
import { CodeType, TransportAPIOptions } from "../../src";
import { extractAPIVersionFromReadme } from "../utils";

dotenv.config();

const ajv = new Ajv();
const validateResponse = ajv.compile(responseSchema);

const testOptions: TransportAPIOptions = {
  apiKey: process.env.TEST_DEV_API_KEY || "",
  type: CodeType.ACCR_USA,
  endpoint: process.env.TEST_DEV_ENDPOINT_URL,
};

const euProdAPIKey = process.env.TEST_EU_PROD_API_KEY || "";
const usProdAPIKey = process.env.TEST_US_PROD_API_KEY || "";

jest.setTimeout(30000);

describe("TransportAPIClient", () => {
  it("throws if both endpoint and cloudServiceRegion are undefined", () => {
    expect(() => {
      const { endpoint: _, ...options } = testOptions; // eslint-disable-line @typescript-eslint/no-unused-vars
      new TransportAPIClient(options);
    }).toThrowError(CarmenAPIConfigError);
  });

  it("throws if maxreads is 0", () => {
    expect(() => {
      new TransportAPIClient({ ...testOptions, maxReads: 0 });
    }).toThrowError(CarmenAPIConfigError);
  });

  it("throws if imageDataOrPaths is empty", () => {
    const client = new TransportAPIClient(testOptions);
    expect(async () => {
      await client.send();
    }).rejects.toThrowError(CarmenAPIConfigError);
  });

  it("throws if imageDataOrPaths contains an invalid path", () => {
    const client = new TransportAPIClient(testOptions);
    expect(async () => {
      await client.send("/invalid/path");
    }).rejects.toThrowError(CarmenAPIConfigError);
  });

  it("returns the expected result if a single image is sent", async () => {
    const client = new TransportAPIClient(testOptions);
    const response = await client.send("./test/transport/accr_usa01.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("NFLZ049511");
  });

  it("returns one image result if a single image is sent", async () => {
    const client = new TransportAPIClient(testOptions);
    const response = await client.send("./test/transport/accr_usa01.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("NFLZ049511");
    expect(response.data?.codes![0].imageResults).toHaveLength(1);
  });

  it("returns 4 image results if 4 images are sent", async () => {
    const client = new TransportAPIClient(testOptions);
    const response = await client.send(
      "./test/transport/accr_usa01.jpg",
      "./test/transport/accr_usa02.jpg",
      "./test/transport/accr_usa03.jpg",
      "./test/transport/accr_usa20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("NFLZ049511");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("can read ACCR USA codes", async () => {
    const client = new TransportAPIClient(testOptions);
    const response = await client.send(
      "./test/transport/accr_usa01.jpg",
      "./test/transport/accr_usa02.jpg",
      "./test/transport/accr_usa03.jpg",
      "./test/transport/accr_usa20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("NFLZ049511");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("can read BRA codes", async () => {
    const client = new TransportAPIClient({ ...testOptions, type: CodeType.BRA });
    const response = await client.send(
      "./test/transport/bra01.jpg",
      "./test/transport/bra02.jpg",
      "./test/transport/bra03.jpg",
      "./test/transport/bra20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("HFE0599760");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("can read CHASSIS codes", async () => {
    const client = new TransportAPIClient({ ...testOptions, type: CodeType.CHASSIS });
    const response = await client.send(
      "./test/transport/chassis01.jpg",
      "./test/transport/chassis02.jpg",
      "./test/transport/chassis03.jpg",
      "./test/transport/chassis20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("MAEC623857");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("can read ILU codes", async () => {
    const client = new TransportAPIClient({ ...testOptions, type: CodeType.ILU });
    const response = await client.send(
      "./test/transport/ilu01.jpg",
      "./test/transport/ilu02.jpg",
      "./test/transport/ilu03.jpg",
      "./test/transport/ilu20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("LKWA06011300WI1");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("can read ISO codes", async () => {
    const client = new TransportAPIClient({ ...testOptions, type: CodeType.ISO });
    const response = await client.send(
      "./test/transport/iso01.jpg",
      "./test/transport/iso02.jpg",
      "./test/transport/iso03.jpg",
      "./test/transport/iso20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("NOSU2463454SG2210");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("can read UIC codes", async () => {
    const client = new TransportAPIClient({ ...testOptions, type: CodeType.UIC });
    const response = await client.send(
      "./test/transport/uic01.jpg",
      "./test/transport/uic02.jpg",
      "./test/transport/uic03.jpg",
      "./test/transport/uic20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("818068616353");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("can read USDOT codes", async () => {
    const client = new TransportAPIClient({ ...testOptions, type: CodeType.USDOT });
    const response = await client.send(
      "./test/transport/usdot01.jpg",
      "./test/transport/usdot02.jpg",
      "./test/transport/usdot03.jpg",
      "./test/transport/usdot20.jpg",
    );
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data?.codes).toHaveLength(1);
    expect(response.data?.codes![0].code).toBe("1201193");
    expect(response.data?.codes![0].imageResults).toHaveLength(4);
  });

  it("returns a request object that conforms to the model schema - if this test fails, please run `npm run update-types && npm run generate-types` and commit the result.", async () => {
    const client = new TransportAPIClient(testOptions);
    const response = await client.send("./test/transport/accr_usa01.jpg");
    const isValid = validateResponse(response);
    expect(validateResponse.errors).toBeFalsy();
    expect(isValid).toBe(true);
  });

  it("has a client version that matches the API response version and the version in the README", async () => {
    const client = new TransportAPIClient(testOptions);
    const response = await client.send("./test/transport/accr_usa01.jpg");
    const clientVersion = semver.parse(client.supportedAPIVersion + '.0');
    const responseVersion = semver.parse(response.version + '.0');
    const readmeVersion = semver.parse(extractAPIVersionFromReadme('Transportation & Cargo API') + '.0');
    expect(clientVersion?.major).toBe(responseVersion?.major);
    expect(clientVersion?.minor).toBe(responseVersion?.minor);
    expect(clientVersion?.major).toBe(readmeVersion?.major);
    expect(clientVersion?.minor).toBe(readmeVersion?.minor);
  });

  it("works correctly if cloudServiceRegion === 'EU'", async () => {
    const client = new TransportAPIClient({
      ...testOptions,
      apiKey: euProdAPIKey,
      cloudServiceRegion: "EU",
      endpoint: undefined,
    });
    const response = await client.send("./test/transport/accr_usa01.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data!.codes!.length).toBe(1);
  });

  it("works correctly if cloudServiceRegion === 'US'", async () => {
    const client = new TransportAPIClient({
      ...testOptions,
      apiKey: usProdAPIKey,
      cloudServiceRegion: "US",
      endpoint: undefined,
    });
    const response = await client.send("./test/transport/accr_usa01.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.codes).toBeDefined();
    expect(response.data!.codes!.length).toBe(1);
  });
});
