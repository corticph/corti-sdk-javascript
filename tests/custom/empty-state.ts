import type { CortiClient } from "../../src";
import { createTestCortiClient, purgeIntegrationTenant, setupConsoleWarnSpy } from "./testUtils";

describe("tenant empty state (after purge)", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;

    beforeAll(async () => {
        cortiClient = createTestCortiClient();
        await purgeIntegrationTenant(cortiClient);
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    it("should return empty agents list when tenant has no agents", async () => {
        expect.assertions(2);

        const agents = await cortiClient.agents.list();

        expect(agents).toHaveLength(0);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should have no interactions across all pages when tenant is purged", async () => {
        expect.assertions(2);

        const page = await cortiClient.interactions.list();
        const seen: string[] = [];

        for await (const row of page) {
            seen.push(row.id);
        }

        expect(seen).toEqual([]);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
});
