import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.templates.get", () => {
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

    describe("should get guided template with only required values", () => {
        it("should retrieve an existing template without errors or warnings", async () => {
            expect.assertions(3);

            const created = await cortiClient.documents.templates.create({
                name: faker.lorem.words(3),
                generation: {
                    instructions: {
                        prompt: faker.lorem.sentence(),
                    },
                },
            });

            const result = await cortiClient.documents.templates.get(created.id);

            expect(result.id).toBe(created.id);
            expect(result.name).toBe(created.name);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when template id does not exist", async () => {
            await expect(cortiClient.documents.templates.get(faker.string.uuid())).rejects.toThrow();
        });
    });
});
