import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import {
    createTestCortiClient,
    createTestFacts,
    createTestInteraction,
    getValidFactGroups,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.facts.update", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    let validFactGroups: string[] = [];

    beforeAll(async () => {
        cortiClient = createTestCortiClient();
        validFactGroups = await getValidFactGroups(cortiClient);
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    const getValidFactGroup = (): string => faker.helpers.arrayElement(validFactGroups);

    describe("should update fact with only required values", () => {
        it("should update fact with empty request without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, {});

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should update fact with all optional values", () => {
        it("should update fact with text without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, {
                text: faker.lorem.sentence(),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with group without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, {
                group: getValidFactGroup(),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with isDiscarded: true without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, {
                isDiscarded: true,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with isDiscarded: false without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, {
                isDiscarded: false,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with all optional parameters combined without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, {
                text: faker.lorem.sentence(),
                group: getValidFactGroup(),
                source: "user",
                isDiscarded: faker.datatype.boolean(),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should update fact with all source enum values", () => {
        it('should update fact with source "core" without errors or warnings', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, { source: "core" });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should update fact with source "system" without errors or warnings', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, { source: "system" });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should update fact with source "user" without errors or warnings', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.update(interactionId, factId, { source: "user" });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is missing", async () => {
            expect.assertions(1);

            await expect(cortiClient.facts.update(undefined as any, faker.string.uuid(), {})).rejects.toThrow();
        });

        it("should throw error when fact ID is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.facts.update(interactionId, undefined as any, {})).rejects.toThrow();
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            await expect(
                cortiClient.facts.update("invalid-uuid", factId, { text: faker.lorem.sentence() }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when fact ID is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(
                cortiClient.facts.update(interactionId, "invalid-uuid", { text: faker.lorem.sentence() }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);
            const [factId] = await createTestFacts(cortiClient, interactionId, 1);

            await expect(
                cortiClient.facts.update(faker.string.uuid(), factId, { text: faker.lorem.sentence() }),
            ).rejects.toThrow("Status code: 404");
        });

        it("should throw error when fact ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(
                cortiClient.facts.update(interactionId, faker.string.uuid(), { text: faker.lorem.sentence() }),
            ).rejects.toThrow("Status code: 404");
        });
    });
});
