/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * An object with the list of APIs where event storage is currently enabled.
 */
export interface StorageStatusResponse {
  /**
   * An object indicating whether storage is enabled for the APIs included.
   */
  enabledApis: {
    /**
     * Optional. Indicates whether to enable storage for the Vehicle API.
     */
    vehicle?: boolean;
    /**
     * Optional. Indicates whether to enable storage for the Transport API.
     */
    transport?: boolean;
    [k: string]: unknown;
  };
  /**
   * The ARN of the SNS topic hook requests are sent from. The value is `null` if storage is disabled.
   */
  topicArn: string | null;
  [k: string]: unknown;
}
