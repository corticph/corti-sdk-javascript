import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import {
    createTestCortiClient,
    createTestInteraction,
    createTestFacts,
    cleanupInteractions,
    setupConsoleWarnSpy,
    getValidFactGroups,
} from "./testUtils";

describe("cortiClient.facts.update", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: jest.SpyInstance;
    let createdInteractionIds: string[] = [];
    let validFactGroups: string[] = [];

    beforeAll(async () => {
        cortiClient = createTestCortiClient();
        validFactGroups = await getValidFactGroups(cortiClient);
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
        createdInteractionIds = [];
    });

    afterEach(async () => {
        consoleWarnSpy.mockRestore();
        await cleanupInteractions(cortiClient, createdInteractionIds);
        createdInteractionIds = [];
    });

    const getValidFactGroup = (): string => {
        return faker.helpers.arrayElement(validFactGroups);
    };

    describe("should update fact with minimal fields", () => {
        it("should update fact with empty request (no changes) without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {});

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with only text without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                text: faker.lorem.sentence(),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with only group without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                group: getValidFactGroup(),
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with only isDiscarded without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                isDiscarded: true,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should update fact with all source enum values", () => {
        it('should update fact with source "core"', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                source: "core",
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should update fact with source "system"', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                source: "system",
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should update fact with source "user"', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                source: "user",
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should update fact with isDiscarded boolean values", () => {
        it("should update fact with isDiscarded set to true without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                isDiscarded: true,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should update fact with isDiscarded set to false without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            const result = await cortiClient.facts.update(interactionId, factId, {
                isDiscarded: false,
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    it("should update fact with all optional parameters without errors or warnings", async () => {
        expect.assertions(2);

        const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
        const factIds = await createTestFacts(cortiClient, interactionId, 1);
        const factId = factIds[0];

        const result = await cortiClient.facts.update(interactionId, factId, {
            text: faker.lorem.sentence(),
            group: getValidFactGroup(),
            source: "user",
            isDiscarded: faker.datatype.boolean(),
        });

        expect(result).toBeDefined();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            await expect(
                cortiClient.facts.update("invalid-uuid", factId, {
                    text: faker.lorem.sentence(),
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when fact ID is invalid", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.facts.update(interactionId, "invalid-uuid", {
                    text: faker.lorem.sentence(),
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);
            const factId = factIds[0];

            await expect(
                cortiClient.facts.update(faker.string.uuid(), factId, {
                    text: faker.lorem.sentence(),
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it("should throw error when fact ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.facts.update(interactionId, faker.string.uuid(), {
                    text: faker.lorem.sentence(),
                }),
            ).rejects.toThrow("Status code: 404");
        });
    });
});
