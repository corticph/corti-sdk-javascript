import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.getCardUrl", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    describe("should return correct URL for agent card", () => {
        it("should return a valid URL instance without errors or warnings", async () => {
            expect.assertions(4);

            const agentId = "test-agent-123";

            const url = await cortiClient.agents.getCardUrl(agentId);

            expect(url).toBeInstanceOf(URL);
            expect(url.toString()).toContain(`/agents/${agentId}/agent-card.json`);
            expect(url.toString()).toContain(process.env.CORTI_ENVIRONMENT);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should handle different agent IDs correctly", async () => {
            expect.assertions(7);

            const agentIds = ["agent-1", "550e8400-e29b-41d4-a716-446655440000", "my-custom-agent"];

            for (const agentId of agentIds) {
                const url = await cortiClient.agents.getCardUrl(agentId);

                expect(url).toBeInstanceOf(URL);
                expect(url.toString()).toContain(`/agents/${agentId}/agent-card.json`);
            }

            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("URL structure", () => {
        it("should return URL with correct path structure", async () => {
            expect.assertions(3);

            const agentId = "test-agent";

            const url = await cortiClient.agents.getCardUrl(agentId);

            expect(url).toBeInstanceOf(URL);
            expect(url.pathname).toBe(`/agents/${agentId}/agent-card.json`);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
