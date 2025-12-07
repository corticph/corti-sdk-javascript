import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import {
    createTestCortiClient,
    createTestAgent,
    cleanupAgents,
    setupConsoleWarnSpy,
    sendTestMessage,
} from "./testUtils";

describe("cortiClient.agents.getContext", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: jest.SpyInstance;
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

    it("should successfully retrieve a context without errors or warnings", async () => {
        expect.assertions(2);

        const agent = await createTestAgent(cortiClient, createdAgentIds);
        const messageResponse = await sendTestMessage(cortiClient, agent.id);
        const contextId = messageResponse.task?.contextId;

        if (!contextId) {
            throw new Error("No context ID returned from message send");
        }

        const result = await cortiClient.agents.getContext(agent.id, contextId);

        expect(result).toBeDefined();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should retrieve context with limit parameter without errors or warnings", async () => {
        expect.assertions(2);

        const agent = await createTestAgent(cortiClient, createdAgentIds);
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

        const agent = await createTestAgent(cortiClient, createdAgentIds);
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

        const agent = await createTestAgent(cortiClient, createdAgentIds);
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

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);
            const messageResponse = await sendTestMessage(cortiClient, agent.id);
            const contextId = messageResponse.task?.contextId;

            if (!contextId) {
                throw new Error("No context ID returned from message send");
            }

            await expect(cortiClient.agents.getContext("invalid-uuid", contextId)).rejects.toThrow("Status code: 400");
        });

        it("should throw error when context ID is invalid format", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(cortiClient.agents.getContext(agent.id, "invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);
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

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(cortiClient.agents.getContext(agent.id, faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
