import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestAgent, createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.update", () => {
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

    describe("should update agent with only required values", () => {
        it("should update agent with empty body without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.update(agent.id, {});

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should update agent with all optional values", () => {
        it("should update agent with name without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.update(agent.id, {
                name: faker.lorem.words(3),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update agent with description without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.update(agent.id, {
                description: faker.lorem.sentence(),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update agent with systemPrompt without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.update(agent.id, {
                systemPrompt: faker.lorem.paragraph(),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update agent with inline expert without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.update(agent.id, {
                experts: [
                    {
                        type: "new",
                        name: faker.string.alphanumeric(10),
                        description: faker.lorem.sentence(),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update agent with all optional parameters without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.update(agent.id, {
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                systemPrompt: faker.lorem.paragraph(),
                experts: [],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when agent ID is missing", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.update(undefined as any, {})).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.update("invalid-uuid", {})).rejects.toThrow("Status code: 400");
        });

        it("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.update(faker.string.uuid(), {})).rejects.toThrow("Status code: 404");
        });
    });
});
