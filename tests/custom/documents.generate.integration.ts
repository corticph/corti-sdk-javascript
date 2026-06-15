import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.generate", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    const createdTemplateIds: string[] = [];
    const createdSectionIds: string[] = [];

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(async () => {
        consoleWarnSpy.mockRestore();

        await Promise.allSettled([
            ...createdTemplateIds.splice(0).map((templateId) => cortiClient.documents.templates.delete(templateId)),
            ...createdSectionIds.splice(0).map((sectionId) => cortiClient.documents.sections.delete(sectionId)),
        ]);
    });

    describe("should generate guided document with dynamicTemplate and only required values", () => {
        it("should generate document using inline template and text context without errors or warnings", async () => {
            expect.assertions(2);

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
            createdSectionIds.push(section.id);

            const template = await cortiClient.documents.templates.create({
                name: faker.lorem.words(3),
                generation: {
                    instructions: {
                        prompt: "Produce a brief clinical summary from the supplied context.",
                    },
                    sections: [{ sectionId: section.id }],
                },
            });
            createdTemplateIds.push(template.id);

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
