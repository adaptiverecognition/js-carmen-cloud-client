# Carmen Cloud Client by Adaptive Recognition

JavaScript/TypeScript client for [Carmen Cloud](https://carmencloud.com/) by [Adaptive Recognition](https://adaptiverecognition.com/). This unified library provides you with access to the **Vehicle API**, the **Transportation & Cargo API** and the **Carmen Cloud API**.

## Supported API Versions

- Vehicle API: v1.4.2
- Transportation & Cargo API: v1.0.1
- Carmen Cloud API: current latest

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

### ☁️ Carmen Cloud API

Manage your workspace programmatically: members, API keys, billing, usage
reports, stored events, event storage and webhooks. Use an API key with a
workspace role (`ADMIN`, `EDITOR` or `ACCOUNTANT`); the client exchanges it for
short-lived bearer tokens and renews them automatically.

```typescript
import { CarmenCloudClient } from "@adaptive-recognition/carmen-cloud-client";

const client = new CarmenCloudClient({ apiKey: "<YOUR_API_KEY>" });

async function manageWorkspace() {
    const workspace = await client.workspace.get();
    console.log(workspace.name, workspace.subscriptions);

    // API keys
    const key = await client.apiKeys.create({ name: "ci", role: "EDITOR" });
    for await (const k of client.apiKeys.listAll()) console.log(k.name);
    await client.apiKeys.rotate(key.apiKeyId);

    // Usage (YYYY-MM-DD)
    const usage = await client.usage.getWorkspaceUsage({ from: "2026-10-01", to: "2026-10-31" });
    console.log(usage.totalQuantity);

    // Members
    await client.members.invite({ email: "colleague@example.com", role: "ACCOUNTANT" });

    // Event storage and webhooks
    await client.storage.updateStatus({ vehicle: true });
    await client.hooks.create({ hookUrl: "https://example.com/carmen-hook", apis: { vehicle: true } });
    const events = await client.events.list("vehicle", { limit: 10, order: "desc" });
    console.log(events.events.length);
}

manageWorkspace().catch(console.error);
```

| Property | Operations |
| --- | --- |
| `workspace` | `get`, `rename`, `delete`\*, `transferOwnership`\* |
| `members` | `list`, `invite`, `get`, `updateRole`, `remove` |
| `apiKeys` | `list`, `listAll`, `create`, `get`, `update`, `rotate`, `delete` |
| `billing` | `updateSubscription`, `updateBillingProfile`, `createAuthSession`, `createPortalSession`, `previewInvoice`, `updateUsageCap`\* |
| `usage` | `getWorkspaceUsage`, `getApiKeyUsage` |
| `events` | `list` |
| `storage` | `getStatus`, `updateStatus` |
| `hooks` | `list`, `create`, `get`, `update`, `delete` |

\* Requires a signed-in user's session token instead of an API key: pass
`accessToken` (a string or a function returning one) and `workspaceId`
instead of `apiKey`.

Failed calls throw `CarmenAPIError` with the HTTP `status` and the API's
error `message`. To get a bearer token for your own HTTP client, use
`new AuthClient({ apiKey }).getAccessToken()`.

### Upgrading from 2.x

- `StorageAndHookAPIClient` is replaced by `CarmenCloudClient` (`storage`,
  `hooks` and `events`).
- `DescriptorAPIClient` is removed: the Descriptor API is deprecated.
- Node.js 20 or newer is required.

## 🔧 Development

For more information about developing and contributing to this project, see [DEVELOPMENT.md](DEVELOPMENT.md).
