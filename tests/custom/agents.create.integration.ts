import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.create", () => {
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

    describe("should create agent with only required values", () => {
        it("should create agent with only name and description without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
            });

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
                agentType: "orchestrator",
                experts: [],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should create agent with all agentType enum values", () => {
        it("should create agent with agentType expert without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                agentType: "expert",
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should create agent with agentType orchestrator without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                agentType: "orchestrator",
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should create agent with agentType interviewing-expert without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                agentType: "interviewing-expert",
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should create agent with experts", () => {
        it("should create agent with an expert reference by name without errors or warnings", async () => {
            const registry = await cortiClient.agents.getRegistryExperts({ limit: 1 });
            const expertName = registry.experts?.[0]?.name;
            if (!expertName) {
                console.warn("Skipping: no registry experts available");
                return;
            }
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                experts: [{ type: "reference", name: expertName }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should create agent with a new inline expert without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                experts: [
                    {
                        type: "new",
                        name: faker.string.alphanumeric(10),
                        description: faker.lorem.sentence(),
                        systemPrompt: faker.lorem.paragraph(),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when expert reference name does not exist in registry", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.agents.create({
                    name: faker.lorem.words(3),
                    description: faker.lorem.sentence(),
                    experts: [{ type: "reference", name: faker.string.alphanumeric(10) }],
                }),
            ).rejects.toThrow("Status code: 400");
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
