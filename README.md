# Carmen Cloud Client by Adaptive Recognition

JavaScript/TypeScript client for [Carmen Cloud](https://cloud.adaptiverecognition.com/) by [Adaptive Recognition](https://adaptiverecognition.com/). This unified library provides you with access to both the **Vehicle API** and the **Transportation & Cargo API**.

## Supported API Versions

- Vehicle API: v1.4.1
- Transportation & Cargo API: v1.0.1

## 🛠️ How to Install

```sh
npm install --save @adaptive-recognition/carmen-cloud-client
```

## 🚀 Usage

You can utilize either the Vehicle API or the Transportation & Cargo API based on your needs.

### 🚗 Vehicle API

```typescript
import { VehicleAPIClient, Locations } from "@adaptive-recognition/carmen-cloud-client";

const client = new VehicleAPIClient({
    apiKey: "<YOUR_API_KEY>",
    services: { anpr: true, mmr: true },
    inputImageLocation: Locations.Europe.Hungary,
    cloudServiceRegion: "EU"
});

async function recognizeVehicle() {
    const response = await client.send("./car.jpg");
    console.log(response);
}

recognizeVehicle().catch(console.error);
```

### 🚚 Transportation & Cargo API

```typescript
import { TransportAPIClient, CodeType } from "@adaptive-recognition/carmen-cloud-client";

const client = new TransportAPIClient({
    apiKey: "<YOUR_API_KEY>",
    type: CodeType.ISO,
    cloudServiceRegion: "EU"
});

async function recognize() {
    const response = await client.send("./container.jpg");
    console.log(response);
}

recognize().catch(console.error);
```

## 🔧 Development

For more information about developing and contributing to this project, see [DEVELOPMENT.md](DEVELOPMENT.md).
