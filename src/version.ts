/**
 * Warns when the API answers with a different major.minor version than the
 * client supports. The API reports `major.minor` (e.g. `1.0`), the clients
 * track `major.minor.patch`, so the patch part is not compared.
 */
export function warnOnApiVersionMismatch(supported: string, received: string | undefined): void {
  const majorMinor = (v: string | undefined) => (v ?? "").split(".").slice(0, 2).join(".");
  if (majorMinor(received) !== majorMinor(supported)) {
    console.warn(`WARNING: API version mismatch. Expected ${supported}, got ${received}.`);
  }
}
