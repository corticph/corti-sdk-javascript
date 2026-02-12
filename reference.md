# Reference
## Interactions
<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">list</a>({ ...params }) -> core.Page&lt;Corti.InteractionsGetResponse, Corti.InteractionsListResponse&gt;</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Lists all existing interactions. Results can be filtered by encounter status and patient identifier.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
const pageableResponse = await client.interactions.list();
for await (const item of pageableResponse) {
    console.log(item);
}

// Or you can manually iterate page-by-page
let page = await client.interactions.list();
while (page.hasNextPage()) {
    page = page.getNextPage();
}

// You can also access the underlying response
const response = page.response;

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.InteractionsListRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InteractionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

<details><summary><code>client.interactions.<a href="/src/api/resources/interactions/client/Client.ts">create</a>({ ...params }) -> Corti.InteractionsCreateResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Creates a new interaction.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.interactions.create({
    encounter: {
        identifier: "identifier",
        status: "planned",
        type: "first_consultation"
    }
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.InteractionsCreateRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `InteractionsClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Auth
<details><summary><code>client.auth.<a href="/src/api/resources/auth/client/Client.ts">getToken</a>(tenantName, { ...params }) -> Corti.GetTokenResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Obtain an OAuth2 access token. Supports multiple grant types (client_credentials, authorization_code, refresh_token, password).
The path parameter tenantName (realm) identifies the Keycloak realm; use the same value as the Tenant-Name header for API requests.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.auth.getToken("base", {
    body: {
        grantType: "client_credentials",
        clientId: "client_id_123"
    }
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**tenantName:** `string` — Keycloak realm / tenant name. Must match the tenant used for API requests (same as Tenant-Name header).
    
</dd>
</dl>

<dl>
<dd>

**request:** `Corti.GetTokenAuthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `AuthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>

## Oauth
<details><summary><code>client.oauth.<a href="/src/api/resources/oauth/client/Client.ts">getToken</a>({ ...params }) -> Corti.GetTokenOauthResponse</code></summary>
<dl>
<dd>

#### 📝 Description

<dl>
<dd>

<dl>
<dd>

Minimal endpoint for Fern OAuth; implementation should call the real token endpoint.
</dd>
</dl>
</dd>
</dl>

#### 🔌 Usage

<dl>
<dd>

<dl>
<dd>

```typescript
await client.oauth.getToken({
    clientId: "client_id",
    clientSecret: "client_secret"
});

```
</dd>
</dl>
</dd>
</dl>

#### ⚙️ Parameters

<dl>
<dd>

<dl>
<dd>

**request:** `Corti.GetTokenOauthRequest` 
    
</dd>
</dl>

<dl>
<dd>

**requestOptions:** `OauthClient.RequestOptions` 
    
</dd>
</dl>
</dd>
</dl>


</dd>
</dl>
</details>
