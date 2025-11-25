import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, createTestAgent, cleanupAgents, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.list", () => {
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

    // FIXME: re-enable when deletion issues are resolved
    it.skip("should return empty list when no agents exist", async () => {
        expect.assertions(2);

        const existingAgents = await cortiClient.agents.list();
        const agentIds: string[] = [];

        for (const agent of existingAgents) {
            if ("id" in agent && agent.id) {
                agentIds.push(agent.id);
            }
        }

        if (agentIds.length > 0) {
            await cleanupAgents(cortiClient, agentIds);
        }

        const result = await cortiClient.agents.list();

        expect(result.length).toBe(0);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("should return created agent in list", async () => {
        expect.assertions(3);

        const agent = await createTestAgent(cortiClient, createdAgentIds);

        const result = await cortiClient.agents.list();

        expect(result.length).toBeGreaterThan(0);
        expect(result.some((listAgent: any) => listAgent.id === agent.id)).toBe(true);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should return list with optional parameters", () => {
        it("should return list with limit parameter without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                limit: faker.number.int({ min: 1, max: 10 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return list with offset parameter without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                offset: faker.number.int({ min: 0, max: 10 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return list with ephemeral parameter without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                ephemeral: false,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return list with all optional parameters without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                limit: faker.number.int({ min: 1, max: 10 }),
                offset: faker.number.int({ min: 0, max: 10 }),
                ephemeral: false,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
