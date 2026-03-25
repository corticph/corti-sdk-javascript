import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, createTestDocument, createTestInteraction, cleanupInteractions, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.codes.predict", () => {
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

    describe("should predict codes with only required values", () => {
        it("should predict codes with text context without errors or warnings", async () => {
            expect.assertions(4);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm"],
                context: [
                    {
                        type: "text",
                        text: faker.lorem.sentence(),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(result.codes).toBeDefined();
            expect(Array.isArray(result.codes)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should predict codes with all optional parameters", () => {
        it("should predict codes with maxCandidates without errors or warnings", async () => {
            expect.assertions(5);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm"],
                context: [
                    {
                        type: "text",
                        text: faker.lorem.sentence(),
                    },
                ],
                maxCandidates: faker.number.int({ min: 1, max: 10 }),
            });

            expect(result).toBeDefined();
            expect(result.codes).toBeDefined();
            expect(result.candidates).toBeDefined();
            expect(Array.isArray(result.candidates)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should predict codes with all system enum values", () => {
        it("should predict codes with system icd10cm without errors or warnings", async () => {
            expect.assertions(4);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(result.codes).toBeDefined();
            expect(result.candidates).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system icd10pcs without errors or warnings", async () => {
            expect.assertions(4);

            const result = await cortiClient.codes.predict({
                system: ["icd10pcs"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(result.codes).toBeDefined();
            expect(result.candidates).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system cpt without errors or warnings", async () => {
            expect.assertions(4);

            const result = await cortiClient.codes.predict({
                system: ["cpt"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(result.codes).toBeDefined();
            expect(result.candidates).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should predict codes with documentId context", () => {
        const createdInteractionIds: string[] = [];

        afterEach(async () => {
            await cleanupInteractions(cortiClient, createdInteractionIds);
            createdInteractionIds.length = 0;
        });

        it("should predict codes when context is documentId without errors or warnings", async () => {
            expect.assertions(4);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm"],
                context: [
                    {
                        type: "documentId",
                        documentId,
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(result.codes).toBeDefined();
            expect(Array.isArray(result.codes)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should return response with expected shape", () => {
        it("should return codes and candidates arrays", async () => {
            expect.assertions(4);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toHaveProperty("codes");
            expect(result).toHaveProperty("candidates");
            expect(Array.isArray(result.codes)).toBe(true);
            expect(Array.isArray(result.candidates)).toBe(true);
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when system is missing", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    context: [{ type: "text", text: faker.lorem.sentence() }],
                } as any),
            ).rejects.toThrow();
        });

        // FIXME: doesn't throw error when context is empty array, but it should
        it.skip("should throw error when context is missing", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    system: ["icd10cm"],
                    context: [],
                }),
            ).rejects.toThrow();
        });

        it("should throw error when text is missing in text context", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    system: ["icd10cm"],
                    context: [{ type: "text" }] as any,
                }),
            ).rejects.toThrow();
        });

        it("should throw error when documentId is missing in documentId context", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    system: ["icd10cm"],
                    context: [{ type: "documentId" }] as any,
                }),
            ).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when system is empty", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    system: [],
                    context: [{ type: "text", text: faker.lorem.sentence() }],
                } as any),
            ).rejects.toThrow();
        });

        it("should throw error when documentId does not exist", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    system: ["icd10cm"],
                    context: [
                        {
                            type: "documentId",
                            documentId: faker.string.uuid(),
                        },
                    ],
                }),
            ).rejects.toThrow();
        });
    });
});
