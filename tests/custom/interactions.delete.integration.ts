import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, createTestInteraction, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.interactions.delete", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: jest.SpyInstance;

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    it("should successfully delete an existing interaction without errors or warnings", async () => {
        expect.assertions(2);

        const createdInteractionIds: string[] = [];
        const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

        const result = await cortiClient.interactions.delete(interactionId);

        expect(result).toBeUndefined();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.interactions.delete("invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.interactions.delete(faker.string.uuid())).rejects.toThrow("Status code: 404");
        });
    });
});
