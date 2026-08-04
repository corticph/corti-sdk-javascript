import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, createTestFacts, createTestInteraction, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.generate", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;

    beforeAll(async () => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    describe("should generate guided document with dynamicTemplate and only required values", () => {
        it("should generate document using inline template and text context without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.documents.generate({
                outputLanguage: "en",
                context: [
                    {
                        type: "text",
                        text: faker.lorem.paragraph(),
                    },
                ],
                dynamicTemplate: {
                    name: faker.lorem.words(3),
                    generation: {
                        instructions: {
                            prompt: "Produce a brief clinical summary from the supplied context.",
                        },
                        sections: [
                            {
                                heading: "Summary",
                                instructions: {
                                    contentPrompt: "Summarise the provided context in one short paragraph.",
                                },
                                outputSchema: {
                                    type: "string",
                                },
                            },
                        ],
                    },
                },
            });

            expect(result.document.outputLanguage).toBe("en");
            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should generate document with labels without errors or warnings", async () => {
            expect.assertions(3);

            const labelKey = faker.string.alphanumeric(8);
            const labelValue = faker.string.alphanumeric(8);

            const result = await cortiClient.documents.generate({
                outputLanguage: "en",
                labels: [{ key: labelKey, value: labelValue }],
                context: [
                    {
                        type: "text",
                        text: faker.lorem.paragraph(),
                    },
                ],
                dynamicTemplate: {
                    name: faker.lorem.words(3),
                    generation: {
                        instructions: {
                            prompt: "Produce a brief clinical summary from the supplied context.",
                        },
                        sections: [
                            {
                                heading: "Summary",
                                instructions: {
                                    contentPrompt: "Summarise the provided context in one short paragraph.",
                                },
                                outputSchema: {
                                    type: "string",
                                },
                            },
                        ],
                    },
                },
            });

            expect(result.document.labels).toEqual(expect.arrayContaining([{ key: labelKey, value: labelValue }]));
            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should generate guided document with templateRef and stored section", () => {
        it("should generate document using stored template reference without errors or warnings", async () => {
            expect.assertions(2);

            const section = await cortiClient.documents.sections.create({
                name: faker.lorem.words(3),
                generation: {
                    heading: "Summary",
                    instructions: {
                        contentPrompt: "Summarise the provided context in one short paragraph.",
                    },
                    outputSchema: {
                        type: "string",
                    },
                },
            });
            const template = await cortiClient.documents.templates.create({
                name: faker.lorem.words(3),
                generation: {
                    instructions: {
                        prompt: "Produce a brief clinical summary from the supplied context.",
                    },
                    sections: [{ sectionId: section.id }],
                },
            });
            const result = await cortiClient.documents.generate({
                outputLanguage: "en",
                templateRef: {
                    templateId: template.id,
                },
                context: [
                    {
                        type: "text",
                        text: faker.lorem.paragraph(),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should generate document using facts context array without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            await createTestFacts(cortiClient, interactionId, 2);
            const listedFacts = await cortiClient.facts.list(interactionId);

            const section = await cortiClient.documents.sections.create({
                name: faker.lorem.words(3),
                generation: {
                    heading: "Summary",
                    instructions: {
                        contentPrompt: "Summarise the provided facts in one short paragraph.",
                    },
                    outputSchema: {
                        type: "string",
                    },
                },
            });
            const template = await cortiClient.documents.templates.create({
                name: faker.lorem.words(3),
                generation: {
                    instructions: {
                        prompt: "Produce a brief clinical summary from the supplied facts.",
                    },
                    sections: [{ sectionId: section.id }],
                },
            });
            const result = await cortiClient.documents.generate({
                outputLanguage: "en",
                templateRef: {
                    templateId: template.id,
                },
                context: [
                    {
                        type: "facts",
                        facts: listedFacts.facts.flatMap((fact) =>
                            fact.text ? [{ text: fact.text, group: fact.group }] : [],
                        ),
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when facts array is missing in facts context", async () => {
            await expect(
                cortiClient.documents.generate({
                    outputLanguage: "en",
                    context: [
                        {
                            type: "facts",
                        } as any,
                    ],
                    dynamicTemplate: {
                        name: faker.lorem.words(3),
                        generation: {
                            sections: [
                                {
                                    heading: "Summary",
                                    instructions: {
                                        contentPrompt: "Summarise the provided context.",
                                    },
                                    outputSchema: {
                                        type: "string",
                                    },
                                },
                            ],
                        },
                    },
                }),
            ).rejects.toThrow('Missing required key "facts"');
        });
    });

    describe("should throw error when mutual exclusion rules are violated", () => {
        it("should throw error when no generation path is provided", async () => {
            await expect(
                cortiClient.documents.generate({
                    outputLanguage: "en",
                    context: [
                        {
                            type: "text",
                            text: faker.lorem.paragraph(),
                        },
                    ],
                }),
            ).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when template id does not exist", async () => {
            await expect(
                cortiClient.documents.generate({
                    outputLanguage: "en",
                    templateRef: {
                        templateId: faker.string.uuid(),
                    },
                    context: [
                        {
                            type: "text",
                            text: faker.lorem.paragraph(),
                        },
                    ],
                }),
            ).rejects.toThrow();
        });
    });
});
