import nock from "nock";
import { AuthClient, CarmenAPIConfigError, CarmenAPIError, CarmenCloudClient } from "../../src";

const BASE = "https://api.test.carmencloud.com";
const nowSeconds = () => Math.floor(Date.now() / 1000);

function tokenResponse(token: string, workspaceId = "ws-1", expiresIn = 3600) {
  return {
    access_token: token,
    workspace_id: workspaceId,
    expires_at: nowSeconds() + expiresIn,
    expires_in: expiresIn,
    role: "ADMIN",
    scope: `cc.workspace.admin.${workspaceId}`,
    token_type: "Bearer",
  };
}

beforeAll(() => nock.disableNetConnect());
afterEach(() => {
  expect(nock.isDone()).toBe(true);
  nock.cleanAll();
});
afterAll(() => nock.enableNetConnect());

describe("AuthClient", () => {
  it("exchanges the API key and caches the token", async () => {
    nock(BASE, { reqheaders: { "x-api-key": "key-1" } })
      .post("/auth/token")
      .once()
      .reply(200, tokenResponse("t1"));
    const auth = new AuthClient({ apiKey: "key-1", endpoint: BASE, retryCount: 0 });
    const [a, b] = await Promise.all([auth.getAccessToken(), auth.getAccessToken()]);
    expect(a.access_token).toBe("t1");
    expect(b.access_token).toBe("t1");
    expect((await auth.getAccessToken()).access_token).toBe("t1");
  });

  it("renews a token that is about to expire", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("old", "ws-1", 30));
    nock(BASE).post("/auth/token").reply(200, tokenResponse("new"));
    const auth = new AuthClient({ apiKey: "k", endpoint: BASE, retryCount: 0 });
    expect((await auth.getAccessToken()).access_token).toBe("old");
    expect((await auth.getAccessToken()).access_token).toBe("new");
  });

  it("reports an invalid key as CarmenAPIError", async () => {
    nock(BASE)
      .post("/auth/token")
      .reply(403, { error: "invalid_client", error_description: "Unknown API key." });
    const auth = new AuthClient({ apiKey: "bad", endpoint: BASE, retryCount: 0 });
    const error = await auth.getAccessToken().catch(e => e);
    expect(error).toBeInstanceOf(CarmenAPIError);
    expect(error.status).toBe(403);
    expect(error.message).toBe("Unknown API key.");
  });

  it("fetches the JWKS", async () => {
    nock(BASE).get("/auth/.well-known/jwks.json").reply(200, { keys: [{ kid: "k1" }] });
    const auth = new AuthClient({ apiKey: "k", endpoint: BASE, retryCount: 0 });
    expect((await auth.getJwks()).keys[0].kid).toBe("k1");
  });
});

describe("CarmenCloudClient", () => {
  const client = () => new CarmenCloudClient({ apiKey: "key-1", endpoint: BASE, retryCount: 0 });

  it("requires a credential", () => {
    expect(() => new CarmenCloudClient({ endpoint: BASE })).toThrow(CarmenAPIConfigError);
  });

  it("requires workspaceId with accessToken", () => {
    expect(() => new CarmenCloudClient({ accessToken: "t", endpoint: BASE })).toThrow(CarmenAPIConfigError);
  });

  it("uses the API key's workspace and sends the bearer token", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("t1", "ws-42"));
    nock(BASE, { reqheaders: { authorization: "Bearer t1" } })
      .get("/workspace/ws-42")
      .reply(200, { workspaceId: "ws-42", name: "Acme", owner: "u1" });
    const workspace = await client().workspace.get();
    expect(workspace.name).toBe("Acme");
  });

  it("uses an explicit workspace and access token function", async () => {
    nock(BASE, { reqheaders: { authorization: "Bearer user-token" } })
      .delete("/workspace/ws-9")
      .reply(200, { message: "deleted" });
    const c = new CarmenCloudClient({ accessToken: async () => "user-token", workspaceId: "ws-9", endpoint: BASE });
    expect((await c.workspace.delete()).message).toBe("deleted");
  });

  it("renews the token once when the authorizer rejects it", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("stale"));
    nock(BASE).post("/auth/token").reply(200, tokenResponse("fresh"));
    nock(BASE, { reqheaders: { authorization: "Bearer stale" } })
      .get("/workspace/ws-1/storage/status")
      .reply(403, { message: "Forbidden" });
    nock(BASE, { reqheaders: { authorization: "Bearer fresh" } })
      .get("/workspace/ws-1/storage/status")
      .reply(200, { enabledApis: { vehicle: true }, topicArn: "arn" });
    expect((await client().storage.getStatus()).enabledApis).toEqual({ vehicle: true });
  });

  it("surfaces API errors with status and message", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("t1"));
    nock(BASE).get("/workspace/ws-1/user/u-404").reply(404, { message: "No such user." });
    const error = await client().members.get("u-404").catch(e => e);
    expect(error).toBeInstanceOf(CarmenAPIError);
    expect(error.status).toBe(404);
    expect(error.message).toBe("No such user.");
  });

  it("encodes hook URLs as a single path segment", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("t1"));
    nock(BASE)
      .patch("/workspace/ws-1/storage/hooks/https%3A%2F%2Fexample.com%2Fhook", { vehicle: false })
      .reply(200, { hookUrl: "https://example.com/hook" });
    const hook = await client().hooks.update("https://example.com/hook", { vehicle: false });
    expect(hook.hookUrl).toBe("https://example.com/hook");
  });

  it("passes query parameters and drops undefined ones", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("t1"));
    nock(BASE)
      .get("/workspace/ws-1/events/vehicle")
      .query({ limit: "10", order: "desc" })
      .reply(200, { events: [], continuationToken: "" });
    const page = await client().events.list("vehicle", { limit: 10, order: "desc", before: undefined });
    expect(page.events).toEqual([]);
  });

  it("iterates over all API key pages", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("t1"));
    nock(BASE).get("/workspace/ws-1/apikey").query({ limit: "1" }).reply(200, { list: [{ apiKeyId: "a" }], lastKey: "a" });
    nock(BASE).get("/workspace/ws-1/apikey").query({ limit: "1", last_key: "a" }).reply(200, { list: [{ apiKeyId: "b" }], lastKey: "" });
    const ids: string[] = [];
    for await (const key of client().apiKeys.listAll({ limit: 1 })) ids.push(key.apiKeyId);
    expect(ids).toEqual(["a", "b"]);
  });

  it("sends request bodies", async () => {
    nock(BASE).post("/auth/token").reply(200, tokenResponse("t1"));
    nock(BASE)
      .post("/workspace/ws-1/apikey", { name: "ci", role: "EDITOR" })
      .reply(200, { apiKeyId: "k", name: "ci", value: "secret", workspaceId: "ws-1" });
    nock(BASE).post("/workspace/ws-1/user", { email: "a@b.c" }).reply(200, { status: "pending" });
    nock(BASE).get("/workspace/ws-1/invoice-preview").query({ product_id: "carmen" }).reply(200, { productId: "carmen" });
    const c = client();
    expect((await c.apiKeys.create({ name: "ci", role: "EDITOR" })).value).toBe("secret");
    expect((await c.members.invite({ email: "a@b.c" })).status).toBe("pending");
    expect((await c.billing.previewInvoice("carmen")).productId).toBe("carmen");
  });
});
