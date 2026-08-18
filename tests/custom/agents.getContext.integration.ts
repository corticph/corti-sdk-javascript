import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestAgent, createTestCortiClient, sendTestMessage, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.getContext", () => {
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

    // FIXME: re-enable when GET /agents/{id}/v1/contexts/{contextId} stops returning 403.
    // create + messageSend succeed; context read is forbidden for this credential (including invalid IDs).
    // Spec: 200 / 400 / 401 / 404 — 403 is not documented.
    describe.skip("should retrieve context with only required values", () => {
        it("should successfully retrieve a context without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            const result = await cortiClient.agents.getContext(agent.id, contextId);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    // FIXME: same 403 as the required-values getContext tests above.
    describe.skip("should retrieve context with optional parameters", () => {
        it("should retrieve context with limit parameter without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            const result = await cortiClient.agents.getContext(agent.id, contextId, {
                limit: faker.number.int({ min: 1, max: 100 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should retrieve context with offset parameter without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            const result = await cortiClient.agents.getContext(agent.id, contextId, {
                offset: faker.number.int({ min: 0, max: 100 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should retrieve context with all optional parameters without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            const result = await cortiClient.agents.getContext(agent.id, contextId, {
                limit: faker.number.int({ min: 1, max: 100 }),
                offset: faker.number.int({ min: 0, max: 100 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when agent ID is missing", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.getContext(undefined as any, faker.string.uuid())).rejects.toThrow();
        });

        it("should throw error when context ID is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(cortiClient.agents.getContext(agent.id, undefined as any)).rejects.toThrow();
        });
    });

    // FIXME: same 403 as the required-values getContext tests above.
    describe.skip("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            await expect(cortiClient.agents.getContext("invalid-uuid", contextId)).rejects.toThrow("Status code: 400");
        });

        it("should throw error when context ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(cortiClient.agents.getContext(agent.id, "invalid-uuid")).rejects.toThrow("Status code: 400");
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

            await expect(cortiClient.agents.getContext(faker.string.uuid(), contextId)).rejects.toThrow(
                "Status code: 404",
            );
        });

        it("should throw error when context ID does not exist", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(cortiClient.agents.getContext(agent.id, faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
