import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.getRegistryExperts", () => {
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

    describe("should retrieve registry experts with only required values", () => {
        it("should return registry experts without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.getRegistryExperts();

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should retrieve registry experts with optional parameters", () => {
        it("should return registry experts with limit parameter without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.getRegistryExperts({
                limit: faker.number.int({ min: 1, max: 100 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return registry experts with offset parameter without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.getRegistryExperts({
                offset: faker.number.int({ min: 0, max: 100 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return registry experts with all optional parameters without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.getRegistryExperts({
                limit: faker.number.int({ min: 1, max: 100 }),
                offset: faker.number.int({ min: 0, max: 100 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
