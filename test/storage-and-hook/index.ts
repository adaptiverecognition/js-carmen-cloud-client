/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as dotenv from "dotenv";
import Ajv from "ajv";
import storageStatusResponseSchema from "../../assets/storage-and-hook/StorageStatusResponse.schema.json";
import hookSchema from "../../assets/storage-and-hook/Hook.schema.json";
import { StorageAndHookAPIClient } from "../../src";
import { CarmenAPIConfigError } from "../../src/";
import { StorageAndHookAPIOptions } from "../../src/";

dotenv.config();

const ajv = new Ajv();
const validateStorageStatusResponse = ajv.compile(storageStatusResponseSchema);
const validateHook = ajv.compile(hookSchema);

const testOptions: StorageAndHookAPIOptions = {
  apiKey: process.env.TEST_DEV_API_KEY || "",
  endpoint: process.env.TEST_DEV_ENDPOINT_URL,
};

jest.setTimeout(30000);

describe("StorageAndHookAPIClient", () => {
  it("throws if both endpoint is undefined and cloudServiceRegion is invalid", () => {
    expect(() => {
      const { endpoint: _, ...options } = testOptions; // eslint-disable-line @typescript-eslint/no-unused-vars
      new StorageAndHookAPIClient({
        ...options,
        cloudServiceRegion: "INVALID" as unknown as "AUTO"
      });
    }).toThrowError(CarmenAPIConfigError);
  });

  it("returns schema-conformant storage status response", async () => {
    const client = new StorageAndHookAPIClient(testOptions);
    const response = await client.getStorageStatus();

    const isValid = validateStorageStatusResponse(response);
    expect(validateStorageStatusResponse.errors).toBeFalsy();
    expect(isValid).toBe(true);
  });

  it("returns schema-conformant hooks response", async () => {
    const client = new StorageAndHookAPIClient(testOptions);
    const response = await client.getHooks();

    expect(Array.isArray(response)).toBe(true);

    for(const hook of response) {
      const isValid = validateHook(hook);
      expect(validateHook.errors).toBeFalsy();
      expect(isValid).toBe(true);
    }
  });
});
