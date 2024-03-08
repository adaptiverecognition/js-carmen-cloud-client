#!/usr/bin/env bash

models=(
  "APIStorageStatusRequest"
  "CreateHookRequest"
  "EventsResponse"
  "Hook"
  "Hooks"
  "OKResponse"
  "StorageStatusResponse"
  "UpdateHookRequest"
)
schemadir="./assets/storage-and-hook"

for model in "${models[@]}"
do
   aws apigateway get-model --rest-api-id "24ut7ue8d8" --model-name "$model" | jq --raw-output '.schema' > "$schemadir/$model.schema.json"
done


for file in $(find $schemadir -name '*.json'); do
    # replace the remote reference with the local one
    sed -i 's|https://apigateway.amazonaws.com/restapis/24ut7ue8d8/models/\(.*\)"|\1.schema.json"|g' "$file"
done