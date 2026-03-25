import { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy, cleanupInteractions, createTestInteraction } from "./testUtils";
import { faker } from "@faker-js/faker";

describe("cortiClient.interactions.list", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: jest.SpyInstance;
    const createdInteractionIds: string[] = [];

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(async () => {
        consoleWarnSpy.mockRestore();
        await cleanupInteractions(cortiClient, createdInteractionIds);
        createdInteractionIds.length = 0;
    });

    describe("should list interactions with only required values", () => {
        it("should return empty result when no interactions exist", async () => {
            expect.assertions(3);

            const response = await cortiClient.interactions.list();
            const interactionIds: string[] = [];

            for await (const interaction of response) {
                interactionIds.push(interaction.id);
            }

            if (interactionIds.length > 0) {
                await cleanupInteractions(cortiClient, interactionIds);
            }

            const result = await cortiClient.interactions.list();

            expect(result.data).toEqual([]);
            expect(result.hasNextPage()).toBe(false);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return interactions when they exist without errors or warnings", async () => {
            expect.assertions(4);

            const interactionId1 = await createTestInteraction(cortiClient, createdInteractionIds);
            const interactionId2 = await createTestInteraction(cortiClient, createdInteractionIds);

            const result = await cortiClient.interactions.list();

            expect(result.data.length).toBeGreaterThanOrEqual(2);
            expect(result.data.some((interaction) => interaction.id === interactionId1)).toBe(true);
            expect(result.data.some((interaction) => interaction.id === interactionId2)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("filtering by patient", () => {
        it("should return only interactions for specified patient", async () => {
            expect.assertions(5);

            const patient1Id = faker.string.alphanumeric(15);
            const patient2Id = faker.string.alphanumeric(15);
            const patient3Id = faker.string.alphanumeric(15);

            const interaction1Id = await createTestInteraction(cortiClient, createdInteractionIds, {
                patient: { identifier: patient1Id },
            });

            const interaction2Id = await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { type: "consultation" },
                patient: { identifier: patient1Id },
            });

            await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { type: "outpatient" },
                patient: { identifier: patient2Id },
            });

            await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "in-progress", type: "emergency" },
                patient: { identifier: patient3Id },
            });

            const result = await cortiClient.interactions.list({ patient: patient1Id });

            expect(result.data.length).toBe(2);
            expect(result.data.every((interaction) => interaction.patient?.identifier === patient1Id)).toBe(true);
            expect(result.data.some((interaction) => interaction.id === interaction1Id)).toBe(true);
            expect(result.data.some((interaction) => interaction.id === interaction2Id)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return empty result for non-existent patient", async () => {
            expect.assertions(3);

            await createTestInteraction(cortiClient, createdInteractionIds, {
                patient: { identifier: faker.string.alphanumeric(15) },
            });

            await createTestInteraction(cortiClient, createdInteractionIds, {
                patient: { identifier: faker.string.alphanumeric(15) },
            });

            const nonExistentPatientId = faker.string.alphanumeric(15);
            const result = await cortiClient.interactions.list({ patient: nonExistentPatientId });

            expect(result.data).toEqual([]);
            expect(result.data.length).toBe(0);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("filtering by encounterStatus", () => {
        it("should filter by single encounterStatus string", async () => {
            expect.assertions(4);

            const plannedId = await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "planned" },
            });

            await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "in-progress" },
            });

            await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "completed" },
            });

            const result = await cortiClient.interactions.list({ encounterStatus: "planned" });

            expect(result.data.length).toBeGreaterThanOrEqual(1);
            expect(result.data.every((interaction) => interaction.encounter?.status === "planned")).toBe(true);
            expect(result.data.some((interaction) => interaction.id === plannedId)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        // FIXME Doesn't work on API side https://linear.app/corti/issue/TGT-399/fix-db-code-to-accept-multiple-params-as-per-spec
        it.skip("should filter by multiple encounterStatus array", async () => {
            expect.assertions(5);

            const plannedId = await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "planned" },
            });

            const inProgressId = await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "in-progress" },
            });

            await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "completed" },
            });

            await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "cancelled" },
            });

            const result = await cortiClient.interactions.list({
                encounterStatus: ["planned", "in-progress"],
            });

            expect(result.data.length).toBeGreaterThanOrEqual(2);
            expect(
                result.data.every((interaction) =>
                    ["planned", "in-progress"].includes(interaction.encounter?.status || ""),
                ),
            ).toBe(true);
            expect(result.data.some((interaction) => interaction.id === plannedId)).toBe(true);
            expect(result.data.some((interaction) => interaction.id === inProgressId)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        describe("should find interactions for all valid status enum values", () => {
            it("should find planned interactions", async () => {
                expect.assertions(3);

                const plannedId = await createTestInteraction(cortiClient, createdInteractionIds, {
                    encounter: { status: "planned" },
                });

                const result = await cortiClient.interactions.list({ encounterStatus: "planned" });

                expect(result.data.length).toBeGreaterThanOrEqual(1);
                expect(result.data.some((interaction) => interaction.id === plannedId)).toBe(true);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should find in-progress interactions", async () => {
                expect.assertions(3);

                const inProgressId = await createTestInteraction(cortiClient, createdInteractionIds, {
                    encounter: { status: "in-progress" },
                });

                const result = await cortiClient.interactions.list({ encounterStatus: "in-progress" });

                expect(result.data.length).toBeGreaterThanOrEqual(1);
                expect(result.data.some((interaction) => interaction.id === inProgressId)).toBe(true);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should find on-hold interactions", async () => {
                expect.assertions(3);

                const onHoldId = await createTestInteraction(cortiClient, createdInteractionIds, {
                    encounter: { status: "on-hold" },
                });

                const result = await cortiClient.interactions.list({ encounterStatus: "on-hold" });

                expect(result.data.length).toBeGreaterThanOrEqual(1);
                expect(result.data.some((interaction) => interaction.id === onHoldId)).toBe(true);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should find completed interactions", async () => {
                expect.assertions(3);

                const completedId = await createTestInteraction(cortiClient, createdInteractionIds, {
                    encounter: { status: "completed" },
                });

                const result = await cortiClient.interactions.list({ encounterStatus: "completed" });

                expect(result.data.length).toBeGreaterThanOrEqual(1);
                expect(result.data.some((interaction) => interaction.id === completedId)).toBe(true);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should find cancelled interactions", async () => {
                expect.assertions(3);

                const cancelledId = await createTestInteraction(cortiClient, createdInteractionIds, {
                    encounter: { status: "cancelled" },
                });

                const result = await cortiClient.interactions.list({ encounterStatus: "cancelled" });

                expect(result.data.length).toBeGreaterThanOrEqual(1);
                expect(result.data.some((interaction) => interaction.id === cancelledId)).toBe(true);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should find deleted interactions", async () => {
                expect.assertions(3);

                const deletedId = await createTestInteraction(cortiClient, createdInteractionIds, {
                    encounter: { status: "deleted" },
                });

                const result = await cortiClient.interactions.list({ encounterStatus: "deleted" });

                expect(result.data.length).toBeGreaterThanOrEqual(1);
                expect(result.data.some((interaction) => interaction.id === deletedId)).toBe(true);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error for invalid encounterStatus", async () => {
            expect.assertions(1);

            await createTestInteraction(cortiClient, createdInteractionIds, {
                encounter: { status: "planned" },
            });

            await expect(
                cortiClient.interactions.list({
                    encounterStatus: "non-existent-status" as any,
                }),
            ).rejects.toThrow('Expected enum. Received "non-existent-status".');
        });
    });

    describe("sorting", () => {
        it("should sort by default (createdAt desc) when no sort parameters provided", async () => {
            expect.assertions(3);

            const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
            await new Promise((resolve) => setTimeout(resolve, 100));

            const secondId = await createTestInteraction(cortiClient, createdInteractionIds);
            await new Promise((resolve) => setTimeout(resolve, 100));

            const thirdId = await createTestInteraction(cortiClient, createdInteractionIds);

            const result = await cortiClient.interactions.list();

            const ourInteractions = result.data.filter((interaction) =>
                [firstId, secondId, thirdId].includes(interaction.id),
            );

            expect(ourInteractions.length).toBe(3);
            expect(ourInteractions[0].id).toBe(thirdId);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        describe("sort by createdAt", () => {
            it("should sort by createdAt desc", async () => {
                expect.assertions(4);

                const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const secondId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const thirdId = await createTestInteraction(cortiClient, createdInteractionIds);

                const result = await cortiClient.interactions.list({
                    sort: "createdAt",
                    direction: "desc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [firstId, secondId, thirdId].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(3);
                expect(ourInteractions[0].id).toBe(thirdId);
                expect(ourInteractions[2].id).toBe(firstId);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should sort by createdAt asc", async () => {
                expect.assertions(4);

                const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const secondId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const thirdId = await createTestInteraction(cortiClient, createdInteractionIds);

                const result = await cortiClient.interactions.list({
                    sort: "createdAt",
                    direction: "asc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [firstId, secondId, thirdId].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(3);
                expect(ourInteractions[0].id).toBe(firstId);
                expect(ourInteractions[2].id).toBe(thirdId);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should sort by createdAt with default direction (desc) when direction not specified", async () => {
                expect.assertions(3);

                const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const secondId = await createTestInteraction(cortiClient, createdInteractionIds);

                const result = await cortiClient.interactions.list({ sort: "createdAt" });

                const ourInteractions = result.data.filter((interaction) =>
                    [firstId, secondId].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(2);
                expect(ourInteractions[0].id).toBe(secondId);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });
        });

        describe("sort by updatedAt", () => {
            it("should sort by updatedAt desc", async () => {
                expect.assertions(4);

                const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const secondId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const thirdId = await createTestInteraction(cortiClient, createdInteractionIds);

                const result = await cortiClient.interactions.list({
                    sort: "updatedAt",
                    direction: "desc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [firstId, secondId, thirdId].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(3);
                expect(ourInteractions[0].id).toBe(thirdId);
                expect(ourInteractions[2].id).toBe(firstId);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should sort by updatedAt asc", async () => {
                expect.assertions(4);

                const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const secondId = await createTestInteraction(cortiClient, createdInteractionIds);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const thirdId = await createTestInteraction(cortiClient, createdInteractionIds);

                const result = await cortiClient.interactions.list({
                    sort: "updatedAt",
                    direction: "asc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [firstId, secondId, thirdId].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(3);
                expect(ourInteractions[0].id).toBe(firstId);
                expect(ourInteractions[2].id).toBe(thirdId);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });
        });

        describe("sort by id", () => {
            it("should sort by id desc", async () => {
                expect.assertions(4);

                const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
                const secondId = await createTestInteraction(cortiClient, createdInteractionIds);

                const result = await cortiClient.interactions.list({
                    sort: "id",
                    direction: "desc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [firstId, secondId].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(2);
                const expectedFirst = firstId > secondId ? firstId : secondId;
                const expectedSecond = firstId === expectedFirst ? secondId : firstId;
                expect(ourInteractions[0].id).toBe(expectedFirst);
                expect(ourInteractions[1].id).toBe(expectedSecond);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should sort by id asc", async () => {
                expect.assertions(4);

                const firstId = await createTestInteraction(cortiClient, createdInteractionIds);
                const secondId = await createTestInteraction(cortiClient, createdInteractionIds);

                const result = await cortiClient.interactions.list({
                    sort: "id",
                    direction: "asc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [firstId, secondId].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(2);
                const expectedFirst = firstId < secondId ? firstId : secondId;
                const expectedSecond = firstId === expectedFirst ? secondId : firstId;
                expect(ourInteractions[0].id).toBe(expectedFirst);
                expect(ourInteractions[1].id).toBe(expectedSecond);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });
        });

        describe("sort by assignedUserId", () => {
            it("should sort by assignedUserId desc", async () => {
                expect.assertions(4);

                const userA = faker.string.uuid();
                const userB = faker.string.uuid();

                const interactionA = await createTestInteraction(cortiClient, createdInteractionIds, {
                    assignedUserId: userA,
                });

                const interactionB = await createTestInteraction(cortiClient, createdInteractionIds, {
                    assignedUserId: userB,
                });

                const result = await cortiClient.interactions.list({
                    sort: "assignedUserId",
                    direction: "desc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [interactionA, interactionB].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(2);
                const expectedFirst = userA > userB ? userA : userB;
                const expectedSecond = userA === expectedFirst ? userB : userA;
                expect(ourInteractions[0].assignedUserId).toBe(expectedFirst);
                expect(ourInteractions[1].assignedUserId).toBe(expectedSecond);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should sort by assignedUserId asc", async () => {
                expect.assertions(4);

                const userA = faker.string.uuid();
                const userB = faker.string.uuid();

                const interactionA = await createTestInteraction(cortiClient, createdInteractionIds, {
                    assignedUserId: userA,
                });

                const interactionB = await createTestInteraction(cortiClient, createdInteractionIds, {
                    assignedUserId: userB,
                });

                const result = await cortiClient.interactions.list({
                    sort: "assignedUserId",
                    direction: "asc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [interactionA, interactionB].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(2);
                const expectedFirst = userA < userB ? userA : userB;
                const expectedSecond = userA === expectedFirst ? userB : userA;
                expect(ourInteractions[0].assignedUserId).toBe(expectedFirst);
                expect(ourInteractions[1].assignedUserId).toBe(expectedSecond);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });
        });

        // FIXME Should work, but return different results every time
        describe.skip("sort by patient", () => {
            it("should sort by patient desc", async () => {
                expect.assertions(4);

                const patientA = "a-" + faker.string.alphanumeric(15);
                const patientB = "b-" + faker.string.alphanumeric(15);

                const interactionA = await createTestInteraction(cortiClient, createdInteractionIds, {
                    patient: { identifier: patientA },
                });

                const interactionB = await createTestInteraction(cortiClient, createdInteractionIds, {
                    patient: { identifier: patientB },
                });

                const result = await cortiClient.interactions.list({
                    sort: "patient",
                    direction: "desc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [interactionA, interactionB].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(2);

                const expectedFirst = patientA > patientB ? patientA : patientB;
                const expectedSecond = patientA === expectedFirst ? patientB : patientA;

                expect(ourInteractions[0].patient?.identifier).toBe(expectedFirst);
                expect(ourInteractions[1].patient?.identifier).toBe(expectedSecond);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });

            it("should sort by patient asc", async () => {
                expect.assertions(4);

                const patientA = "a-" + faker.string.alphanumeric(15);
                const patientB = "b-" + faker.string.alphanumeric(15);

                const interactionA = await createTestInteraction(cortiClient, createdInteractionIds, {
                    patient: { identifier: patientA },
                });

                const interactionB = await createTestInteraction(cortiClient, createdInteractionIds, {
                    patient: { identifier: patientB },
                });

                const result = await cortiClient.interactions.list({
                    sort: "patient",
                    direction: "asc",
                });

                const ourInteractions = result.data.filter((interaction) =>
                    [interactionA, interactionB].includes(interaction.id),
                );

                expect(ourInteractions.length).toBe(2);

                const expectedFirst = patientA < patientB ? patientA : patientB;
                const expectedSecond = patientA === expectedFirst ? patientB : patientA;

                expect(ourInteractions[0].patient?.identifier).toBe(expectedFirst);
                expect(ourInteractions[1].patient?.identifier).toBe(expectedSecond);
                expect(consoleWarnSpy).not.toHaveBeenCalled();
            });
        });
    });

    describe("pagination", () => {
        it("should iterate through all interactions using async iterator", async () => {
            expect.assertions(4);

            const createdIds: string[] = [];
            for (let i = 0; i < 15; i++) {
                const id = await createTestInteraction(cortiClient, createdInteractionIds);
                createdIds.push(id);
            }

            const response = await cortiClient.interactions.list({ pageSize: 5 });
            const collectedInteractions: string[] = [];

            expect(response.data.length).toBeLessThanOrEqual(5);

            for await (const interaction of response) {
                if (createdIds.includes(interaction.id)) {
                    collectedInteractions.push(interaction.id);
                }
            }

            expect(collectedInteractions.length).toBe(15);
            expect(createdIds.every((id) => collectedInteractions.includes(id))).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should iterate through pages manually using hasNextPage and getNextPage", async () => {
            expect.assertions(4);

            const createdIds: string[] = [];
            for (let i = 0; i < 12; i++) {
                const id = await createTestInteraction(cortiClient, createdInteractionIds);
                createdIds.push(id);
            }

            let page = await cortiClient.interactions.list({ pageSize: 4 });
            const collectedInteractions: string[] = [];

            expect(page.data.length).toBeLessThanOrEqual(4);

            page.data.forEach((interaction) => {
                if (createdIds.includes(interaction.id)) {
                    collectedInteractions.push(interaction.id);
                }
            });

            while (page.hasNextPage()) {
                page = await page.getNextPage();
                page.data.forEach((interaction) => {
                    if (createdIds.includes(interaction.id)) {
                        collectedInteractions.push(interaction.id);
                    }
                });
            }

            expect(collectedInteractions.length).toBe(12);
            expect(createdIds.every((id) => collectedInteractions.includes(id))).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should use default pageSize when not specified", async () => {
            expect.assertions(2);

            for (let i = 0; i < 5; i++) {
                await createTestInteraction(cortiClient, createdInteractionIds);
            }

            const result = await cortiClient.interactions.list();

            expect(result.data.length).toBeLessThanOrEqual(10);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
