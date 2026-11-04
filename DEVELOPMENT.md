# Development

## Setup

```sh
nvm use # if you use nvm, otherwise install the node version in .nvmrc
npm install
```

You also need to set environment variables for the tests to run. You can do this
by creating a `.env` file in the root of the project. You can use `.env.example`
as a template.

## Testing

```sh
npm test
```

This will run the tests in the `test` directory. Please make sure that you have a
`.env` file in the root of the project as described in the setup section.

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
  is a test case that checks that the `supportedAPIVersion` properties of the 
  client classes (`VehicleAPIClient` and `TransportAPIClient`) match the version 
  numbers returned by the respective APIs. This test case will fail if the 
  version number is not updated.
- Please also pay attention to the version numbers in the README.md file. The
  version numbers in the README.md file should be updated to match the version
  numbers in the `supportedAPIVersion` properties of the client classes.
- After the version has been updated, run `npm publish --access public` to
  publish the new version to npm. (You need to be logged in to npm for this to
  work.)