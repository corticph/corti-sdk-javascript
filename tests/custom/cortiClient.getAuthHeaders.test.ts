import * as core from "../../src/core/index";
import { CortiClient } from "../../src/custom/CortiClient";

// Type extension to include getAuthHeaders method
type CortiClientWithAuth = CortiClient & {
	getAuthHeaders(): Promise<Headers>;
};

// Helper function to create a mock JWT with proper structure
function createMockJWT(
	environment: string,
	tenant: string,
	expiresInSeconds: number = 3600,
): string {
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
}

describe("cortiClient.getAuthHeaders", () => {
	describe("with client credentials", () => {
		it("should return headers with Bearer token and tenant name", async () => {
			const mockToken = "mock-access-token-123";
			const mockTenantName = "test-tenant";

			const cortiClient = new CortiClient({
				environment: "https://api.test.corti.ai",
				tenantName: mockTenantName,
				auth: {
					clientId: "test-client-id",
					clientSecret: "test-client-secret",
				},
			}) as CortiClientWithAuth;

			// Mock the getToken method to return our mock token
			vi
				.spyOn(cortiClient["_options"].authProvider, "getAuthRequest")
				.mockResolvedValue({ headers: { Authorization: `Bearer ${mockToken}` } });

			const headers = await cortiClient.getAuthHeaders();

			expect(headers.get("Authorization")).toBe(`Bearer ${mockToken}`);
			expect(headers.get("Tenant-Name")).toBe(mockTenantName);
		});

		it("should handle supplier-based tenant name", async () => {
			const mockToken = "mock-access-token-456";
			const mockTenantName = "dynamic-tenant";

			const cortiClient = new CortiClient({
				environment: "https://api.test.corti.ai",
				tenantName: mockTenantName,
				auth: {
					clientId: "test-client-id",   
					clientSecret: "test-client-secret",
				},
			}) as CortiClientWithAuth;

			vi
				.spyOn(cortiClient["_options"].authProvider, "getAuthRequest")
				.mockResolvedValue({ headers: { Authorization: `Bearer ${mockToken}` } });

			const headers = await cortiClient.getAuthHeaders();

			expect(headers.get("Authorization")).toBe(`Bearer ${mockToken}`);
			expect(headers.get("Tenant-Name")).toBe(mockTenantName);
		});
	});

	describe("with bearer token", () => {
		it("should return headers with Bearer token and tenant name", async () => {
			const mockEnvironment = "test";
			const mockTenantName = "bearer-tenant";
			const mockAccessToken = createMockJWT(mockEnvironment, mockTenantName);
			const mockRefreshedToken = "refreshed-access-token";

			const cortiClient = new CortiClient({
				auth: {
					accessToken: mockAccessToken,
					refreshToken: "mock-refresh-token",
				},
			}) as CortiClientWithAuth;

			// Mock the getToken method to return our mock token
			vi
				.spyOn(cortiClient["_options"].authProvider, "getAuthRequest")
				.mockResolvedValue({ headers: { Authorization: `Bearer ${mockRefreshedToken}` } });

			const headers = await cortiClient.getAuthHeaders();

			expect(headers.get("Authorization")).toBe(`Bearer ${mockRefreshedToken}`);
			expect(headers.get("Tenant-Name")).toBe(mockTenantName);
		});

		it("should handle async token retrieval", async () => {
			const mockEnvironment = "test";
			const mockTenantName = "async-tenant";
			const mockAccessToken = "async-token";
			const initialToken = createMockJWT(mockEnvironment, mockTenantName);

			const cortiClient = new CortiClient({
				auth: {
					accessToken: initialToken,
				},
			}) as CortiClientWithAuth;

			// Mock getAuthRequest to simulate async behavior
			vi
				.spyOn(cortiClient["_options"].authProvider, "getAuthRequest")
				.mockImplementation(
					() =>
						new Promise((resolve) =>
							setTimeout(() => resolve({ headers: { Authorization: `Bearer ${mockAccessToken}` } }), 10),
						),
				);

			const headers = await cortiClient.getAuthHeaders();

			expect(headers.get("Authorization")).toBe(`Bearer ${mockAccessToken}`);
			expect(headers.get("Tenant-Name")).toBe(mockTenantName);
		});
	});

	describe("error handling", () => {
		it("should propagate token retrieval errors", async () => {
			const mockTenantName = "error-tenant";
			const tokenError = new Error("Failed to retrieve token");

			const cortiClient = new CortiClient({
				environment: "https://api.test.corti.ai",
				tenantName: mockTenantName,
				auth: {
					clientId: "test-client-id",
					clientSecret: "test-client-secret",
				},
			}) as CortiClientWithAuth;

			vi
				.spyOn(cortiClient["_options"].authProvider, "getAuthRequest")
				.mockRejectedValue(tokenError);

			await expect(cortiClient.getAuthHeaders()).rejects.toThrow(
				"Failed to retrieve token",
			);
		});
	});

	describe("return value structure", () => {
		it("should return a Headers instance", async () => {
			const mockEnvironment = "test";
			const mockTenantName = "test-tenant";
			const mockToken = createMockJWT(mockEnvironment, mockTenantName);

			const cortiClient = new CortiClient({
				auth: {
					accessToken: mockToken,
				},
			}) as CortiClientWithAuth;

			vi
				.spyOn(cortiClient["_options"].authProvider, "getAuthRequest")
				.mockResolvedValue({ headers: { Authorization: `Bearer ${mockToken}` } });

			const headers = await cortiClient.getAuthHeaders();

			expect(headers).toBeInstanceOf(Headers);
			expect(headers.get("Authorization")).toBeTruthy();
			expect(headers.get("Tenant-Name")).toBeTruthy();
		});

		it("should only contain Authorization and Tenant-Name headers", async () => {
			const mockEnvironment = "test";
			const mockTenantName = "test-tenant";
			const mockToken = createMockJWT(mockEnvironment, mockTenantName);

			const cortiClient = new CortiClient({
				auth: {
					accessToken: mockToken,
				},
			}) as CortiClientWithAuth;

			vi
				.spyOn(cortiClient["_options"].authProvider, "getAuthRequest")
				.mockResolvedValue({ headers: { Authorization: `Bearer ${mockToken}` } });

			const headers = await cortiClient.getAuthHeaders();

			const headerKeys = Array.from(headers.keys());
			expect(headerKeys).toHaveLength(2);
			expect(headerKeys).toContain("authorization");
			expect(headerKeys).toContain("tenant-name");
		});
	});
});
