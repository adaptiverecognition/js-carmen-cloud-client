// A 24Q1-től az alábbi OCR engine-eket adjuk ki, egyaránt negyedéves frissítési gyakorisággal:
// EU_RAIL: az eddigi UIC ill. RUS OCR engine-ek együtt + egyéb, európai vagon- és mozdonykódok
// AM_RAIL: az eddigi AAR ill. BRA OCR engine-ek együtt + egyéb, az amerikai kontinenseken található vagon- és mozdonykódok
// TRUCK: az eddigi ACCR_USA, USDOT és CHASSIS OCR engine-ek együtt + egyéb, teherautókon előforduló azonosító kódok
// ISO: az eddigi ISO, ILU és ISOILU OCR engine-ek együtt

export enum CodeType {
  /**
   * ISO and ILU shipping container codes
   */
  ISO = "iso",

  /**
   * Identification codes used on trucks (ACCR, US DOT, CHASSIS and others)
   */
  TRUCK = "truck",

  /**
   * American wagon and locomotive codes used across the American continent to
   * identify individual rail vehicles (AAR, BRA and others)
   */
  AM_RAIL = "am-rail",

  /**
   * European wagon and locomotive codes used across Europe to identify individual rail vehicles
   */
  EU_RAIL = "eu-rail",

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
   * The cloud service region to use - `"AUTO"` for latency-based
   * automatic routing (default), `"EU"` for Europe and `"US"` for
   * the United States. Has no effect if `endpoint` is also set.
   */
  cloudServiceRegion?: "AUTO" | "EU" | "US";

  /**
   * The type of code to read.
   */
  type: CodeType;

  /**
   * Legacy additional-code switch for the `iso` and `eu-rail` code types.
   * Sends `X-Disable-Iso-Code`. On OCR engines from `7.3.20.46` it is only a
   * fallback, used when `disableAdditionalCode` is not set.
   *
   * @deprecated Use `disableAdditionalCode` instead.
   */
  disableISOCode?: boolean;

  /**
   * Disables additional code reading (such as the ISO equipment/type code) for
   * the `iso` and `eu-rail` code types. Sends `X-Disable-Additional-Code`.
   * Supported by OCR engines from `7.3.20.46`; other code types ignore it.
   * When set, it takes precedence over `disableISOCode`, including when its
   * value is `false`.
   */
  disableAdditionalCode?: boolean;

  /**
   * Sends the legacy `X-Disable-Checksum-Check` header, kept for older OCR
   * engines. From `7.3.20.46` the engine handles checksum checks internally
   * and they cannot be configured, so this option has no effect there.
   *
   * @deprecated Checksum checks are not configurable from OCR engine
   * `7.3.20.46` onward.
   */
  disableChecksumCheck?: boolean;

  /**
   * Enables full US ACCR code recognition.
   *
   * Sends `X-Enable-Full-Us-Accr-Code`. Applies only to the `truck` code type;
   * other code types ignore it.
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