import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import {
    cleanupAgents,
    createTestAgent,
    createTestCortiClient,
    sendTestMessage,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.agents.getTask", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    let createdAgentIds: string[] = [];

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
        createdAgentIds = [];
    });

    afterEach(async () => {
        consoleWarnSpy.mockRestore();
        await cleanupAgents(cortiClient, createdAgentIds);
        createdAgentIds = [];
    });

    describe("should retrieve task with only required values", () => {
        it("should successfully retrieve a task without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient, createdAgentIds);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const taskId = messageResponse.task?.id;

            if (!taskId) {
                throw new Error("No task ID returned from message send");
            }

            const result = await cortiClient.agents.getTask(agent.id, taskId);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should retrieve task with optional parameters", () => {
        it("should retrieve task with historyLength parameter without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient, createdAgentIds);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const taskId = messageResponse.task?.id;

            if (!taskId) {
                throw new Error("No task ID returned from message send");
            }

            const result = await cortiClient.agents.getTask(agent.id, taskId, {
                historyLength: faker.number.int({ min: 1, max: 100 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when agent ID is missing", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.getTask(undefined as any, faker.string.uuid())).rejects.toThrow();
        });

        it("should throw error when task ID is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(cortiClient.agents.getTask(agent.id, undefined as any)).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        // FIXME: re-enable when validation is implemented
        it.skip("should throw error when agent ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const taskId = messageResponse.task?.id;

            if (!taskId) {
                throw new Error("No task ID returned from message send");
            }

            await expect(cortiClient.agents.getTask("invalid-uuid", taskId)).rejects.toThrow("Status code: 400");
        });

        it("should throw error when task ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(cortiClient.agents.getTask(agent.id, "invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        // FIXME: re-enable when proper error handling is implemented
        it.skip("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const taskId = messageResponse.task?.id;

            if (!taskId) {
                throw new Error("No task ID returned from message send");
            }

            await expect(cortiClient.agents.getTask(faker.string.uuid(), taskId)).rejects.toThrow("Status code: 404");
        });

        it("should throw error when task ID does not exist", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(cortiClient.agents.getTask(agent.id, faker.string.uuid())).rejects.toThrow("Status code: 404");
        });
    });
});
