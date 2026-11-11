import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.sections.impact", () => {
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

    describe("should get section impact with only required values", () => {
        it("should return empty templates and sections for a new section without errors or warnings", async () => {
            expect.assertions(5);

            const section = await cortiClient.documents.sections.create({
                name: faker.lorem.words(3),
                generation: {
                    heading: faker.lorem.words(2),
                    instructions: {
                        contentPrompt: faker.lorem.sentence(),
                    },
                    outputSchema: {
                        type: "string",
                    },
                },
            });

            const result = await cortiClient.documents.sections.impact(section.id);

            expect(result.templates.items).toEqual([]);
            expect(result.templates.truncated).toBe(false);
            expect(result.sections.items).toEqual([]);
            expect(result.sections.truncated).toBe(false);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when section ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.documents.sections.impact(faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
