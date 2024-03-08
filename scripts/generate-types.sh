#!/usr/bin/env bash

pushd ./assets/storage-and-hook || exit

# Iterage over ./assets/storage-and-hook/*.schema.json files
# and generate TypeScript types for each one
for schema in *.schema.json
do
  # Extract the model name from the file path
  model=$(basename "$schema" .schema.json)
  # Generate the TypeScript type
  npx json2ts --input "./$model.schema.json" --output "../../src/storage-and-hook/${model,,}.ts"
done

popd || exit
