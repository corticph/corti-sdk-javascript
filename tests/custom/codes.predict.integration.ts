import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import {
    cleanupInteractions,
    createTestCortiClient,
    createTestDocument,
    createTestInteraction,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.codes.predict", () => {
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

    describe("should predict codes with only required values", () => {
        it("should predict codes with text context without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient"],
                context: [
                    {
                        type: "text",
                        text: faker.lorem.sentence(),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should predict codes with all optional parameters", () => {
        it("should predict codes with filter.include without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
                filter: {
                    include: ["E11"],
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with filter.exclude without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
                filter: {
                    exclude: ["Z00"],
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with filter.expand without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
                filter: {
                    expand: true,
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with all filter params combined without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
                filter: {
                    include: ["E11"],
                    exclude: ["E11.9"],
                    expand: true,
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should predict codes with all system enum values", () => {
        it("should predict codes with system icd10cm-outpatient without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system icd10cm-inpatient without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-inpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system icd10pcs without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10pcs"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system cpt without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["cpt"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system icd10int-outpatient without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10int-outpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system icd10int-inpatient without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10int-inpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system icd10uk-outpatient without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10uk-outpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with system icd10uk-inpatient without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10uk-inpatient"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should predict codes with multiple systems without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient", "cpt"],
                context: [{ type: "text", text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
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
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const documentId = await createTestDocument(cortiClient, interactionId);

            const result = await cortiClient.codes.predict({
                system: ["icd10cm-outpatient"],
                context: [
                    {
                        type: "documentId",
                        documentId,
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
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
                    system: ["icd10cm-outpatient"],
                    context: [],
                }),
            ).rejects.toThrow();
        });

        it("should throw error when text is missing in text context", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    system: ["icd10cm-outpatient"],
                    context: [{ type: "text" }] as any,
                }),
            ).rejects.toThrow();
        });

        it("should throw error when documentId is missing in documentId context", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.codes.predict({
                    system: ["icd10cm-outpatient"],
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
                    system: ["icd10cm-outpatient"],
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
