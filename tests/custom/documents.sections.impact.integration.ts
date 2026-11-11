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
        // FIXME: gateway returns 403 (empty body) — `GET /documents/sections/:sectionID/impact` is missing from the
        // `guided_templates_sections:read` endpoints in deployments authorization-service config. Re-enable once added.
        it.skip("should return empty templates and sections for a new section without errors or warnings", async () => {
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
        // FIXME: gateway returns 403 (empty body) — `GET /documents/sections/:sectionID/impact` is missing from the
        // `guided_templates_sections:read` endpoints in deployments authorization-service config. Re-enable once added.
        it.skip("should throw error when section ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.documents.sections.impact(faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
