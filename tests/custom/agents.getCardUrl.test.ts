import { CortiClient } from "../../src/custom/CortiClient";

describe("cortiClient.agents.getCardUrl", () => {
    describe("with client credentials", () => {
        it("should return correct URL for agent card", async () => {
            const agentId = "test-agent-123";
            const mockTenantName = "test-tenant";

            const cortiClient = new CortiClient({
                environment: "eu",
                tenantName: mockTenantName,
                auth: {
                    clientId: "test-client-id",
                    clientSecret: "test-client-secret",
                },
            });

            const url = await cortiClient.agents.getCardUrl(agentId);

            expect(url).toBeInstanceOf(URL);
            expect(url.toString()).toBe(`https://api.eu.corti.app/agents/${agentId}/agent-card.json`);
        });

        it("should handle different agent IDs correctly", async () => {
            const agentIds = ["agent-1", "550e8400-e29b-41d4-a716-446655440000", "my-custom-agent"];

            const cortiClient = new CortiClient({
                environment: "us",
                tenantName: "prod-tenant",
                auth: {
                    clientId: "test-client-id",
                    clientSecret: "test-client-secret",
                },
            });

            for (const agentId of agentIds) {
                const url = await cortiClient.agents.getCardUrl(agentId);

                expect(url).toBeInstanceOf(URL);
                expect(url.toString()).toBe(`https://api.us.corti.app/agents/${agentId}/agent-card.json`);
            }
        });

        it("should work with dev environment", async () => {
            const agentId = "test-agent";

            const cortiClient = new CortiClient({
                environment: "dev-eu",
                tenantName: "dev-tenant",
                auth: {
                    clientId: "test-client-id",
                    clientSecret: "test-client-secret",
                },
            });

            const url = await cortiClient.agents.getCardUrl(agentId);

            expect(url).toBeInstanceOf(URL);
            expect(url.toString()).toBe(`https://api.dev-eu.corti.app/agents/${agentId}/agent-card.json`);
        });
    });

    describe("with bearer token", () => {
        it("should return correct URL for agent card", async () => {
            const agentId = "bearer-agent-456";

            // Helper function to create a mock JWT
            const createMockJWT = (environment: string, tenant: string, expiresInSeconds: number = 3600): string => {
                const header = { alg: "RS256", typ: "JWT" };
                const payload = {
                    iss: `https://keycloak.${environment}.corti.app/realms/${tenant}`,
                    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
                    iat: Math.floor(Date.now() / 1000),
                };

                const base64UrlEncode = (str: string) => {
                    return Buffer.from(str)
                        .toString("base64")
                        .replace(/\+/g, "-")
                        .replace(/\//g, "_")
                        .replace(/=/g, "");
                };

                const encodedHeader = base64UrlEncode(JSON.stringify(header));
                const encodedPayload = base64UrlEncode(JSON.stringify(payload));
                const signature = "mock-signature";

                return `${encodedHeader}.${encodedPayload}.${signature}`;
            };

            const mockAccessToken = createMockJWT("eu", "test-tenant");

            const cortiClient = new CortiClient({
                auth: {
                    accessToken: mockAccessToken,
                    refreshToken: "mock-refresh-token",
                },
            });

            const url = await cortiClient.agents.getCardUrl(agentId);

            expect(url).toBeInstanceOf(URL);
            expect(url.toString()).toContain(`/agents/${agentId}/agent-card.json`);
        });
    });

    describe("URL encoding", () => {
        it("should handle special characters in agent ID", async () => {
            const agentId = "agent with spaces";
            const cortiClient = new CortiClient({
                environment: "eu",
                tenantName: "test-tenant",
                auth: {
                    clientId: "test-client-id",
                    clientSecret: "test-client-secret",
                },
            });

            const url = await cortiClient.agents.getCardUrl(agentId);

            expect(url).toBeInstanceOf(URL);
            // The URL constructor should handle encoding
            expect(url.pathname).toContain("agent-card.json");
        });
    });
});
