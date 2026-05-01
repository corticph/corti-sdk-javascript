import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestAgent, createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.list", () => {
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

    describe("should list agents with only required values", () => {
        it("should return created agent in list without errors or warnings", async () => {
            expect.assertions(2);

            await createTestAgent(cortiClient);

            const result = await cortiClient.agents.list();

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should return list with optional parameters", () => {
        it("should return list with limit parameter without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                limit: faker.number.int({ min: 1, max: 10 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return list with offset parameter without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                offset: faker.number.int({ min: 0, max: 10 }),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return list with ephemeral false without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                ephemeral: false,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return list with ephemeral true without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                ephemeral: true,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return list with all optional parameters without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.agents.list({
                limit: faker.number.int({ min: 1, max: 10 }),
                offset: faker.number.int({ min: 0, max: 10 }),
                ephemeral: false,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
