import nock from "nock";
import { CodeType, TransportAPIClient, TransportAPIOptions } from "../../src";

// Unit tests (no live API): the option-to-header mapping of the Transport client.
const BASE = "https://api.test.carmencloud.com";
const image = Buffer.from("not really a jpeg");

beforeAll(() => nock.disableNetConnect());
afterEach(() => {
  expect(nock.isDone()).toBe(true);
  nock.cleanAll();
});
afterAll(() => nock.enableNetConnect());

async function sentHeaders(options: Partial<TransportAPIOptions>) {
  let headers: Record<string, string | string[] | undefined> = {};
  nock(BASE)
    .post("/transport/iso")
    .reply(function () {
      headers = this.req.headers;
      return [200, { version: "1.0", data: { codes: [] } }];
    });
  const client = new TransportAPIClient({
    apiKey: "key",
    type: CodeType.ISO,
    endpoint: BASE,
    retryCount: 0,
    ...options,
  });
  await client.send(image);
  return headers;
}

describe("TransportAPIClient headers", () => {
  it("omits x-disable-additional-code when disableAdditionalCode is not set", async () => {
    const headers = await sentHeaders({ disableISOCode: true });
    expect(headers["x-disable-additional-code"]).toBeUndefined();
    expect(headers["x-disable-iso-code"]).toBe("true");
  });

  it("sends disableAdditionalCode: true", async () => {
    const headers = await sentHeaders({ disableAdditionalCode: true });
    expect(headers["x-disable-additional-code"]).toBe("true");
  });

  it("sends an explicit disableAdditionalCode: false, which overrides disableISOCode", async () => {
    const headers = await sentHeaders({ disableAdditionalCode: false, disableISOCode: true });
    expect(headers["x-disable-additional-code"]).toBe("false");
  });
});
