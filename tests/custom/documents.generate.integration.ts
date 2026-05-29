import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.generate", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    const createdTemplateIds: string[] = [];

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(async () => {
        consoleWarnSpy.mockRestore();

        await Promise.allSettled(
            createdTemplateIds.splice(0).map((templateId) => cortiClient.documents.templates.delete(templateId)),
        );
    });

    describe("should generate guided document with templateRef and only required values", () => {
        it("should generate document using stored template and text context without errors or warnings", async () => {
            expect.assertions(3);

            const template = await cortiClient.documents.templates.create({
                name: faker.lorem.words(3),
                generation: {
                    instructions: {
                        prompt: faker.lorem.sentence(),
                    },
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
