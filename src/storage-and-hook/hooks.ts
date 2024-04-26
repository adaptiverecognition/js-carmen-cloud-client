/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * An array of hooks.
 */
export type Hooks = Hook[];

/**
 * Represents a webhook.
 */
export interface Hook {
  /**
   * The status of this hook
   */
  status: "pending_confirmation" | "confirmed" | "deleted";
  /**
   * The protocol used to send events to this hook.
   */
  protocol: "http" | "https";
  /**
   * An object with properties that correspond to API subscriptions.
   */
  apis?: {
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
   * The URL of the webhook events will be sent to.
   */
  hookUrl: string;
  /**
   * The name of the AWS SNS topic that serves this hook. This can be used to verify incoming requests.
   */
  topicName: string;
  /**
   * The ARN of the AWS SNS topic that serves this hook. This can be used to verify incoming requests.
   */
  topicArn: string;
  [k: string]: unknown;
}
