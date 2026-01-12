import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, getValidTemplateKeyAndLanguage, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.templates.get", () => {
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

    it("should successfully retrieve an existing template without errors or warnings", async () => {
        expect.assertions(2);

        const templateData = await getValidTemplateKeyAndLanguage(cortiClient);

        const result = await cortiClient.templates.get(templateData.templateKey);

        expect(result.key).toBe(templateData.templateKey);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should return template with section defaultFormatRule", () => {
        it("should return section with defaultFormatRule field", async () => {
            expect.assertions(3);

            const templateData = await getValidTemplateKeyAndLanguage(cortiClient);

            const result = await cortiClient.templates.get(templateData.templateKey);
            const section = result.templateSections[0]?.section;

            expect(section).toBeDefined();
            expect("defaultFormatRule" in section || section.defaultFormatRule === undefined).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return defaultFormatRule with name field if present", async () => {
            expect.assertions(2);

            const templateData = await getValidTemplateKeyAndLanguage(cortiClient);

            const result = await cortiClient.templates.get(templateData.templateKey);
            const section = result.templateSections[0]?.section;

            if (section.defaultFormatRule) {
                expect("name" in section.defaultFormatRule).toBe(true);
            } else {
                expect(section.defaultFormatRule).toBeUndefined();
            }
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when template key does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.templates.get(faker.lorem.word())).rejects.toThrow("Status code: 500");
        });
    });
});
