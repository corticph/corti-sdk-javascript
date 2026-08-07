import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agentic.agents.getCardUrl", () => {
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

            const agentId = "agt.0192f4c8-2c5a-7b3e-9f1a-3c8d6e2b7a40";

            const url = await cortiClient.agentic.agents.getCardUrl(agentId);

            expect(url).toBeInstanceOf(URL);
            expect(url.toString()).toContain(`/v2/agentic/agents/${agentId}/.well-known/agent-card.json`);
            expect(url.toString()).toContain(process.env.CORTI_ENVIRONMENT);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should handle different agent IDs correctly", async () => {
            expect.assertions(7);

            const agentIds = [
                "agt.0192f4c8-2c5a-7b3e-9f1a-3c8d6e2b7a40",
                "550e8400-e29b-41d4-a716-446655440000",
                "my-custom-agent",
            ];

            for (const agentId of agentIds) {
                const url = await cortiClient.agentic.agents.getCardUrl(agentId);

                expect(url).toBeInstanceOf(URL);
                expect(url.pathname).toBe(`/v2/agentic/agents/${agentId}/.well-known/agent-card.json`);
            }

            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
