import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, cleanupAgents, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.create", () => {
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

    describe("should create agent with only required values", () => {
        it("should create agent with only name and description without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
            });

            createdAgentIds.push(result.id);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should create agent with all optional values", () => {
        it("should create agent with systemPrompt without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                systemPrompt: faker.lorem.paragraph(),
            });

            createdAgentIds.push(result.id);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should create agent with ephemeral set to true without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                ephemeral: true,
            });

            createdAgentIds.push(result.id);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should create agent with all optional parameters without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                systemPrompt: faker.lorem.paragraph(),
                ephemeral: false,
            });

            createdAgentIds.push(result.id);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should handle errors when required parameters are missing", () => {
        it("should throw error when name is missing", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.agents.create({
                    description: faker.lorem.sentence(),
                } as any),
            ).rejects.toThrow('Missing required key "name"');
        });

        it("should throw error when description is missing", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.agents.create({
                    name: faker.lorem.words(3),
                } as any),
            ).rejects.toThrow('Missing required key "description"');
        });
    });
});
