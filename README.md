# Carmen Cloud Client by Adaptive Recognition

JavaScript/TypeScript client for [Carmen Cloud](https://carmencloud.com/) by [Adaptive Recognition](https://adaptiverecognition.com/). This unified library provides you with access to the **Vehicle API**, **Transportation & Cargo API** and the **Storage & Hook API**.

## Supported API Versions

- Vehicle API: v1.4.1
- Transportation & Cargo API: v1.0.1
- Storage & Hook API: current version

## 🛠️ How to Install

```sh
npm install --save @adaptive-recognition/carmen-cloud-client
```

## 🚀 Usage

The three APIs available have separate client classes. For basic usage, see the examples below.

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

### 📦 Storage & Hook API

```typescript
import { StorageAndHookAPIClient } from ".";

const client = new StorageAndHookAPIClient({
  apiKey: '<YOUR_API_KEY>',
  cloudServiceRegion: 'EU'
});

// List Events
const events = await client.getEvents('vehicle');
console.log('events:', events);

// Get Storage Status
const status = await client.getStorageStatus();
console.log('status:', status);

// Update Storage Status
const updatedStatus = await client.updateStorageStatus(
  { transport: true }
);
console.log('updatedStatus:', updatedStatus);

// Create Hook
const createdHook = await client.createHook({
  hookUrl: 'https://your-domain.com/your-hook-path',
  apis: ['vehicle', 'transport']
});
console.log('createdHook:', createdHook);

// List Hooks
const hooks = await client.getHooks();
console.log('hooks:', hooks);

// Get Hook
const hook = await client.getHook('https://your-domain.com/your-hook-path');
console.log('hook:', hook);

// Update Hook
const updatedHook = await client.updateHook(
  'https://your-domain.com/your-hook-path',
  { vehicle: true, transport: true }
);
console.log('updatedHook:', updatedHook);

// Delete Hook
await client.deleteHook('https://your-domain.com/your-hook-path');
```

### ✍️ Descriptor API

```typescript
import { DescriptorAPIClient, DescriptorAPIOptions } from ".";

const options: DescriptorAPIOptions = {
  apiKey: "<YOUR_API_KEY>",
  cloudServiceRegion: 'EU'
};
const client = new DescriptorAPIClient(options);

const apis = await client.getApis({ detailed: true });
console.log('apis:', apis);

const dimensions = await client.getDimensions();
console.log('dimensions:', dimensions);

const freeCallCount = await client.getFreeCallCount('carmen');
console.log('freeCallCount:', freeCallCount);

const paidSubscriptionUsage = await client.getPaidSubscriptionUsage('carmen');
console.log('paidSubscriptionUsage:', paidSubscriptionUsage);

const paidSubscriptions = await client.getPaidSubscriptions();
console.log('paidSubscriptions:', paidSubscriptions);

const prices = await client.getPrices('carmen', 'HU');
console.log('prices:', prices);

const products = await client.getProducts();
console.log('products:', products);

const region = await client.getRegion();
console.log('region:', region);

const usagePlanSubscriptions = await client.getUsagePlanSubscriptions();
console.log('usagePlanSubscriptions:', usagePlanSubscriptions);

const usagePlanUsage = await client.getUsagePlanUsage();
console.log('usagePlanUsage:', usagePlanUsage);

const usagePlans = await client.getUsagePlans();
console.log('usagePlans:', usagePlans);
```

## 🔧 Development

For more information about developing and contributing to this project, see [DEVELOPMENT.md](DEVELOPMENT.md).
