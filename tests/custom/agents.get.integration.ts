import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, createTestAgent, cleanupAgents, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.get", () => {
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

    it("should successfully retrieve an existing agent without errors or warnings", async () => {
        expect.assertions(2);

        const agent = await createTestAgent(cortiClient, createdAgentIds);

        const result = await cortiClient.agents.get(agent.id);

        expect(result.id).toBe(agent.id);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.get("invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.get(faker.string.uuid())).rejects.toThrow("Status code: 404");
        });
    });
});
