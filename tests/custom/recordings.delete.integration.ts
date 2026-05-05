import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestCortiClient, createTestInteraction, createTestRecording, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.recordings.delete", () => {
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

    describe("should delete recording with only required values", () => {
        it("should successfully delete an existing recording without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.recordings.delete(interactionId, recordingId);

            expect(result).toBeUndefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should not throw error when recording ID does not exist (idempotent delete)", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.recordings.delete(interactionId, faker.string.uuid())).resolves.toBe(undefined);
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is null", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.delete(null as any, faker.string.uuid())).rejects.toThrow(
                "Expected string. Received null.",
            );
        });

        it("should throw error when recording ID is null", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.recordings.delete(interactionId, null as any)).rejects.toThrow(
                "Expected string. Received null.",
            );
        });

        it("should throw error when interaction ID is undefined", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.delete(undefined as any, faker.string.uuid())).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });

        it("should throw error when recording ID is undefined", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.recordings.delete(interactionId, undefined as any)).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.delete("invalid-uuid", faker.string.uuid())).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when recording ID is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.recordings.delete(interactionId, "invalid-uuid")).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.delete(faker.string.uuid(), faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
