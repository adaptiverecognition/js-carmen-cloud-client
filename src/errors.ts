/**
 * An error class used for reporting errors in the
 * configuration of the Carmen API client.
 */
export class CarmenAPIConfigError extends Error {
  /**
   * Creates a new instance of the CarmenAPIConfigError class with the specified error message.
   * @param message - The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = "CarmenAPIConfigError";
  }
}

/**
 * An error returned by a Carmen Cloud API: a non-2xx HTTP response.
 */
export class CarmenAPIError extends Error {
  /**
   * @param message - The error message (the API's `message` or `error_description` when present).
   * @param status - The HTTP status code.
   * @param body - The parsed response body, if any.
   */
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "CarmenAPIError";
  }
}
