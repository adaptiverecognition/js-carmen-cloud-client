export enum CodeType {
  /**
   * US container codes (6 or 10 digits)
   */
  ACCR_USA = "accr_usa",

  /**
   * Intermodal shipping container codes (ilu)
   */
  ILU = "ilu",

  /**
   * Intermodal shipping container codes (iso)
   */
  ISO = "iso",

  /**
   * Moco container codes (8 digits)
   */
  MOCO = "moco",

  /**
   * Brasil wagon codes (10 or 11 digits)
   */
  BRA = "bra",

  /**
   * Russian and Ukrainian wagon codes (8 digits)
   */
  RUS = "rus",

  /**
   * Cargo wagon codes
   */
  UIC = "uic",

  /**
   * US Cargo wagon codes
   */
  AAR = "aar",

  /**
   * US truck chassis code
   */
  CHASSIS = "chassis",

  /**
   * US Department of Transportation registration number
   */
  USDOT = "usdot",

}

export interface TransportAPIOptions {
  /**
   * The API key to be used for authentication.
   */
  apiKey: string;

  /**
   * The URL of the API endpoint to call. Optional
   * if `cloudServiceRegion` is also set. Overrides
   * `cloudServiceRegion` if both properties are set.
   */
  endpoint?: string;

  /**
   * The cloud service region to use - `"EU"` for Europe
   * and `"US"` for the United States. Has no effect if
   * `endpoint` is also set.
   */
  cloudServiceRegion?: "EU" | "US";

  /**
   * The type of code to read.
   */
  type: CodeType;

  /**
   * Disables searching for and reading the last 4 digits of the ISO
   * container code.
   *
   * NOTE: This parameter is only used when using the iso code type,
   * when searching for other code types, it has no effect.
   */
  disableISOCode?: boolean;

  /**
   * The codes the engine can recognize contain a checksum digit which
   * can be used to check the validity of the digits read. A matching
   * checksum indicates a high probability of the recognition result being
   * correct. The Transportation & Cargo API verifies the checksum by default
   * and discards any results where the check fails. By sending true as the
   * value of this header, you can disable this check and receive all codes the
   * engine recognized - even those known to be incorrect.
   */
  disableChecksumCheck?: boolean;

  /**
   * Enables full US ACCR code recognition.
   *
   * NOTE: This parameter is only used when using the accr_usa code type, when
   * searching for other code types, it has no effect.
   */
  enableFullUsAccrCode?: boolean;

  /**
   * The service resizes large images to Full HD resolution by bicubic
   * interpolation. Resizing can make reading many times faster, but
   * it can reduce the recognition efficiency. If you don't want the
   * service to resize your images, turn this feature on by setting the
   * property value to `true`. By disabling image resizing, you may also
   * need to enable wide range analysis.
   */
  disableImageResizing?: boolean;

  /**
   * If you cannot guarantee that the uploaded image meets all the
   * required parameters (see the Input Images tab on the How To Use page),
   * you can turn on the wide-range analysis by setting this property's
   * value to `true`. Attention! The duration of the analysis may increase
   * several times.
   */
  enableWideRangeAnalysis?: boolean;

  /**
   * An optional parameter, it specifies the maximum number of
   * vehicle/license plate searches per image. Use this parameter
   * carefully, because every search increases the processing time.
   * The system will stop searching when there is no more vehicle/license
   * plate in the image, or the number of searches reaches the value of
   * `maxreads`. Its value is `1` by default, the maximum is `5`.
   */
  maxReads?: number;

  /**
   * How many times the request should be retried in case of a 5XX response
   * status code. Default: 3.
   */
  retryCount?: number;
}