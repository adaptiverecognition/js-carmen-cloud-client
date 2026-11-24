import { AxiosInstance } from "axios";
import { AuthClient, toCarmenAPIError } from "../auth";
import { CarmenAPIConfigError, CarmenAPIError } from "../errors";
import { CommonClientOptions, createHttpClient, selectApiBaseUrl } from "../http";
import { components, operations } from "./schema";

type Schemas = components["schemas"];
type QueryOf<Op extends keyof operations> = NonNullable<operations[Op]["parameters"]["query"]>;

export type Workspace = Schemas["Workspace"];
export type WorkspaceUser = Schemas["WorkspaceUser"];
export type InviteUserRequest = Schemas["InviteUserRequest"];
export type InvitationSentResult = Schemas["InvitationSentResult"];
export type TransferResult = Schemas["TransferResult"];
export type MessageResponse = Schemas["MessageResponse"];
export type ApiKey = Schemas["ApiKey"];
export type ApiKeyPage = Schemas["ApiKeyPage"];
export type CreateApiKeyRequest = Schemas["CreateApiKeyRequest"];
export type UpdateApiKeyRequest = Schemas["UpdateApiKeyRequest"];
export type UsageReport = Schemas["UsageReport"];
export type ApiKeyUsageReport = Schemas["ApiKeyUsageReport"];
export type BillingAuthSession = Schemas["BillingAuthSession"];
export type BillingPortalSession = Schemas["BillingPortalSession"];
export type BillingProfileRequest = Schemas["BillingProfileRequest"];
export type BillingProfile = Schemas["BillingProfile"];
export type UsageCapRequest = Schemas["UsageCapRequest"];
export type UsageCapResult = Schemas["UsageCapResult"];
export type InvoicePreview = Schemas["InvoicePreview"];
export type StoredEventPage = Schemas["StoredEventPage"];
export type StorageStatus = Schemas["StorageStatus"];
export type StorageStatusPatch = Schemas["StorageStatusPatch"];
export type Hook = Schemas["Hook"];
export type CreateHookRequest = Schemas["CreateHookRequest"];
export type HookApisPatch = Schemas["HookApisPatch"];
export type MemberRole = Schemas["UpdateUserRoleRequest"]["role"];

export type ApiKeyListFilters = QueryOf<"listApiKeys">;
export type UsageRange = QueryOf<"getWorkspaceUsage">;
export type MemberListFilters = QueryOf<"listWorkspaceUsers">;
export type StoredEventFilters = QueryOf<"listStoredEvents">;
export type SubscriptionChange = QueryOf<"updateSubscription">;
export type BillingAuthSessionOptions = QueryOf<"createBillingAuthSession">;
export type BillingPortalSessionOptions = QueryOf<"createBillingPortalSession">;
/** The recognition APIs whose events can be stored. */
export type StoredEventApi = "vehicle" | "transport";

/** Options of {@link CarmenCloudClient}. */
export interface CarmenCloudClientOptions extends CommonClientOptions {
  /**
   * A Carmen Cloud API key with a workspace role (`ADMIN`, `EDITOR` or
   * `ACCOUNTANT`). It is exchanged for short-lived bearer tokens at
   * `POST /auth/token` automatically. Either this or `accessToken` is required.
   */
  apiKey?: string;
  /**
   * A bearer access token, or a function returning one, used instead of an
   * API key, e.g. a signed-in user's session token. The few operations marked
   * "requires a user session" only work with such a token.
   */
  accessToken?: string | (() => string | Promise<string>);
  /**
   * The workspace to operate on. With `apiKey` it defaults to the API key's
   * own workspace; with `accessToken` it is required.
   */
  workspaceId?: string;
}

interface RequestOptions {
  query?: object;
  body?: unknown;
}

/**
 * A client for the Carmen Cloud API: workspaces, members, API keys, billing,
 * usage, stored events, storage settings and hooks.
 *
 * ```ts
 * const client = new CarmenCloudClient({ apiKey: process.env.CARMEN_API_KEY });
 * const workspace = await client.workspace.get();
 * const keys = await client.apiKeys.list({ limit: 50 });
 * ```
 */
export class CarmenCloudClient {
  /** The token exchange client (only when an `apiKey` is configured). */
  readonly auth?: AuthClient;
  readonly workspace: WorkspaceOperations;
  readonly members: MemberOperations;
  readonly apiKeys: ApiKeyOperations;
  readonly billing: BillingOperations;
  readonly usage: UsageOperations;
  readonly events: EventOperations;
  readonly storage: StorageOperations;
  readonly hooks: HookOperations;

  private http: AxiosInstance;
  private baseUrl: string;

  constructor(private options: CarmenCloudClientOptions) {
    if (!options.apiKey && !options.accessToken) {
      throw new CarmenAPIConfigError("Either apiKey or accessToken must be specified.");
    }
    if (options.accessToken && !options.apiKey && !options.workspaceId) {
      throw new CarmenAPIConfigError("workspaceId must be specified when using accessToken.");
    }
    this.http = createHttpClient(options);
    this.baseUrl = selectApiBaseUrl(options) + "/workspace";
    if (options.apiKey && !options.accessToken) {
      this.auth = new AuthClient({ ...options, apiKey: options.apiKey });
    }
    const send = this.request.bind(this);
    this.workspace = new WorkspaceOperations(send);
    this.members = new MemberOperations(send);
    this.apiKeys = new ApiKeyOperations(send);
    this.billing = new BillingOperations(send);
    this.usage = new UsageOperations(send);
    this.events = new EventOperations(send);
    this.storage = new StorageOperations(send);
    this.hooks = new HookOperations(send);
  }

  /** The workspace the client operates on. */
  async getWorkspaceId(): Promise<string> {
    if (this.options.workspaceId) {
      return this.options.workspaceId;
    }
    // apiKey is set here (the constructor guarantees it)
    const token = await (this.auth as AuthClient).getAccessToken();
    return token.workspace_id;
  }

  private async bearer(forceRefresh: boolean): Promise<string> {
    if (this.auth) {
      return (await this.auth.getAccessToken(forceRefresh)).access_token;
    }
    const t = this.options.accessToken as string | (() => string | Promise<string>);
    return typeof t === "function" ? await t() : t;
  }

  private async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const workspaceId = await this.getWorkspaceId();
    const url = this.baseUrl + "/" + encodeURIComponent(workspaceId) + path;
    const params = options.query
      ? Object.fromEntries(Object.entries(options.query).filter(([, v]) => v !== undefined))
      : undefined;
    const send = async (forceRefresh: boolean) =>
      this.http.request<T>({
        method,
        url,
        params,
        data: options.body,
        headers: { Authorization: `Bearer ${await this.bearer(forceRefresh)}` },
      });
    try {
      return (await send(false)).data;
    } catch (e) {
      const error = toCarmenAPIError(e);
      // The authorizer answers 401/403 for an expired token. Tokens minted from
      // an API key are renewed once; anything else is the caller's to handle.
      if (this.auth && error instanceof CarmenAPIError && (error.status === 401 || error.status === 403)) {
        try {
          return (await send(true)).data;
        } catch (retryError) {
          throw toCarmenAPIError(retryError);
        }
      }
      throw error;
    }
  }
}

type Send = <T>(method: string, path: string, options?: RequestOptions) => Promise<T>;
const seg = encodeURIComponent;

/** Workspace operations. */
export class WorkspaceOperations {
  constructor(private send: Send) {}

  /** Gets the workspace, enriched with its Stripe customer and subscriptions. */
  get(): Promise<Workspace> {
    return this.send("GET", "");
  }

  /** Renames the workspace (owner only). */
  rename(name: string): Promise<Workspace> {
    return this.send("PUT", "", { body: { name } });
  }

  /** Deletes the workspace. Requires a user session (not an API-key token). */
  delete(): Promise<MessageResponse> {
    return this.send("DELETE", "");
  }

  /** Transfers ownership to another member. Requires a user session (not an API-key token). */
  transferOwnership(userId: string): Promise<TransferResult> {
    return this.send("PATCH", `/transfer/${seg(userId)}`);
  }
}

/** Workspace member and invitation operations. */
export class MemberOperations {
  constructor(private send: Send) {}

  /** Lists the members and pending invitations. */
  list(filters?: MemberListFilters): Promise<WorkspaceUser[]> {
    return this.send("GET", "/user", { query: filters });
  }

  /** Invites a user by email (role defaults to `EDITOR`). */
  invite(request: InviteUserRequest): Promise<InvitationSentResult> {
    return this.send("POST", "/user", { body: request });
  }

  /** Gets one member. */
  get(userId: string): Promise<WorkspaceUser> {
    return this.send("GET", `/user/${seg(userId)}`);
  }

  /** Changes a member's role. */
  updateRole(userId: string, role: MemberRole): Promise<MessageResponse> {
    return this.send("PATCH", `/user/${seg(userId)}`, { body: { role } });
  }

  /** Removes a member or revokes a pending invitation. */
  remove(userId: string): Promise<MessageResponse> {
    return this.send("DELETE", `/user/${seg(userId)}`);
  }
}

/** API key operations. */
export class ApiKeyOperations {
  constructor(private send: Send) {}

  /** Lists one page of API keys; pass the returned `lastKey` as `last_key` for the next page. */
  list(filters?: ApiKeyListFilters): Promise<ApiKeyPage> {
    return this.send("GET", "/apikey", { query: filters });
  }

  /** Iterates over every API key, page by page. */
  async *listAll(filters?: Omit<ApiKeyListFilters, "last_key">): AsyncGenerator<ApiKey> {
    let lastKey: string | undefined;
    do {
      const page = await this.list({ ...filters, last_key: lastKey });
      yield* page.list;
      lastKey = page.lastKey || undefined;
    } while (lastKey);
  }

  /** Creates an API key. The response carries the secret `value`. */
  create(request: CreateApiKeyRequest): Promise<ApiKey> {
    return this.send("POST", "/apikey", { body: request });
  }

  /** Gets one API key. */
  get(apiKeyId: string): Promise<ApiKey> {
    return this.send("GET", `/apikey/${seg(apiKeyId)}`);
  }

  /** Updates an API key's name, role or product settings. */
  update(apiKeyId: string, request: UpdateApiKeyRequest): Promise<ApiKey> {
    return this.send("PUT", `/apikey/${seg(apiKeyId)}`, { body: request });
  }

  /** Rotates an API key: issues a new secret value and invalidates the old one. */
  rotate(apiKeyId: string): Promise<ApiKey> {
    return this.send("PATCH", `/apikey/${seg(apiKeyId)}`);
  }

  /** Deletes an API key. */
  async delete(apiKeyId: string): Promise<void> {
    await this.send("DELETE", `/apikey/${seg(apiKeyId)}`);
  }
}

/** Billing operations (Stripe). */
export class BillingOperations {
  constructor(private send: Send) {}

  /** Applies a subscription change (subscribe, change or cancel a product subscription). */
  updateSubscription(change: SubscriptionChange): Promise<Workspace> {
    return this.send("PATCH", "", { query: change });
  }

  /** Selects the billing account (locked after first use) and maintains invoice PO numbers. */
  updateBillingProfile(request: BillingProfileRequest): Promise<BillingProfile> {
    return this.send("PUT", "/billing-profile", { body: request });
  }

  /** Creates a Stripe customer session for embedded components (pricing table, buy button). */
  createAuthSession(options?: BillingAuthSessionOptions): Promise<BillingAuthSession> {
    return this.send("GET", "/billing-auth-session", { query: options });
  }

  /** Creates a Stripe billing portal session; redirect the user to the returned `url`. */
  createPortalSession(options?: BillingPortalSessionOptions): Promise<BillingPortalSession> {
    return this.send("GET", "/billing-portal-session", { query: options });
  }

  /** Turns the usage hard cap on or off. Requires a user session (not an API-key token). */
  updateUsageCap(request: UsageCapRequest): Promise<UsageCapResult> {
    return this.send("PUT", "/usage-cap", { body: request });
  }

  /** Previews the next invoice of a metered subscription (`carmen` or `pr`). */
  previewInvoice(productId: string): Promise<InvoicePreview> {
    return this.send("GET", "/invoice-preview", { query: { product_id: productId } });
  }
}

/** Usage reports. */
export class UsageOperations {
  constructor(private send: Send) {}

  /** Daily usage of the whole workspace. `from`/`to` are `YYYY-MM-DD` dates. */
  getWorkspaceUsage(range?: UsageRange): Promise<UsageReport> {
    return this.send("GET", "/usage", { query: range });
  }

  /** Daily usage of one API key. `from`/`to` are `YYYY-MM-DD` dates. */
  getApiKeyUsage(apiKeyId: string, range?: UsageRange): Promise<ApiKeyUsageReport> {
    return this.send("GET", `/apikey/${seg(apiKeyId)}/usage`, { query: range });
  }
}

/** Stored recognition events. */
export class EventOperations {
  constructor(private send: Send) {}

  /**
   * Lists stored events of a recognition API (storage must be enabled for it).
   * Pass the returned `continuationToken` as `continuation-token` for the next page.
   */
  list(api: StoredEventApi, filters?: StoredEventFilters): Promise<StoredEventPage> {
    return this.send("GET", `/events/${seg(api)}`, { query: filters });
  }
}

/** Event storage settings. */
export class StorageOperations {
  constructor(private send: Send) {}

  /** Gets which APIs have event storage enabled, and the SNS topic events are published to. */
  getStatus(): Promise<StorageStatus> {
    return this.send("GET", "/storage/status");
  }

  /** Enables or disables event storage per API; omitted APIs are left as they are. */
  updateStatus(patch: StorageStatusPatch): Promise<StorageStatus> {
    return this.send("PATCH", "/storage/status", { body: patch });
  }
}

/** Webhook operations. */
export class HookOperations {
  constructor(private send: Send) {}

  /** Lists the registered hooks. */
  list(): Promise<Hook[]> {
    return this.send("GET", "/storage/hooks");
  }

  /** Registers a hook URL; the endpoint must confirm the SNS subscription. */
  create(request: CreateHookRequest): Promise<Hook> {
    return this.send("POST", "/storage/hooks", { body: request });
  }

  /** Gets one hook by its URL. */
  get(hookUrl: string): Promise<Hook> {
    return this.send("GET", `/storage/hooks/${seg(hookUrl)}`);
  }

  /** Changes which APIs' events are sent to the hook. */
  update(hookUrl: string, apis: HookApisPatch): Promise<Hook> {
    return this.send("PATCH", `/storage/hooks/${seg(hookUrl)}`, { body: apis });
  }

  /** Deletes a hook. */
  async delete(hookUrl: string): Promise<void> {
    await this.send("DELETE", `/storage/hooks/${seg(hookUrl)}`);
  }
}
