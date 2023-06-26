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