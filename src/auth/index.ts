import { AxiosInstance, isAxiosError } from "axios";
import { CarmenAPIConfigError, CarmenAPIError } from "../errors";
import { CommonClientOptions, createHttpClient, selectApiBaseUrl } from "../http";
import { components } from "./schema";

/** The response of `POST /auth/token`. */
export type AccessToken = components["schemas"]["TokenResponse"];
/** The JSON Web Key Set that verifies issued access tokens. */
export type JsonWebKeySet = components["schemas"]["JsonWebKeySet"];

/** Options of {@link AuthClient}. */
export interface AuthClientOptions extends CommonClientOptions {
  /** The Carmen Cloud API key to exchange for access tokens. */
  apiKey: string;
  /**
   * Renew the cached token this many seconds before it expires.
   * Default: 60.
   */
  renewBeforeExpirySeconds?: number;
}

/**
 * Exchanges an API key for short-lived (60-minute) bearer access tokens at
 * `POST /auth/token`, and caches the current token until shortly before it
 * expires. Concurrent callers share one in-flight request.
 */
export class AuthClient {
  private http: AxiosInstance;
  private baseUrl: string;
  private cached?: AccessToken;
  private pending?: Promise<AccessToken>;

  constructor(private options: AuthClientOptions) {
    if (!options.apiKey) {
      throw new CarmenAPIConfigError("apiKey must be specified.");
    }
    this.http = createHttpClient(options);
    this.baseUrl = selectApiBaseUrl(options) + "/auth";
  }

  /**
   * Returns a valid access token, requesting a new one when there is no
   * cached token or it is about to expire.
   *
   * @param forceRefresh Ignore the cached token.
   */
  async getAccessToken(forceRefresh = false): Promise<AccessToken> {
    if (!forceRefresh && this.cached && !this.isExpiring(this.cached)) {
      return this.cached;
    }
    if (!this.pending) {
      this.pending = this.createAccessToken().finally(() => {
        this.pending = undefined;
      });
    }
    this.cached = await this.pending;
    return this.cached;
  }

  /** Requests a new access token, bypassing the cache. */
  async createAccessToken(): Promise<AccessToken> {
    try {
      const response = await this.http.post<AccessToken>(
        this.baseUrl + "/token",
        undefined,
        { headers: { "x-api-key": this.options.apiKey } }
      );
      return response.data;
    } catch (e) {
      throw toCarmenAPIError(e);
    }
  }

  /** Fetches the public keys that verify the issued tokens (RS256 JWTs). */
  async getJwks(): Promise<JsonWebKeySet> {
    try {
      const response = await this.http.get<JsonWebKeySet>(this.baseUrl + "/.well-known/jwks.json");
      return response.data;
    } catch (e) {
      throw toCarmenAPIError(e);
    }
  }

  private isExpiring(token: AccessToken): boolean {
    const margin = this.options.renewBeforeExpirySeconds ?? 60;
    return token.expires_at - margin <= Date.now() / 1000;
  }
}

/** Converts an axios error into a {@link CarmenAPIError}; other errors pass through. */
export function toCarmenAPIError(e: unknown): unknown {
  if (isAxiosError(e) && e.response) {
    const body = e.response.data as Record<string, unknown> | undefined;
    const message =
      (typeof body?.message === "string" && body.message) ||
      (typeof body?.error_description === "string" && body.error_description) ||
      (typeof body?.error === "string" && body.error) ||
      e.message;
    return new CarmenAPIError(message, e.response.status, body);
  }
  return e;
}
