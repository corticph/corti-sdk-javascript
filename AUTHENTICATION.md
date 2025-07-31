# Authentication Guide

The Corti TypeScript SDK supports multiple authentication methods to provide flexibility for different use cases. This guide covers all available authentication options and their usage.

## Overview

The SDK supports three main authentication methods:

1. **Client Credentials (OAuth2)** - Traditional OAuth2 client credentials flow (Backend only)
2. **Bearer Token** - Direct token usage with optional refresh capability (Frontend & Backend)
3. **Authorization Code Flow without PKCE (OAuth2)** - Full OAuth2 authorization code flow for user authentication (Frontend & Backend)

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
    tokenType: string;
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
            
            // Response must return a valid token object containing GetTokenResponse:
            // {
            //   accessToken: string;      // Required: The new access token
            //   expiresIn?: number;       // Optional: Seconds until token expires
            //   refreshToken?: string;    // Optional: New refresh token if rotated
            //   refreshExpiresIn?: number; // Optional: Seconds until refresh token expires
            // }
            return response.json();
        },
    },
});
```

## Authorization Code Flow

**✅ Frontend & Backend Required** - This method requires both frontend and backend components, with the client secret securely stored on the backend server. The frontend handles the user interaction while sensitive operations are performed server-side.

The Authorization Code Flow is the standard OAuth2 flow for user authentication. This flow is implemented through the `CortiAuth` class and is available when enabled for your client.

For detailed information about Authorization Code Flow, see the [official Corti documentation](https://docs.corti.ai/about/oauth#2-authorization-code-flow-without-pkce).

### Basic Flow Overview

1. **Redirect user to authorization URL** - User is redirected to Corti's login page
2. **User authenticates** - User logs in and authorizes your application
3. **Receive authorization code** - User is redirected back with an authorization code
4. **Exchange code for tokens** - Exchange the authorization code for access and refresh tokens
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

### Step 2: Handle the Callback

When the user is redirected back to your application, you'll receive an authorization code in the URL parameters. Since exchanging this code for tokens requires your client secret, you must send the code to your backend server to complete the authentication:

```typescript
// Frontend: Extract the authorization code from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const error = urlParams.get('error');

if (error) {
    console.error('Authorization failed:', error);
    return;
}

if (code) {
    // Send the code to your backend server
    const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    });
    
    if (response.ok) {
        const token = await response.json();
        // Store tokens securely
        console.log('Authentication successful');
    } else {
        console.error('Authentication failed');
    }
}
```

```typescript
// Backend: Handle the callback and exchange code for tokens using CortiAuth
import { CortiAuth, CortiEnvironment } from "@corti/sdk";
import express from 'express';

const app = express();
app.use(express.json());

const auth = new CortiAuth({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
});

app.post('/api/auth/callback', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        // Exchange the authorization code for tokens using CortiAuth
        const tokenResponse = await auth.getCodeFlowToken({
            clientId: "YOUR_CLIENT_ID",
            clientSecret: "YOUR_CLIENT_SECRET", // Securely stored on server
            redirectUri: "https://your-app.com/callback",
            code: code,
        });

        // Return tokens to frontend (consider using httpOnly cookies for security)
        res.json(tokenResponse);

    } catch (error) {
        console.error('Failed to exchange code for tokens:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Optional: Endpoint to refresh tokens
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Refresh tokens using CortiAuth
        const refreshResponse = await auth.refreshToken({
            clientId: "YOUR_CLIENT_ID",
            clientSecret: "YOUR_CLIENT_SECRET",
            refreshToken: refreshToken,
        });

        res.json(refreshResponse);

    } catch (error) {
        console.error('Failed to refresh tokens:', error);
        res.status(500).json({ error: 'Token refresh failed' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### Step 3: Use the Tokens

Once you have the tokens from your backend server, you can create a `CortiClient` instance:

```typescript
// Frontend: Create CortiClient with tokens from server
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        ...token, // Spread the token object received from /api/auth/callback
        refreshAccessToken: async (refreshToken: string) => {
            // Make API call to your backend to refresh the token
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: refreshToken }),
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            return response.json();
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
