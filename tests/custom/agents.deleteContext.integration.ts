import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestAgent, createTestCortiClient, sendTestMessage, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.deleteContext", () => {
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

    // FIXME: re-enable when DELETE /agents/{id}/v1/contexts/{contextId} stops returning 403.
    // create + messageSend succeed; context delete is forbidden for this credential (including invalid IDs).
    // Spec: 204 / 400 / 401 / 404 — 403 is not documented.
    describe.skip("should delete context with only required values", () => {
        it("should successfully delete an existing context without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            const result = await cortiClient.agents.deleteContext(agent.id, contextId);

            expect(result).toBeUndefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    // FIXME: same 403 as the required-values deleteContext tests above.
    describe.skip("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            await expect(cortiClient.agents.deleteContext("invalid-uuid", contextId)).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when context ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(cortiClient.agents.deleteContext(agent.id, "invalid-uuid")).rejects.toThrow(
                "Status code: 400",
            );
        });

        // FIXME: re-enable when agents team fixes the regression where the endpoint stopped validating the agent ID
        it.skip("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            await expect(cortiClient.agents.deleteContext(faker.string.uuid(), contextId)).rejects.toThrow(
                "Status code: 404",
            );
        });

        it("should throw error when context ID does not exist", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(cortiClient.agents.deleteContext(agent.id, faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
