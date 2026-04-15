import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

// Type extension to include getAuthHeaders method
type CortiClientWithAuth = CortiClient & {
    getAuthHeaders(): Promise<Headers>;
};

describe("cortiClient.getAuthHeaders", () => {
    let cortiClient: CortiClientWithAuth;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;

    beforeAll(() => {
        cortiClient = createTestCortiClient() as CortiClientWithAuth;
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    describe("should return headers with authentication", () => {
        it("should return headers with Bearer token and tenant name without errors or warnings", async () => {
            expect.assertions(4);

            const headers = await cortiClient.getAuthHeaders();

            expect(headers).toBeInstanceOf(Headers);
            expect(headers.get("Authorization")).toBeTruthy();
            expect(headers.get("Tenant-Name")).toBe(process.env.CORTI_TENANT_NAME);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("return value structure", () => {
        it("should return a Headers instance with correct structure", async () => {
            expect.assertions(4);

            const headers = await cortiClient.getAuthHeaders();

            expect(headers).toBeInstanceOf(Headers);
            const headerKeys = Array.from(headers.keys());
            expect(headerKeys).toHaveLength(2);
            expect(headerKeys).toContain("authorization");
            expect(headerKeys).toContain("tenant-name");
        });

        it("should return Bearer token in Authorization header", async () => {
            expect.assertions(2);

            const headers = await cortiClient.getAuthHeaders();

            const authHeader = headers.get("Authorization");
            expect(authHeader).toBeTruthy();
            expect(authHeader?.startsWith("Bearer ")).toBe(true);
        });
    });
});
