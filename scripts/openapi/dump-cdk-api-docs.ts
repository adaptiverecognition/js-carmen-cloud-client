/* eslint-disable @typescript-eslint/no-var-requires */
/*
 * Captures the ApiDocSpec objects carmen-cloud-cdk publishes as API Gateway
 * documentation, without synthesizing any CDK app or touching AWS.
 *
 * Usage (from a carmen-cloud-cdk checkout with node_modules installed):
 *   TS_NODE_TRANSPILE_ONLY=1 node -r ts-node/register \
 *     <this-repo>/scripts/openapi/dump-cdk-api-docs.ts "$PWD" /tmp/specs.json
 * then:
 *   python3 <this-repo>/scripts/openapi/build_openapi.py /tmp/specs.json <this-repo>/assets/carmen-cloud
 */
const CDK = process.argv[2];
const docs = require(CDK + "/lib/shared/api-docs");
const captured: Record<string, unknown> = {};
let current = "";
docs.documentApi = (_scope: unknown, id: string, _api: unknown, spec: unknown) => {
  captured[current + ":" + id] = spec;
};
const run = (name: string, mod: string, fn: string) => {
  current = name;
  require(CDK + mod)[fn]({}, {});
};
run("workspace", "/lib/workspace/workspace-docs", "documentWorkspaceApi");
run("auth", "/lib/auth/auth-docs", "documentAuthApi");
require("fs").writeFileSync(process.argv[3], JSON.stringify(captured, null, 1));
console.log(Object.keys(captured));
