import { CortiClient } from "../../src";

// CC auth skips JWT decoding in resolveClientOptions, so it works with any environment value.
const CC_AUTH = { auth: { clientId: "test", clientSecret: "test" }, tenantName: "test" };
// Bearer auth with a fake token works when isProxyMode() returns true (baseUrl or full URL object set).
const BEARER_AUTH = { auth: { accessToken: "fake-token" } };

function makeClient(overrides: object): CortiClient {
    return new CortiClient(overrides as ConstructorParameters<typeof CortiClient>[0]);
}

describe("cortiClient.getEnvironmentUrls", () => {
    describe("named environment string", () => {
        it("returns correctly-shaped URLs for a known region", async () => {
            const client = makeClient({ ...CC_AUTH, environment: "eu" });
            const urls = await client.getEnvironmentUrls();

            expect(urls.base).toBe("https://api.eu.corti.app/v2");
            expect(urls.wss).toBe("wss://api.eu.corti.app/audio-bridge/v2");
            expect(urls.login).toBe("https://auth.eu.corti.app/realms");
            expect(urls.agents).toBe("https://api.eu.corti.app");
        });
    });

    describe("explicit CortiEnvironmentUrls object", () => {
        it("passes the object through unchanged", async () => {
            const envUrls = {
                base: "https://api.custom.example.com/v2",
                wss: "wss://api.custom.example.com/audio",
                login: "https://auth.custom.example.com/realms",
                agents: "https://api.custom.example.com",
            };
            const client = makeClient({ ...BEARER_AUTH, environment: envUrls });
            const urls = await client.getEnvironmentUrls();

            expect(urls).toEqual(envUrls);
        });
    });

    describe("baseUrl override", () => {
        it("overrides all four fields since all generated clients use baseUrl ?? env.<field>", async () => {
            const client = makeClient({ ...CC_AUTH, environment: "eu", baseUrl: "https://proxy.example.com" });
            const urls = await client.getEnvironmentUrls();

            expect(urls.base).toBe("https://proxy.example.com");
            expect(urls.wss).toBe("https://proxy.example.com");
            expect(urls.login).toBe("https://proxy.example.com");
            expect(urls.agents).toBe("https://proxy.example.com");
        });

        it("without an environment, base and wss reflect the baseUrl", async () => {
            const client = makeClient({ ...BEARER_AUTH, baseUrl: "https://proxy.example.com" });
            const urls = await client.getEnvironmentUrls();

            expect(urls.base).toBe("https://proxy.example.com");
            expect(urls.wss).toBe("https://proxy.example.com");
        });
    });
});
