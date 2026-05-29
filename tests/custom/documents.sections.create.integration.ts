import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.sections.create", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    const createdSectionIds: string[] = [];

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(async () => {
        consoleWarnSpy.mockRestore();

        await Promise.allSettled(
            createdSectionIds.splice(0).map((sectionId) => cortiClient.documents.sections.delete(sectionId)),
        );
    });

    describe("should create guided section with only required values", () => {
        it("should create section from scratch without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.documents.sections.create({
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

            expect(result.id).toBeDefined();
            expect(result.name).toBeDefined();
            createdSectionIds.push(result.id);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
