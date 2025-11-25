import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, createTestAgent, cleanupAgents, setupConsoleWarnSpy } from "./testUtils";

// FIXME : Skipping until update agent functionality is restored
describe.skip("cortiClient.agents.update", () => {
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

    describe("should update agent with minimal fields", () => {
        it("should update agent with only name without errors or warnings", async () => {
            expect.assertions(4);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            const newName = faker.lorem.words(3);

            const result = await cortiClient.agents.update(agent.id, {
                id: agent.id,
                name: newName,
                description: agent.description,
                systemPrompt: agent.systemPrompt,
            });

            expect(result).toBeDefined();
            expect(result.name).toBe(newName);
            expect(result.name).not.toBe(agent.name);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update agent with only description without errors or warnings", async () => {
            expect.assertions(4);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            const newDescription = faker.lorem.sentence();

            const result = await cortiClient.agents.update(agent.id, {
                id: agent.id,
                name: agent.name,
                description: newDescription,
                systemPrompt: agent.systemPrompt,
            });

            expect(result).toBeDefined();
            expect(result.description).toBe(newDescription);
            expect(result.description).not.toBe(agent.description);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update agent with only systemPrompt without errors or warnings", async () => {
            expect.assertions(3);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            const newSystemPrompt = faker.lorem.paragraph();

            const result = await cortiClient.agents.update(agent.id, {
                id: agent.id,
                name: agent.name,
                description: agent.description,
                systemPrompt: newSystemPrompt,
            });

            expect(result).toBeDefined();
            expect(result.systemPrompt).toBe(newSystemPrompt);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    it("should update agent with all possible parameters without errors or warnings", async () => {
        expect.assertions(6);

        const agent = await createTestAgent(cortiClient, createdAgentIds);

        const newName = faker.lorem.words(4);
        const newDescription = faker.lorem.sentence();
        const newSystemPrompt = faker.lorem.paragraph();

        const result = await cortiClient.agents.update(agent.id, {
            id: agent.id,
            name: newName,
            description: newDescription,
            systemPrompt: newSystemPrompt,
        });

        expect(result).toBeDefined();
        expect(result.name).toBe(newName);
        expect(result.name).not.toBe(agent.name);
        expect(result.description).toBe(newDescription);
        expect(result.description).not.toBe(agent.description);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(
                cortiClient.agents.update("invalid-uuid", {
                    id: agent.id,
                    name: agent.name,
                    description: agent.description,
                    systemPrompt: agent.systemPrompt,
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(
                cortiClient.agents.update(faker.string.uuid(), {
                    id: agent.id,
                    name: agent.name,
                    description: agent.description,
                    systemPrompt: agent.systemPrompt,
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it("should throw error when id is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(
                cortiClient.agents.update(agent.id, {
                    name: agent.name,
                    description: agent.description,
                    systemPrompt: agent.systemPrompt,
                } as any),
            ).rejects.toThrow('Missing required key "id"');
        });

        it("should throw error when name is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(
                cortiClient.agents.update(agent.id, {
                    id: agent.id,
                    description: agent.description,
                    systemPrompt: agent.systemPrompt,
                } as any),
            ).rejects.toThrow('Missing required key "name"');
        });

        it("should throw error when description is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(
                cortiClient.agents.update(agent.id, {
                    id: agent.id,
                    name: agent.name,
                    systemPrompt: agent.systemPrompt,
                } as any),
            ).rejects.toThrow('Missing required key "description"');
        });

        it("should throw error when systemPrompt is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient, createdAgentIds);

            await expect(
                cortiClient.agents.update(agent.id, {
                    id: agent.id,
                    name: agent.name,
                    description: agent.description,
                } as any),
            ).rejects.toThrow('Missing required key "systemPrompt"');
        });
    });
});
