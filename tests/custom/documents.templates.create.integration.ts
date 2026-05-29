import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.templates.create", () => {
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

    describe("should create guided template with only required values", () => {
        it("should create template from scratch without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.documents.templates.create({
                name: faker.lorem.words(3),
                generation: {
                    instructions: {
                        prompt: faker.lorem.sentence(),
                    },
                },
            });

            expect(result.id).toBeDefined();
            expect(result.name).toBeDefined();
            createdTemplateIds.push(result.id);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should create guided template with all optional values", () => {
        it("should create template with metadata fields without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.documents.templates.create({
                name: faker.lorem.words(3),
                description: faker.lorem.sentence(),
                languages: ["en"],
                regions: ["USA"],
                specialties: ["general"],
                labels: [{ key: "integration-test", value: "true" }],
                publish: true,
                generation: {
                    instructions: {
                        prompt: faker.lorem.sentence(),
                    },
                },
            });

            expect(result.id).toBeDefined();
            createdTemplateIds.push(result.id);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
