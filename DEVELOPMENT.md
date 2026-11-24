# Development

## Setup

```sh
nvm use # if you use nvm, otherwise install the node version in .nvmrc
npm ci --ignore-scripts
```

You also need to set environment variables for the tests to run. You can do this
by creating a `.env` file in the root of the project. You can use `.env.example`
as a template.

## Testing

```sh
npm test
```

This will run the tests in the `test` directory. The Vehicle and
Transportation & Cargo API suites call the live APIs, so they are skipped
unless `TEST_DEV_API_KEY` is set. The Carmen Cloud API tests mock HTTP with
nock and always run.

The dev recognition APIs only accept requests from the office LAN (WAF
`AR-EU-DEV-API-ACL`), so run the live tests against dev from the office or
the VPN. GitHub-hosted runners can't reach dev: CI runs the unit tests on
every push and pull request, and the live tests only in the manually
triggered `live` job (Actions > CI > Run workflow), against prod with the
test-workspace keys. For local live runs, create the `.env` file described in
the setup section.

## Updating the API models

- **Vehicle / Transportation & Cargo API**: `npm run update-types` downloads the
  response JSON schemas from API Gateway (needs AWS credentials, e.g.
  `AWS_PROFILE=carmen-cloud-ro`), then `npm run generate-types` regenerates
  `src/*/response.ts`.
- **Carmen Cloud API and Authentication**: the OpenAPI documents in
  `assets/carmen-cloud/` are built from the API documentation specs in
  `carmen-cloud-cdk` (the same specs CDK publishes to API Gateway):

  ```sh
  cd ../../carmen-cloud-cdk
  TS_NODE_TRANSPILE_ONLY=1 node -r ts-node/register \
    ../libraries/js-carmen-cloud-client/scripts/openapi/dump-cdk-api-docs.ts "$PWD" /tmp/specs.json
  cd -
  python3 scripts/openapi/build_openapi.py /tmp/specs.json assets/carmen-cloud
  npm run generate-types:carmen-cloud
  ```

  Only the bearer-token routes are included; the console-only SigV4 routes
  (workspace list/create, invitations) are not part of the API-key surface.

## Development Workflow

- New features are developed in the `develop` branch.
- After a feature is finished, push it and make sure that the CI pipeline passes.
- Create a pull request to merge the feature into `master`.
- After the pull request is merged, pull the `master` branch and run `npm
  version` to update the version number:
    - If this is a **backward-compatible bugfix** release, run `npm version patch`.
    - If this is a **backward-compatible feature** release, run `npm version minor`.
    - If this is a **backward-incompatible release**, run `npm version major`.
    - The `npm version` command will automatically create a commit and a tag for
      the new version. Push the commit and the tag to the remote repository:
      `git push --tags origin master`.
- Always make sure that the tests run after updating the version number. There
  is a live integration test that checks that the `supportedAPIVersion` properties of the 
  client classes (`VehicleAPIClient` and `TransportAPIClient`) match the version 
  numbers returned by the respective APIs. This test case will fail if the 
  version number is not updated.
- Please also pay attention to the version numbers in the README.md file. The
  version numbers in the README.md file should be updated to match the version
  numbers in the `supportedAPIVersion` properties of the client classes.
- Pushing the version tag runs `.github/workflows/release.yml`, which stages
  the package on npm with trusted publishing (OIDC, with provenance). No npm
  token is needed; the trusted publisher is configured once in the package
  settings on npmjs.com, and it may only stage. To release, approve the staged
  version with 2FA on npmjs.com, or run `npm stage list` and then
  `npm stage approve <stage-id>`.
