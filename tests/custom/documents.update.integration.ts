import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import {
    cleanupInteractions,
    createTestCortiClient,
    createTestDocument,
    createTestInteraction,
    getValidSectionKeys,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.documents.update", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    let createdInteractionIds: string[] = [];
    let validSectionKeys: string[] = [];

    beforeAll(async () => {
        cortiClient = createTestCortiClient();
        validSectionKeys = await getValidSectionKeys(cortiClient);
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
        createdInteractionIds = [];
    });

    afterEach(async () => {
        consoleWarnSpy.mockRestore();
        await cleanupInteractions(cortiClient, createdInteractionIds);
        createdInteractionIds = [];
    });

    describe("should update document with only required values", () => {
        it("should update document with empty request without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.update(interactionId, documentId, {});

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should update document with all optional values", () => {
        it("should update document with name without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.update(interactionId, documentId, {
                name: faker.lorem.words(3),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update document with sections without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.update(interactionId, documentId, {
                sections: [
                    {
                        key: faker.helpers.arrayElement(validSectionKeys),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update document with all optional parameters combined without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.update(interactionId, documentId, {
                name: faker.lorem.words(4),
                sections: [
                    {
                        key: faker.helpers.arrayElement(validSectionKeys),
                        name: faker.lorem.words(3),
                        text: faker.lorem.paragraphs(2),
                        sort: 0,
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should update document with section variations", () => {
        it("should update document with section containing all optional fields without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.update(interactionId, documentId, {
                sections: [
                    {
                        key: faker.helpers.arrayElement(validSectionKeys),
                        name: faker.lorem.words(3),
                        text: faker.lorem.paragraphs(3),
                        sort: 0,
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update document with empty sections array without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.update(interactionId, documentId, {
                sections: [],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update document with multiple sections without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.documents.update(interactionId, documentId, {
                sections: [
                    {
                        key: faker.helpers.arrayElement(validSectionKeys),
                        name: faker.lorem.words(2),
                    },
                    {
                        key: faker.helpers.arrayElement(validSectionKeys),
                        text: faker.lorem.paragraph(),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is missing", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.documents.update(undefined as any, faker.string.uuid(), {}),
            ).rejects.toThrow();
        });

        it("should throw error when document ID is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.documents.update(interactionId, undefined as any, {}),
            ).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            await expect(
                cortiClient.documents.update("invalid-uuid", documentId, {
                    name: faker.lorem.words(3),
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when document ID is invalid", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.documents.update(interactionId, "invalid-uuid", {
                    name: faker.lorem.words(3),
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            await expect(
                cortiClient.documents.update(faker.string.uuid(), documentId, {
                    name: faker.lorem.words(3),
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it("should throw error when document ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.documents.update(interactionId, faker.string.uuid(), {
                    name: faker.lorem.words(3),
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it("should throw error when section key is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            await expect(
                cortiClient.documents.update(interactionId, documentId, {
                    sections: [
                        {
                            name: faker.lorem.words(2),
                            text: faker.lorem.paragraph(),
                        },
                    ],
                } as any),
            ).rejects.toThrow('Missing required key "key"');
        });
    });
});
