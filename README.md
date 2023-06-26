# Carmen Cloud Client by Adaptive Recognition

JavaScript/TypeScript client for Carmen Cloud by Adaptive Recognition. This unified library provides you with access to both the **Vehicle API** and the **Transportation & Cargo API**.

## Supported API Versions

- Vehicle API: v1.4
- Transport API: v1.0

## 🛠️ How to Install

```sh
npm install --save @adaptive-recognition/carmen-cloud-client
```

## 🚀 Usage

You can utilize either the Vehicle API or the Transportation & Cargo API based on your needs.

### 🚗 Vehicle API

```typescript
import { VehicleClient, Locations } from "@adaptive-recognition/carmen-cloud-client";

const vehicleClient = new VehicleAPIClient({
    apiKey: "<YOUR_API_KEY>",
    services: { anpr: true, mmr: true },
    inputImageLocation: Locations.Europe.Hungary,
    cloudServiceRegion: "EU"
});

async function recognizeVehicle() {
    const response = await vehicleClient.send("./car.jpg");
    console.log(response);
}

recognizeVehicle()
    .then()
    .catch(err => console.error(err));
```

### 🚚 Transport API

```typescript
import { TransportClient } from "@adaptive-recognition/carmen-cloud-client";

const transportClient = new TransportAPIClient({
    apiKey: "<YOUR_API_KEY>",
    type: "iso",
    cloudServiceRegion: "EU"
});

async function recognize() {
    const response = await transportClient.send("./container.jpg");
    console.log(response);
}

recognize()
    .then()
    .catch(err => console.error(err));
```

## 🔧 Development

For more information about developing and contributing to this project, see [DEVELOPMENT.md](DEVELOPMENT.md).
