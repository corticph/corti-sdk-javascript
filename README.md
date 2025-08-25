# Corti JavaScript Library

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-Built%20with%20Fern-brightgreen)](https://buildwithfern.com?utm_source=github&utm_medium=github&utm_campaign=readme&utm_source=https%3A%2F%2Fgithub.com%2Fcorticph%2Fcorti-sdk-javascript)
[![npm shield](https://img.shields.io/npm/v/@corti/sdk)](https://www.npmjs.com/package/@corti/sdk)

> [!WARNING]
> This is a **Beta version** of the Corti JavaScript SDK library. We are treating it as stable for production use, but
> there may still be breaking changes before we reach version 1.0. We're actively working to improve the library and would greatly
> appreciate any feedback if you encounter any inconsistencies or issues 💚

The Corti JavaScript library provides convenient access to the Corti API from JavaScript.

## Installation

```sh
npm i -s @corti/sdk
```

## Reference

A full reference for this library is available [here](REFERENCE-latest.md).

For detailed authentication instructions, see the [Authentication Guide](./AUTHENTICATION.md).

## Usage

Instantiate and use the client with the following:

```typescript
import { CortiEnvironment, CortiClient } from "@corti/sdk";

// Using client credentials (OAuth2)
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        clientId: "YOUR_CLIENT_ID",
        clientSecret: "YOUR_CLIENT_SECRET",
    },
});

// Or using a bearer token
const client = new CortiClient({
    environment: CortiEnvironment.Eu,
    tenantName: "YOUR_TENANT_NAME",
    auth: {
        accessToken: "YOUR_ACCESS_TOKEN",
        // Optional: refresh token for automatic token refresh
        refreshToken: "YOUR_REFRESH_TOKEN",
        expiresIn: 3600,
        refreshExpiresIn: 86400,
    },
});

// For user authentication, you can also use Authorization Code Flow
// See the Authentication Guide for detailed instructions

await client.interactions.create({
    encounter: {
        identifier: "identifier",
        status: "planned",
        type: "first_consultation",
    },
});
```

## Request And Response Types

The SDK exports all request and response types as TypeScript interfaces. Simply import them with the
following namespace:

```typescript
import { Corti } from "@corti/sdk";

const request: Corti.InteractionsListRequest = {
    ...
};
```

## Exception Handling

Depending on the type of error, the SDK will throw one of the following:

- **CortiError**: Thrown when the API returns a non-success status code (4xx or 5xx response). This is the base error for API-related issues.
- **ParseError**: Thrown when parsing input data fails schema validation. This typically occurs when the data you provide does not match the expected schema.
- **JsonError**: Thrown when serializing data to JSON fails schema validation. This typically occurs when converting parsed data to JSON for transmission or storage fails validation.

Example usage:

```typescript
import { CortiError, ParseError, JsonError } from "@corti/sdk";

try {
    await client.interactions.create(...);
} catch (err) {
    if (err instanceof CortiError) {
        // Handle API errors
        console.log(err.statusCode);
        console.log(err.message);
        console.log(err.body);
        console.log(err.rawResponse);
    }
    if (err instanceof ParseError) {
        // Handle schema validation errors during parsing
        console.error("Parse validation error details:", err.errors);
    }
    if (err instanceof JsonError) {
        // Handle schema validation errors during serialization
        console.error("JSON validation error details:", err.errors);
    }
}
```

## Pagination

List endpoints are paginated. The SDK provides an iterator so that you can simply loop over the items:

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
const response = await client.interactions.list();
for await (const item of response) {
    console.log(item);
}

// Or you can manually iterate page-by-page
const page = await client.interactions.list();
while (page.hasNextPage()) {
    page = page.getNextPage();
}
```

## Advanced

### Additional Headers

If you would like to send additional headers as part of the request, use the `headers` request option.

```typescript
const response = await client.interactions.create(..., {
    headers: {
        'X-Custom-Header': 'custom value'
    }
});
```

### Retries

The SDK is instrumented with automatic retries with exponential backoff. A request will be retried as long
as the request is deemed retryable and the number of retry attempts has not grown larger than the configured
retry limit (default: 2).

A request is deemed retryable when any of the following HTTP status codes is returned:

- [408](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/408) (Timeout)
- [429](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429) (Too Many Requests)
- [5XX](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500) (Internal Server Errors)

Use the `maxRetries` request option to configure this behavior.

```typescript
const response = await client.interactions.create(..., {
    maxRetries: 0 // override maxRetries at the request level
});
```

### Timeouts

The SDK defaults to a 60 second timeout. Use the `timeoutInSeconds` option to configure this behavior.

```typescript
const response = await client.interactions.create(..., {
    timeoutInSeconds: 30 // override timeout to 30s
});
```

### Aborting Requests

The SDK allows users to abort requests at any point by passing in an abort signal.

```typescript
const controller = new AbortController();
const response = await client.interactions.create(..., {
    abortSignal: controller.signal
});
controller.abort(); // aborts the request
```

### Access Raw Response Data

The SDK provides access to raw response data, including headers, through the `.withRawResponse()` method.
The `.withRawResponse()` method returns a promise that results to an object with a `data` and a `rawResponse` property.

```typescript
const { data, rawResponse } = await client.interactions.create(...).withRawResponse();

console.log(data);
console.log(rawResponse.headers['X-My-Header']);
```

### Runtime Compatibility

The SDK defaults to `node-fetch` but will use the global fetch client if present. The SDK works in the following
runtimes:

- Node.js 18+
- Modern browsers
- Vercel
- Cloudflare Workers
- Deno v1.25+
- Bun 1.0+
- React Native

### Customizing Fetch Client

The SDK provides a way for you to customize the underlying HTTP client / Fetch function. If you're running in an
unsupported environment, this provides a way for you to break glass and ensure the SDK works.

```typescript
import { CortiClient } from "@corti/sdk";

const client = new CortiClient({
    ...
    fetcher: // provide your implementation here
});
```

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
