import { CortiClient } from "../../../src";
import { SDK_VERSION } from "../../../src/version";

const BASE_OPTIONS = {
    baseUrl: "https://proxy.example.com",
    tenantName: "test-tenant",
    auth: { accessToken: "fake-token" },
};

describe("CortiClient.getHeaders", () => {
    it("returns auth, tenant, custom, analytics, and SDK headers matching outbound requests", async () => {
        const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(
            new Response(JSON.stringify({ languages: { en: {} } }), {
                headers: { "Content-Type": "application/json" },
            }),
        );
        const client = new CortiClient({
            ...BASE_OPTIONS,
            headers: {
                "X-Custom": "custom-value",
                "X-Corti-Analytics": JSON.stringify({ source: "custom-header" }),
            },
            analytics: { integration: "test-integration" },
            fetch: fetchFn,
        });

        const headers = await client.getHeaders();

        expect(headers).toBeInstanceOf(Headers);
        expect(headers.get("Authorization")).toBe("Bearer fake-token");
        expect(headers.get("Tenant-Name")).toBe("test-tenant");
        expect(headers.get("X-Custom")).toBe("custom-value");
        expect(headers.get("X-Fern-SDK-Name")).toBe("@corti/sdk");
        expect(headers.get("X-Fern-Runtime")).toBeTruthy();
        expect(headers.get("User-Agent")).toBeTruthy();
        expect(JSON.parse(headers.get("X-Corti-Analytics") ?? "{}")).toEqual({
            source: "custom-header",
            integration: "test-integration",
            sdk_version: SDK_VERSION,
            sdk_type: "corti-sdk-javascript",
        });

        await client.languages.list();
        const requestHeaders = new Headers(fetchFn.mock.calls[0][1]?.headers);
        requestHeaders.delete("Accept");
        expect(Object.fromEntries(headers)).toEqual(Object.fromEntries(requestHeaders));
    });

    it("resolves sync and async suppliers on each call and omits nullish values", async () => {
        const supplier = vi.fn().mockReturnValueOnce("first").mockReturnValueOnce("second");
        const client = new CortiClient({
            ...BASE_OPTIONS,
            headers: {
                "X-Dynamic": supplier,
                "X-Async": async () => "async-value",
                "X-Null": () => null,
                "X-Undefined": async () => undefined,
                "X-Empty": "",
                "User-Agent": () => null,
            },
        });

        const first = await client.getHeaders();
        const second = await client.getHeaders();

        expect(first.get("X-Dynamic")).toBe("first");
        expect(second.get("X-Dynamic")).toBe("second");
        expect(first.get("X-Async")).toBe("async-value");
        expect(first.has("X-Null")).toBe(false);
        expect(first.has("X-Undefined")).toBe(false);
        expect(first.get("X-Empty")).toBe("");
        expect(first.has("User-Agent")).toBe(false);
    });

    it("uses the same auth and tenant override precedence as API requests", async () => {
        const client = new CortiClient({
            ...BASE_OPTIONS,
            headers: { authorization: "custom-auth", "tenant-name": "custom-tenant" },
        });

        const headers = await client.getHeaders();

        expect(headers.get("Authorization")).toBe("custom-auth");
        expect(headers.get("Tenant-Name")).toBe("test-tenant");
        const authHeaders = await client.getAuthHeaders();
        expect(authHeaders.get("Authorization")).toBe("Bearer fake-token");
        expect(authHeaders.has("X-Corti-Analytics")).toBe(false);
    });

    it("refreshes expired tokens and reuses the refreshed token", async () => {
        const refreshAccessToken = vi.fn().mockResolvedValue({ accessToken: "refreshed-token", expiresIn: 300 });
        const client = new CortiClient({
            ...BASE_OPTIONS,
            auth: { accessToken: "expired-token", expiresIn: 0, refreshAccessToken },
        });

        const first = await client.getHeaders();
        const second = await client.getHeaders();

        expect(first.get("Authorization")).toBe("Bearer refreshed-token");
        expect(second.get("Authorization")).toBe("Bearer refreshed-token");
        expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    });

    it("supports unauthenticated proxy clients without a tenant", async () => {
        const client = new CortiClient({ baseUrl: BASE_OPTIONS.baseUrl, headers: { "X-Custom": "value" } });

        const headers = await client.getHeaders();

        expect(headers.has("Authorization")).toBe(false);
        expect(headers.get("Tenant-Name")).toBe("");
        expect(headers.get("X-Custom")).toBe("value");
        expect(headers.has("X-Corti-Analytics")).toBe(true);
        expect(headers.has("Accept")).toBe(false);
        expect(headers.has("Content-Type")).toBe(false);
    });
});
