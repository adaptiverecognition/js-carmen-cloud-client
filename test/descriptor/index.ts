/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as dotenv from "dotenv";
import { DescriptorAPIOptions, DescriptorAPIClient, CarmenAPIConfigError } from "../../src";

dotenv.config();

const authenticatedOptions: DescriptorAPIOptions = {
  apiKey: process.env.TEST_DEV_API_KEY || "",
  endpoint: process.env.TEST_DEV_ENDPOINT_URL,
};

const unauthenticatedOptions: DescriptorAPIOptions = {
  endpoint: process.env.TEST_DEV_ENDPOINT_URL,
};

jest.setTimeout(30000);

describe("DescriptorAPIClient", () => {
  it("throws if both endpoint is undefined and cloudServiceRegion is invalid", () => {
    expect(() => {
      const { endpoint: _, ...options } = authenticatedOptions; // eslint-disable-line @typescript-eslint/no-unused-vars
      new DescriptorAPIClient({
        ...options,
        cloudServiceRegion: "INVALID" as unknown as "AUTO"
      });
    }).toThrowError(CarmenAPIConfigError);
  });

  describe("getDimensions()", () => {
    it("returns valid response", async () => {
      const client = new DescriptorAPIClient(authenticatedOptions);
      const dimensions = await client.getDimensions();

      expect(dimensions).toBeTruthy();
      expect(dimensions).toBeInstanceOf(Array);

      if (dimensions.length > 0) {
        const dimension = dimensions[0];
        expect(dimension).toHaveProperty("id");
        expect(dimension).toHaveProperty("name");
        expect(dimension).toHaveProperty("requestCount");
      }
    });

    it("can be called without an API key", async () => {
      const client = new DescriptorAPIClient(unauthenticatedOptions);
      const dimensions = await client.getDimensions();

      expect(dimensions).toBeTruthy();
      expect(dimensions).toBeInstanceOf(Array);
    });
  });

  describe("getFreeCallCount()", () => {
    it("returns valid response", async () => {
      const client = new DescriptorAPIClient(authenticatedOptions);
      const freeCallCount = await client.getFreeCallCount('carmen');

      expect(typeof freeCallCount).toBe("number");
    });

    it("cannot be called without an API key", async () => {
      const client = new DescriptorAPIClient(unauthenticatedOptions);
      expect(async () => await client.getFreeCallCount('carmen')).rejects;
    });
  });

  describe("getPaidSubscriptions()", () => {
    it("returns valid response", async () => {
      const client = new DescriptorAPIClient(authenticatedOptions);
      const subscriptions = await client.getPaidSubscriptions();

      expect(subscriptions).toBeTruthy();
      expect(subscriptions).toBeInstanceOf(Array);

      if (subscriptions.length > 0) {
        const subscription = subscriptions[0];
        expect(subscription).toHaveProperty("id");
        expect(subscription).toHaveProperty("dimension");
        expect(subscription).toHaveProperty("startTime");
        expect(subscription).toHaveProperty("endTime");
        expect(subscription).toHaveProperty("type");
        expect(subscription).toHaveProperty("productId");
      }
    });

    it("cannot be called without an API key", async () => {
      const client = new DescriptorAPIClient(unauthenticatedOptions);
      expect(async () => await client.getPaidSubscriptions()).rejects;
    });
  });

  describe("getPrices()", () => {
    it("returns valid response", async () => {
      const client = new DescriptorAPIClient(authenticatedOptions);
      const pricesByProduct = await client.getPrices("carmen", "HU");

      expect(pricesByProduct).toBeTruthy();
      expect(pricesByProduct).toBeInstanceOf(Object);
      expect(pricesByProduct).toHaveProperty("carmen");

      const prices = pricesByProduct.carmen;

      if (prices.length > 0) {
        const price = prices[0];
        expect(price).toHaveProperty("requestCount");
        expect(price).toHaveProperty("throttle");
      }
    });

    it("cannot be called without an API key", async () => {
      const client = new DescriptorAPIClient(unauthenticatedOptions);
      expect(async () => await client.getPrices("carmen", "HU")).rejects;
    });
  });
});
