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

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when template key does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.templates.get(faker.lorem.word())).rejects.toThrow("Status code: 500");
        });
    });
});
