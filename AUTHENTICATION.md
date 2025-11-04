# Authentication Guide

The Corti TypeScript SDK supports multiple authentication methods to provide flexibility for different use cases. This guide covers all available authentication options and their usage.

## Overview

The SDK supports five main authentication methods:

1. **Client Credentials (OAuth2)** - Traditional OAuth2 client credentials flow (Backend only)
2. **Bearer Token** - Direct token usage with optional refresh capability (Frontend & Backend)
3. **Authorization Code Flow without PKCE (OAuth2)** - Full OAuth2 authorization code flow for user authentication (Frontend & Backend)
4. **Authorization Code Flow with PKCE (OAuth2)** - OAuth2 authorization code flow with PKCE for enhanced security (Frontend & Backend)
5. **Resource Owner Password Credentials (ROPC)** - OAuth2 ROPC flow for username/password authentication (Frontend & Backend, requires server endpoint)

## Client Credentials Authentication

**⚠️ Backend Only** - This method should only be used in server-side applications where client secrets can be securely stored.

This is the most common authentication method for server-to-server applications. The SDK handles the OAuth2 token exchange and refresh automatically, ensuring your application always has valid credentials.

For detailed information about Client Credentials flow, see the [official Corti documentation](https://docs.corti.ai/about/oauth#4-client-credentials-grant-used-for-api-integrations).

### Basic Usage

```typescript
import { CortiEnvironment, CortiClient } from "@corti/sdk";

const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET",
    },
});
```

## Bearer Token Authentication

**✅ Frontend & Backend** - This method can be used in both client-side and server-side applications.

Use this method when you already have an access token from another source or want to manage tokens externally.

### Generating Bearer Tokens (Backend)

You can generate bearer tokens on your **backend server** using `CortiAuth`:

```typescript
import { CortiAuth, CortiEnvironment } from "@corti/sdk";

const auth = new CortiAuth({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
});

// Generate tokens using client credentials
const tokenResponse = await auth.getToken({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
});

/**
interface GetTokenResponse {
    accessToken: string;
    tokenType?: string;        // Optional: Token type (defaults to "Bearer")
    expiresIn: number;
    refreshToken?: string;
    refreshExpiresIn?: number;
}
*/
```

### Basic Bearer Token

```typescript
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        accessToken: "YOUR_ACCESS_TOKEN",
    },
});
```

### Bearer Token with Refresh Function Only

You can also use bearer token authentication with just a refresh function, without providing an initial access token:

```typescript
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        refreshAccessToken: async (refreshToken?: string) => {
            // Your custom logic to get a new access token
            const response = await fetch("https://your-auth-server/refresh", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: refreshToken }),
            });
            
            // Response must return a valid token object:
            // {
            //   accessToken: string;      // Required: The new access token
            //   expiresIn?: number;       // Optional: Seconds until token expires
            //   refreshToken?: string;    // Optional: New refresh token if rotated
            //   refreshExpiresIn?: number; // Optional: Seconds until refresh token expires
            //   tokenType?: string;       // Optional: Token type (defaults to "Bearer")
            // }
            return response.json();
        },
    },
});
```

### With Refresh Token Support

The SDK can automatically refresh tokens when they expire:

```typescript
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        accessToken: "YOUR_ACCESS_TOKEN",
        refreshToken: "YOUR_REFRESH_TOKEN",
        expiresIn: 3600, // Access token expires in 1 hour
        refreshExpiresIn: 86400, // Refresh token expires in 24 hours

        // This function runs before any API call when the access_token is near expiration
        refreshAccessToken: async (refreshToken: string) => {
            // Custom refresh logic -- get new access_token from server
            const response = await fetch("https://your-auth-server/refresh", {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: refreshToken }),
            });
            
            // Response must return a valid token object:
            // {
            //   accessToken: string;      // Required: The new access token
            //   expiresIn?: number;       // Optional: Seconds until token expires
            //   refreshToken?: string;    // Optional: New refresh token if rotated
            //   refreshExpiresIn?: number; // Optional: Seconds until refresh token expires
            //   tokenType?: string;       // Optional: Token type (defaults to "Bearer")
            // }
            return response.json();
        },
    },
});
```

## Authorization Code Flow

**✅ Client-Side or Backend** - This method can be fully handled on the client side, or tokens can be exchanged on the backend. The SDK handles all authentication steps.

**Note**: CORS is enabled for this flow. Requests must come from the same origin as specified in your redirect URIs configuration.

The Authorization Code Flow is the standard OAuth2 flow for user authentication. This flow is implemented through the `CortiAuth` class and is available when enabled for your client.

For detailed information about Authorization Code Flow, see the [official Corti documentation](https://docs.corti.ai/about/oauth#2-authorization-code-flow-without-pkce).

### Basic Flow Overview

1. **Redirect user to authorization URL** - User is redirected to Corti's login page
2. **User authenticates** - User logs in and authorizes your application
3. **Receive authorization code** - User is redirected back with an authorization code
4. **Exchange code for tokens** - Exchange the authorization code for access and refresh tokens using SDK (client-side)
5. **Use tokens** - Pass the tokens to a new `CortiClient` instance to make authenticated API calls, refresh when needed

### Step 1: Create Authorization URL

```typescript
import { CortiAuth, CortiEnvironment } from "@corti/sdk";

const auth = new CortiAuth({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
});

// Generate authorization URL
const authUrl = await auth.authorizeURL({
    clientId: "YOUR_CLIENT_ID",
    redirectUri: "https://your-app.com/callback",
}); // Automatically redirects to authorization URL

// To prevent automatic redirect and get URL only:
const authUrlNoRedirect = await auth.authorizeURL({
    clientId: "YOUR_CLIENT_ID", 
    redirectUri: "https://your-app.com/callback",
}, { skipRedirect: true });
```

### Step 2: Handle the Callback and Exchange Code for Tokens

When the user is redirected back to your application, you'll receive an authorization code in the URL parameters. Exchange it for tokens directly on the client using the SDK:

```typescript
// Extract the authorization code from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const error = urlParams.get('error');

if (error) {
    console.error('Authorization failed:', error);
    return;
}

if (code) {
    // Exchange the authorization code for tokens using SDK (client-side)
    const tokenResponse = await auth.getCodeFlowToken({
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET",
        redirectUri: "https://your-app.com/callback",
        code: code,
    });

    console.log('Token Response: ', tokenResponse);
}
```

### Step 3: Use the Tokens

Once you have the tokens, you can create a `CortiClient` instance:

```typescript
// Create CortiClient with tokens
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        refreshAccessToken: async (refreshToken: string) => {
            // Refresh tokens using SDK directly (client-side)
            const refreshResponse = await auth.refreshToken({
                clientId: "YOUR_CLIENT_ID",
                clientSecret: "YOUR_CLIENT_SECRET",
                refreshToken: refreshToken,
            });
            
            return {
                access_token: refreshedTokens.accessToken,
                refresh_token: refreshedTokens.refreshToken,
                expires_in: refreshedTokens.expiresIn,
            };
        },
    },
});

// Now you can use the client for API calls
try {
    const interactions = await client.interactions.list();
    console.log('Interactions:', interactions);
} catch (error) {
    console.error('API call failed:', error);
}
```

## Authorization Code Flow with PKCE

**✅ Client-Side or Backend** - This method can be fully handled on the client side, or tokens can be exchanged on the backend. This flow is secure, interactive, and doesn't require a client secret (ideal for public clients). Proof Key for Code Exchange (PKCE) protects against code interception attacks.

**Note**: CORS is enabled for this flow. Requests must come from the same origin as specified in your redirect URIs configuration.

The Authorization Code Flow with PKCE is ideal for:
- Native apps
- Single Page Applications (SPAs)
- Browser-based integration where a user is present

For detailed information about PKCE flow, see the [official Corti documentation](https://docs.corti.ai/api-reference/oauth#1-authorization-code-flow-with-pkce-recommended-for-corti-assistant).

### Basic Flow Overview

1. **Generate code verifier and challenge** - Create a code verifier and compute its challenge
2. **Redirect user to authorization URL** - User is redirected to Corti's login page with code challenge
3. **User authenticates** - User logs in and authorizes your application
4. **Receive authorization code** - User is redirected back with an authorization code
5. **Exchange code for tokens with code verifier** - Exchange the authorization code for access and refresh tokens using the code verifier
6. **Use tokens** - Pass the tokens to a new `CortiClient` instance to make authenticated API calls

### Step 1: Generate Authorization URL (Frontend)

**Recommended: Use `authorizePkceUrl()`** - The SDK handles code verifier generation and storage automatically:

```typescript
import { CortiAuth, CortiEnvironment } from "@corti/sdk";

const auth = new CortiAuth({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
});

// SDK automatically generates code verifier and stores it in localStorage
const authUrl = await auth.authorizePkceUrl({
    clientId: "YOUR_CLIENT_ID",
    redirectUri: "https://your-app.com/callback"
});

// To prevent automatic redirect and get URL only:
const authUrlNoRedirect = await auth.authorizePkceUrl({
    clientId: "YOUR_CLIENT_ID", 
    redirectUri: "https://your-app.com/callback",
}, { skipRedirect: true });
```

**Alternative: Manual Generation** - If you need more control over the process:

```typescript
import { CortiAuth, CortiEnvironment } from "@corti/sdk";

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer) {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const codeVerifier = generateCodeVerifier();
localStorage.setItem('pkce_verifier', codeVerifier);
const codeChallenge = await generateCodeChallenge(codeVerifier);

const auth = new CortiAuth({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
});

// Generate authorization URL
const authUrl = await auth.authorizeURL({
    clientId: "YOUR_CLIENT_ID",
    redirectUri: "https://your-app.com/callback",
    codeChallenge,
});

// To prevent automatic redirect and get URL only:
const authUrlNoRedirect = await auth.authorizeURL({
    clientId: "YOUR_CLIENT_ID",
    redirectUri: "https://your-app.com/callback",
    codeChallenge,
}, { skipRedirect: true });
```

### Step 2: Handle the Callback and Exchange Code for Tokens

```typescript
// Extract the authorization code from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const error = urlParams.get('error');

if (error) {
    console.error('Authorization failed:', error);
    return;
}

if (code) {
    // Retrieve codeVerifier from SDK if you used authorizePkceUrl (automatically stored)
    // Otherwise, you need to pass it manually if you generated it yourself
    const codeVerifier = auth.getCodeVerifier()
    
    if (!codeVerifier) {
        console.error('Code verifier not found');
        return;
    }
    
    // Exchange the authorization code for tokens using SDK (client-side)
    const tokenResponse = await auth.getPkceFlowToken({
        clientId: "YOUR_CLIENT_ID",
        redirectUri: "https://your-app.com/callback",
        code: code,
        codeVerifier: codeVerifier,
    });

    // Store tokens securely
    console.log("Token Response: ", tokenResponse)
}
```

### Step 3: Use the Tokens

Once you have the tokens, you can create a `CortiClient` instance:

```typescript
// Create CortiClient with tokens
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        refreshAccessToken: async (refreshToken: string) => {
            // Refresh tokens using SDK directly (client-side)
            const refreshResponse = await auth.refreshToken({
                clientId: "YOUR_CLIENT_ID",
                clientSecret: '', // PKCE flow doesn't require client secret
                refreshToken: refreshToken,
            });
            
            return {
                access_token: refreshResponse.accessToken,
                refresh_token: refreshResponse.refreshToken,
                expires_in: refreshedTokens.expiresIn,
            };
        },
    },
});

// Now you can use the client for API calls
try {
    const interactions = await client.interactions.list();
    console.log('Interactions:', interactions);
} catch (error) {
    console.error('API call failed:', error);
}
```

## Resource Owner Password Credentials (ROPC) Flow

**⚠️ Backend Only** - This method should only be used in server-side applications. The ROPC flow allows users to authenticate directly with their username and password using the SDK.

**⚠️ Security Note**: ROPC flow requires sending credentials directly. This should only be used for:
- Trusted applications (e.g., first-party mobile apps, backend services)
- Testing and development
- Internal tools

**For production web applications, use PKCE flow instead.**

For detailed information about ROPC flow, see the [official Corti documentation](https://docs.corti.ai/api-reference/oauth#3-resource-owner-password-credentials-ropc-grant-use-with-caution).

### Basic Usage

```typescript
import { CortiAuth, CortiEnvironment } from "@corti/sdk";

const CLIENT_ID = "YOUR_CLIENT_ID";
const USERNAME = "user@example.com";
const PASSWORD = "your-password";

const auth = new CortiAuth({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
});

// Exchange credentials for tokens using ROPC flow
const tokenResponse = await auth.getRopcFlowToken({
    clientId: CLIENT_ID,
    username: USERNAME,
    password: PASSWORD,
});

console.log("Token Response: ", tokenResponse)
```
