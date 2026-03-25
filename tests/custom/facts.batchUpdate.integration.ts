import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import {
    cleanupInteractions,
    createTestCortiClient,
    createTestFacts,
    createTestInteraction,
    getValidFactGroups,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.facts.batchUpdate", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
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

    describe("should batch update facts with only required values", () => {
        it("should batch update single fact with only factId without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [{ factId: factIds[0] }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should batch update facts with all optional values", () => {
        it("should batch update fact with text without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [{ factId: factIds[0], text: faker.lorem.sentence() }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should batch update fact with group without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [{ factId: factIds[0], group: faker.helpers.arrayElement(validFactGroups) }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should batch update fact with isDiscarded: true without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [{ factId: factIds[0], isDiscarded: true }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should batch update fact with isDiscarded: false without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [{ factId: factIds[0], isDiscarded: false }],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should batch update fact with all optional fields combined without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [
                    {
                        factId: factIds[0],
                        text: faker.lorem.sentence(),
                        group: faker.helpers.arrayElement(validFactGroups),
                        isDiscarded: true,
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should batch update multiple facts", () => {
        it("should batch update multiple facts with different fields without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 3);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [
                    { factId: factIds[0], text: faker.lorem.sentence() },
                    { factId: factIds[1], group: faker.helpers.arrayElement(validFactGroups) },
                    { factId: factIds[2], isDiscarded: true },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should batch update multiple facts with all fields without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 2);

            const result = await cortiClient.facts.batchUpdate(interactionId, {
                facts: [
                    {
                        factId: factIds[0],
                        text: faker.lorem.sentence(),
                        group: faker.helpers.arrayElement(validFactGroups),
                        isDiscarded: false,
                    },
                    {
                        factId: factIds[1],
                        text: faker.lorem.sentence(),
                        group: faker.helpers.arrayElement(validFactGroups),
                        isDiscarded: true,
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is missing", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.facts.batchUpdate(undefined as any, {
                    facts: [{ factId: faker.string.uuid() }],
                }),
            ).rejects.toThrow();
        });

        it("should throw error when factId is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.facts.batchUpdate(interactionId, {
                    facts: [{ text: faker.lorem.sentence() }],
                } as any),
            ).rejects.toThrow('Missing required key "factId"');
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            await expect(
                cortiClient.facts.batchUpdate("invalid-uuid", {
                    facts: [{ factId: factIds[0], text: faker.lorem.sentence() }],
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when fact ID is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.facts.batchUpdate(interactionId, {
                    facts: [{ factId: "invalid-uuid", text: faker.lorem.sentence() }],
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const factIds = await createTestFacts(cortiClient, interactionId, 1);

            await expect(
                cortiClient.facts.batchUpdate(faker.string.uuid(), {
                    facts: [{ factId: factIds[0], text: faker.lorem.sentence() }],
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it("should throw error when fact ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.facts.batchUpdate(interactionId, {
                    facts: [{ factId: faker.string.uuid(), text: faker.lorem.sentence() }],
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it("should throw error when facts array is empty", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.facts.batchUpdate(interactionId, { facts: [] }),
            ).rejects.toThrow();
        });
    });
});
