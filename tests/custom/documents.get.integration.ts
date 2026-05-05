import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, createTestDocument, createTestInteraction, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.get", () => {
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

    describe("should retrieve document with only required values", () => {
        it("should successfully retrieve an existing document without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.get(interactionId, documentId);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is missing", async () => {
            expect.assertions(1);

            await expect(cortiClient.documents.get(undefined as any, faker.string.uuid())).rejects.toThrow();
        });

        it("should throw error when document ID is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.documents.get(interactionId, undefined as any)).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.documents.get("invalid-uuid", faker.string.uuid())).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when document ID is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.documents.get(interactionId, "invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.documents.get(faker.string.uuid(), faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });

        it("should throw error when document ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.documents.get(interactionId, faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
