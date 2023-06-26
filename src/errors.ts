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
