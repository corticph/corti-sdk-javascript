import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestAgent, createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.getCard", () => {
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

    describe("should retrieve agent card with only required values", () => {
        it("should successfully retrieve an agent card without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.getCard(agent.id);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when agent ID is missing", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.getCard(undefined as any)).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.getCard("invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.agents.getCard(faker.string.uuid())).rejects.toThrow("Status code: 404");
        });
    });
});
