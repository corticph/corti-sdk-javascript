# Proxying Guide

This guide explains how to use proxying with the Corti JavaScript SDK to securely handle authentication in frontend applications and protect sensitive credentials.

## Why Proxying?

When using **Client Credentials** authentication, the token you receive is a **service account user token** that provides access to all data created within the same API Client. This means:

- **Data isolation is your responsibility** - You must implement access control logic to ensure users can only access their own data
- **Frontend exposure risk** - If you expose a Client Credentials token in your frontend application, it could be used to access all data associated with that API Client, not just the current user's data

### Security Best Practice

**Our general recommendation when Client Credentials is used is to use the SDK (or other calls to Corti API) only on the backend** where you can:

- Securely store client credentials
- Implement proper access control checks
- Validate user permissions before making API calls
- Call from the frontend only your own backend methods

However, if you need to use the SDK directly from the frontend while maintaining security, proxying provides a solution.

For more information about Client Credentials authentication, see the [Authentication Guide - Client Credentials](./AUTHENTICATION.md#client-credentials-authentication).

## Using Proxying with baseUrl and environments

If you're implementing a proxy instead of your own backend methods, you can leverage the SDK's types and endpoint structures by using the `baseUrl` and `environments` options for both `CortiClient` and `CortiAuth`.

### Using baseUrl

The `baseUrl` option allows you to point the SDK to your own proxy server instead of directly to Corti's API. All requests will be routed through your proxy.

#### Example: CortiClient with baseUrl

```typescript
import { CortiClient } from "@corti/sdk";

// Point the client to your proxy server
const client = new CortiClient({
    baseUrl: "https://your-proxy-server.com/api/corti_proxy",
    // Optional: You can omit the `auth` option if your proxy handles authentication.
    // If provided, it will add the header: `Authorization: Bearer {accessToken}`
    auth: {
        accessToken: "YOUR_TOKEN",
    },
    // Optional: You can add custom headers here. These headers will be included in every request sent by the client.
    headers: {
        'X-Custom-Header': "CUSTOM_HEADER_VALUE",
    }
});

// All API calls will go to your proxy
const interactions = await client.interactions.list();
// Under the hood: GET https://your-proxy-server.com/api/corti_proxy/interactions
```

#### Example: CortiAuth with baseUrl

```typescript
import { CortiAuth } from "@corti/sdk";

const auth = new CortiAuth({
    baseUrl: "https://your-proxy-server.com/auth/corti_proxy",
});

// Token requests will go to your proxy
const tokenResponse = await auth.getToken({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
});
// Under the hood: POST https://your-proxy-server.com/auth/corti_proxy/{tenantName}/protocol/openid-connect/token
// Under the hood if tenantName is empty: POST https://your-proxy-server.com/auth/corti_proxy/protocol/openid-connect/token
```

### Using Custom Environments

Instead of using `baseUrl`, you can provide a custom environment object that defines all the endpoints your proxy uses. This gives you fine-grained control over where different types of requests are routed.

#### Environment Object Structure

The environment object has the following structure:

```typescript
interface CortiEnvironmentUrls {
    base: string; // Base URL for REST API calls (e.g., "https://your-proxy.com/api/v2/corti_proxy")
    wss: string; // WebSocket URL for stream/transcribe connections (e.g., "wss://your-proxy.com/corti_proxy")
    login: string; // Authentication endpoint base URL (e.g., "https://your-proxy.com/auth/realms/corti_proxy")
    agents: string; // Agents API base URL (e.g., "https://your-proxy.com/api/corti_proxy")
}
```

#### Example: CortiClient with Custom Environment

```typescript
import { CortiClient } from "@corti/sdk";

const customEnvironment = {
    base: "https://your-proxy-server.com/api/corti_proxy",
    wss: "wss://your-proxy-server.com/corti_proxy",
    login: "https://your-proxy-server.com/auth/corti_proxy",
    agents: "https://your-proxy-server.com/agents/corti_proxy",
};

const client = new CortiClient({
    environment: customEnvironment,
    // Optional: You can omit the `auth` option if your proxy handles authentication.
    // If provided, it will add the header: `Authorization: Bearer {accessToken}`
    auth: {
        accessToken: "YOUR_TOKEN",
    },
    // Optional: You can add custom headers here. These headers will be included in every request sent by the client.
    headers: {
        'X-Custom-Header': "CUSTOM_HEADER_VALUE",
    }
});

// REST API calls use environment.base
const interactions = await client.interactions.list();
// Under the hood: GET https://your-proxy-server.com/api/corti_proxy/interactions

// WebSocket connections use environment.wss
const socket = await client.stream.connect({ id: "interaction-id" });
// Under the hood: Connects to wss://your-proxy-server.com/corti_proxy/interactions/{interaction-id}/stream
```

#### Example: CortiAuth with Custom Environment

```typescript
import { CortiAuth } from "@corti/sdk";

const customEnvironment = {
    base: "https://your-proxy-server.com/api/corti_proxy",
    wss: "wss://your-proxy-server.com/corti_proxy",
    login: "https://your-proxy-server.com/auth/corti_proxy",
    agents: "https://your-proxy-server.com/agents/corti_proxy",
};

const auth = new CortiAuth({
    environment: customEnvironment,
});

// Token requests use environment.login
const tokenResponse = await auth.getToken({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
});
// Under the hood: POST https://your-proxy-server.com/auth/corti_proxy/{tenantName}/protocol/openid-connect/token
// Under the hood when tenantName is empty: POST https://your-proxy-server.com/auth/corti_proxy/protocol/openid-connect/token
```

### What Gets Called Under the Hood

When you use `baseUrl` or a custom environment:

1. **REST API calls** - All HTTP requests (GET, POST, PUT, DELETE, etc.) are sent to your proxy's base URL
2. **Authentication requests** - Token requests are sent to your proxy's login endpoint
3. **WebSocket connections** - WebSocket connections are established to your proxy's WebSocket URL

Your proxy server should:

- Forward requests to the appropriate Corti API endpoints
- Handle authentication and add the necessary tokens
- Implement access control and data filtering
- Return responses in the same format as Corti's API

## WebSocket Proxying with CortiWebSocketProxyClient

For WebSocket connections (stream and transcribe), the SDK provides `CortiWebSocketProxyClient` to make proxying even easier. This client handles all the logic around managing sockets, parsing messages, and sending configuration automatically, while allowing you to connect to your own WebSocket proxy endpoint.

### Basic Usage

```typescript
import { CortiWebSocketProxyClient } from "@corti/sdk";

// Connect to stream through your proxy
const streamSocket = await CortiWebSocketProxyClient.stream.connect({
    proxy: {
        url: "wss://your-proxy-server.com/corti_proxy/steam",
        // Optional: specify WebSocket subprotocols
        protocols: ["stream-protocol"],
        // Optional: add query parameters
        queryParameters: {
            interactionId: "interaction-id",
        },
    },
    // Optional: stream configuration
    configuration: {
        // ... your stream configuration
    },
});

// Listen for messages
streamSocket.on("message", (data) => {
    console.log("Received:", data);
});

// Send messages
streamSocket.send({ type: "message", content: "Hello" });

// Connect to transcribe through your proxy
const transcribeSocket = await CortiWebSocketProxyClient.transcribe.connect({
    proxy: {
        url: "wss://your-proxy-server.com/corti_proxy/transcribe",
        queryParameters: {
            interactionId: "interaction-id",
        },
    },
    // Optional: transcribe configuration
    configuration: {
        // ... your transcribe configuration
    },
});
```

### Proxy Options

The `proxy` parameter accepts the following options:

- **`url`** (required): The WebSocket URL of your proxy server
- **`protocols`** (optional): Array of WebSocket subprotocols to use
- **`queryParameters`** (optional): Query parameters to append to the WebSocket URL

### Benefits

Using `CortiWebSocketProxyClient` provides:

- **Configuration handling** - Configuration messages are automatically sent when connecting
- **Reconnection logic** - Built-in reconnection handling with configurable attempts
- **Type safety** - Full TypeScript support for all message types and configurations
- **Event handling** - Standard WebSocket event interface (message, error, close, open)

## Scoped Tokens (Alternative to Proxying)

If exposing an `accessToken` for WebSockets is absolutely necessary and a proxy cannot be implemented, you can use **scoped tokens** to limit the token's access. By passing additional scopes to authentication methods, you can issue a token that only grants access to specific endpoints, preventing the token from being used to access other data.

### Available Scopes

Currently available scopes:

- **`"transcribe"`** - Grants access only to the transcribe WebSocket endpoint
- **`"stream"`** - Grants access only to the stream WebSocket endpoint

### Using Scopes with Client Credentials

```typescript
import { CortiAuth, CortiEnvironment } from "@corti/sdk";

const auth = new CortiAuth({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
});

// Request a token with only stream scope
const streamToken = await auth.getToken({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    scopes: ["stream"],
});

// Request a token with only transcribe scope
const transcribeToken = await auth.getToken({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    scopes: ["transcribe"],
});

// Request a token with both scopes
const bothScopesToken = await auth.getToken({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    scopes: ["stream", "transcribe"],
});
```

### Important Notes on Scoped Tokens

- **Limited access** - Scoped tokens can only be used for the specified endpoints (stream or transcribe WebSocket connections)
- **Cannot access REST API** - Scoped tokens cannot be used to make REST API calls to access data
- **Security consideration** - While scoped tokens limit access, they still provide access to WebSocket endpoints. Proxying remains the recommended approach for maximum security
- **Token validation** - The Corti API will reject requests made with scoped tokens to endpoints outside their scope

### Using Scoped Tokens with WebSocket Clients

```typescript
import { CortiClient, CortiEnvironment } from "@corti/sdk";

// Create client with scoped token (stream scope only)
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        accessToken: streamToken.accessToken, // Token with "stream" scope
    },
});

// This will work - stream is within the token's scope
const streamSocket = await client.stream.connect({ id: "interaction-id" });

// This will fail - transcribe is not within the token's scope
// await client.transcribe.connect({ id: "interaction-id" }); // ❌ Error

// This will fail - REST API calls are not within the token's scope
// await client.interactions.list(); // ❌ Error
```

## Summary

- **Proxying is recommended** when using Client Credentials in frontend applications to protect sensitive tokens and implement proper access control
- **Use `baseUrl` or custom environments** to route SDK requests through your proxy server while maintaining type safety
- **Use `CortiWebSocketProxyClient`** for simplified WebSocket proxying with automatic message handling
- **Scoped tokens** provide an alternative when proxying isn't possible, but limit access to specific WebSocket endpoints only

For more information about authentication methods, see the [Authentication Guide](./AUTHENTICATION.md).
