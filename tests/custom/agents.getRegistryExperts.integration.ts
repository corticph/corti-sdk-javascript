import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.getRegistryExperts", () => {
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

    it("should return registry experts without errors or warnings", async () => {
        expect.assertions(2);

        const result = await cortiClient.agents.getRegistryExperts();

        expect(result).toBeDefined();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

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
