/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as dotenv from "dotenv";
import fs from "fs";
import Ajv from "ajv";
import responseSchema from "../../assets/vehicle/Response.schema.json";
import semver from "semver";
import { VehicleAPIClient } from "../../src";
import { CarmenAPIConfigError } from "../../src/";
import { Locations, VehicleAPIOptions } from "../../src/";
import { extractAPIVersionFromReadme } from "../utils";

dotenv.config();

const ajv = new Ajv();
const validateResponse = ajv.compile(responseSchema);

const testOptions: VehicleAPIOptions = {
  apiKey: process.env.TEST_DEV_API_KEY || "",
  services: { anpr: true },
  inputImageLocation: Locations.Europe.Hungary,
  endpoint: process.env.TEST_DEV_ENDPOINT_URL,
};

const euProdAPIKey = process.env.TEST_EU_PROD_API_KEY || "";
const usProdAPIKey = process.env.TEST_US_PROD_API_KEY || "";

jest.setTimeout(30000);

xdescribe("VehicleAPIClient", () => {
  it("throws if both endpoint is undefined and cloudServiceRegion is invalid", () => {
    expect(() => {
      const { endpoint: _, ...options } = testOptions; // eslint-disable-line @typescript-eslint/no-unused-vars
      new VehicleAPIClient({
        ...options,
        cloudServiceRegion: "INVALID" as unknown as "AUTO"
      });
    }).toThrowError(CarmenAPIConfigError);
  });

  it("throws if imageDataOrPath is not a valid path", () => {
    const client = new VehicleAPIClient(testOptions);
    expect(async () => {
      await client.send("/invalid/path");
    }).rejects.toThrowError(CarmenAPIConfigError);
  });

  it("throws if no services are requested", () => {
    const client = new VehicleAPIClient({ ...testOptions, services: {} });
    expect(async () => {
      await client.send("./test/vehicle/test.jpg");
    }).rejects.toThrowError(CarmenAPIConfigError);
  });

  it("only returns plate result if only ANPR is requested", async () => {
    const client = new VehicleAPIClient(testOptions);
    const response = await client.send("./test/vehicle/test.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data?.vehicles!.length).toBe(1);
    expect(response.data?.vehicles![0].mmr).toBeUndefined();
    expect(response.data?.vehicles![0].markings).toBeUndefined();
    expect(response.data?.vehicles![0].plate?.unicodeText).toBe("LMF462");
  });

  it("only returns MMR result if only MMR is requested", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      services: { mmr: true },
    });
    const response = await client.send("./test/vehicle/test.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(1);
    expect(response.data!.vehicles![0].mmr).toBeDefined();
    expect(response.data!.vehicles![0].markings).toBeUndefined();
    expect(response.data!.vehicles![0].plate).toBeUndefined();
  });

  it("returns MMR and ANPR result if both are requested", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      services: { mmr: true, anpr: true },
    });
    const response = await client.send("./test/vehicle/test.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(1);
    expect(response.data!.vehicles![0].mmr).toBeDefined();
    expect(response.data!.vehicles![0].markings).toBeUndefined();
    expect(response.data!.vehicles![0].plate?.unicodeText).toBe("LMF462");
  });

  it("only returns ADR result if only ADR is requested", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      services: { adr: true },
    });
    const response = await client.send("./test/vehicle/adr-test.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(1);
    expect(response.data!.vehicles![0].mmr).toBeUndefined();
    expect(response.data!.vehicles![0].markings).toBeDefined();
    expect(response.data!.vehicles![0].plate).toBeUndefined();
  });

  it("accepts image as a stream", async () => {
    const client = new VehicleAPIClient(testOptions);
    const stream = fs.createReadStream("./test/vehicle/test.jpg");
    const response = await client.send(stream);
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(1);
  });

  it("passes maxreads parameter", async () => {
    const client = new VehicleAPIClient({ ...testOptions, maxReads: 5 });
    const stream = fs.createReadStream("./test/vehicle/many_plates_hun.jpg");
    const response = await client.send(stream);
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(5);
  });

  it("passes roi parameter", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      maxReads: 1,
      regionOfInterest: {
        topLeft:    [162, 458],  topRight: [320, 458],
        bottomLeft: [162, 520], bottomRight: [320, 520],
      }
    });
    const stream = fs.createReadStream("./test/vehicle/many_plates_hun.jpg");
    const response = await client.send(stream);
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(1);
    expect(response.data!.vehicles![0].plate?.unicodeText).toBe("KPS127");
  });

  it("returns a request object that conforms to the model schema (ANPR, MMR) - if this test fails, please run `npm run update-types && npm run generate-types` and commit the result.", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      services: { mmr: true, anpr: true },
    });
    const response = await client.send("./test/vehicle/test.jpg");
    const isValid = validateResponse(response);
    expect(validateResponse.errors).toBeFalsy();
    expect(isValid).toBe(true);
  });

  it("returns a request object that conforms to the model schema (ADR) - if this test fails, please run `npm run update-types && npm run generate-types` and commit the result.", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      services: { adr: true },
    });
    const response = await client.send("./test/vehicle/adr-test.jpg");
    const isValid = validateResponse(response);
    expect(validateResponse.errors).toBeFalsy();
    expect(isValid).toBe(true);
  });

it("has a client version that matches the API response version (the patch version can be different)", async () => {
  const client = new VehicleAPIClient({
    ...testOptions,
    services: { mmr: true, anpr: true },
  });
  const response = await client.send("./test/vehicle/adr-test.jpg");
  const clientVersion = semver.parse(client.supportedAPIVersion + '.0');
  const responseVersion = semver.parse(response.version + '.0');
  const readmeVersion = semver.parse(extractAPIVersionFromReadme('Vehicle API') + '.0');
  expect(clientVersion?.major).toBe(responseVersion?.major);
  expect(clientVersion?.minor).toBe(responseVersion?.minor);
  expect(clientVersion?.major).toBe(readmeVersion?.major);
  expect(clientVersion?.minor).toBe(readmeVersion?.minor);
});

  it("works correctly if cloudServiceRegion === 'EU'", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      apiKey: euProdAPIKey,
      cloudServiceRegion: "EU",
      endpoint: undefined,
    });
    const response = await client.send("./test/vehicle/test.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(1);
  });

  it("works correctly if cloudServiceRegion === 'US'", async () => {
    const client = new VehicleAPIClient({
      ...testOptions,
      apiKey: usProdAPIKey,
      cloudServiceRegion: "US",
      endpoint: undefined,
    });
    const response = await client.send("./test/vehicle/test.jpg");
    expect(response.data).toBeDefined();
    expect(response.data?.vehicles).toBeDefined();
    expect(response.data!.vehicles!.length).toBe(1);
  });
});
