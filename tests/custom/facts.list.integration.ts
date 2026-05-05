import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, createTestFacts, createTestInteraction, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.facts.list", () => {
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

    describe("should list facts with only required values", () => {
        it("should return empty list for interaction with no facts without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);

            const result = await cortiClient.facts.list(interactionId);

            expect(result.facts.length).toBe(0);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return facts for interaction with facts without errors or warnings", async () => {
            expect.assertions(3);

            const interactionId = await createTestInteraction(cortiClient);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.list(interactionId);

            expect(result.facts.length).toBeGreaterThan(0);
            expect(result.facts.some((fact) => fact.id === factIds[0])).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is missing", async () => {
            expect.assertions(1);

            await expect(cortiClient.facts.list(undefined as any)).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.facts.list("invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.facts.list(faker.string.uuid())).rejects.toThrow("Status code: 404");
        });
    });
});
