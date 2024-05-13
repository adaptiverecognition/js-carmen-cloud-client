#!/usr/bin/env bash

# Check if the API parameter is provided
if [ $# -eq 0 ]; then
    echo "Please provide the API parameter (vehicle, transport, storage-and-hook, descriptor)."
    exit 1
fi

api="$1"

pushd "./assets/$api" || exit

# Iterage over ./assets/storage-and-hook/*.schema.json files
# and generate TypeScript types for each one
for schema in *.schema.json
do
  # Extract the model name from the file path
  model=$(basename "$schema" .schema.json)
  # Generate the TypeScript type
  npx json2ts --input "./$model.schema.json" --output "../../src/${api}/${model,,}.ts"
done

popd || exit
