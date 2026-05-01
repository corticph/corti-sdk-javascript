import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, createTestInteraction, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.interactions.get", () => {
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

    describe("should get interaction with only required values", () => {
        it("should successfully retrieve an existing interaction without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);

            const result = await cortiClient.interactions.get(interactionId);

            expect(result.id).toBe(interactionId);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is undefined", async () => {
            expect.assertions(1);

            await expect(cortiClient.interactions.get(undefined as any)).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.interactions.get("invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.interactions.get(faker.string.uuid())).rejects.toThrow("Status code: 404");
        });
    });
});
