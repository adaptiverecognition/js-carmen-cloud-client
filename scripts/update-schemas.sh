#!/usr/bin/env bash

# Default values
api_id=""
models=()
schema_dir=""

# Function to set values based on the API parameter
set_api_values() {
    case "$1" in
        "vehicle")
            api_id="jw68bdy2t5"
            models=(
                "Response"
            )
            schema_dir="./assets/vehicle"
            ;;
        "transport")
            api_id="2bzr9vm131"
            models=(
                "Response"
            )
            schema_dir="./assets/transport"
            ;;
        "storage-and-hook")
            api_id="24ut7ue8d8"
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
            schema_dir="./assets/storage-and-hook"
            ;;
        "descriptor")
            api_id="yqh6c9omp7"
            models=(
                "APIListResponse"
                "DimensionListReponse"
                "PaidSubscriptionListResponse"
                "PaidSubscriptionUsageResponse"
                "ProductsResponse"
                "UsagePlanListResponse"
                "UsagePlanSubscriptionListResponse"
                "Prices"
                # The output of the type generator for this schema does not
                # compile, so I fixed it manually.
                # "UsagePlanUsageResponse"
            )
            schema_dir="./assets/descriptor"
            ;;
        *)
            echo "Invalid API parameter. Allowed values: vehicle, transport, storage-and-hook, descriptor"
            exit 1
            ;;
    esac
}

# Check if the API parameter is provided
if [ $# -eq 0 ]; then
    echo "Please provide the API parameter (vehicle, transport, storage-and-hook, descriptor)."
    exit 1
fi

# Set the values based on the API parameter
set_api_values "$1"

for model in "${models[@]}"
do
    aws apigateway get-model --rest-api-id "$api_id" --model-name "$model" | jq --raw-output '.schema' > "$schema_dir/$model.schema.json"
done

for file in $(find $schema_dir -name '*.json'); do
    # replace the remote reference with the local one
    sed -i 's|https://apigateway.amazonaws.com/restapis/'"$api_id"'/models/\(.*\)"|\1.schema.json"|g' "$file"
done
