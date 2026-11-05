import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import {
    createTestCortiClient,
    createTestInteraction,
    createTestRecording,
    pause,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.recordings.list", () => {
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

    describe("should list recordings with only required values", () => {
        it("should return empty list when interaction has no recordings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);

            const result = await cortiClient.recordings.list(interactionId);

            expect(result.recordings.length).toBe(0);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return recordings when interaction has recordings", async () => {
            expect.assertions(3);

            const interactionId = await createTestInteraction(cortiClient);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.recordings.list(interactionId);

            expect(result.recordings.length).toBeGreaterThan(0);
            expect(result.recordings.includes(recordingId)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return multiple recordings when interaction has multiple recordings", async () => {
            expect.assertions(4);

            const interactionId = await createTestInteraction(cortiClient);
            const recordingId1 = await createTestRecording(cortiClient, interactionId);
            const recordingId2 = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.recordings.list(interactionId);

            expect(result.recordings.length).toBeGreaterThanOrEqual(2);
            expect(result.recordings.includes(recordingId1)).toBe(true);
            expect(result.recordings.includes(recordingId2)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should list recordings with all direction enum values", () => {
        it("should return oldest recording first when direction is asc", async () => {
            expect.assertions(3);

            const interactionId = await createTestInteraction(cortiClient);
            const firstRecordingId = await createTestRecording(cortiClient, interactionId);
            await pause(100);
            const secondRecordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.recordings.list(interactionId, { direction: "asc" });

            expect(result.recordings.indexOf(firstRecordingId)).toBeGreaterThanOrEqual(0);
            expect(result.recordings.indexOf(firstRecordingId)).toBeLessThan(
                result.recordings.indexOf(secondRecordingId),
            );
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return newest recording first when direction is desc", async () => {
            expect.assertions(3);

            const interactionId = await createTestInteraction(cortiClient);
            const firstRecordingId = await createTestRecording(cortiClient, interactionId);
            await pause(100);
            const secondRecordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.recordings.list(interactionId, { direction: "desc" });

            expect(result.recordings.indexOf(secondRecordingId)).toBeGreaterThanOrEqual(0);
            expect(result.recordings.indexOf(secondRecordingId)).toBeLessThan(
                result.recordings.indexOf(firstRecordingId),
            );
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should default to desc order when direction is not specified", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            await createTestRecording(cortiClient, interactionId);
            await pause(100);
            await createTestRecording(cortiClient, interactionId);

            const defaultResult = await cortiClient.recordings.list(interactionId);
            const descResult = await cortiClient.recordings.list(interactionId, { direction: "desc" });

            expect(defaultResult.recordings).toEqual(descResult.recordings);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is null", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.list(null as any)).rejects.toThrow("Expected string. Received null.");
        });

        it("should throw error when interaction ID is undefined", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.list(undefined as any)).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.list("invalid-uuid")).rejects.toThrow("Status code: 400");
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.recordings.list(faker.string.uuid())).rejects.toThrow("Status code: 404");
        });
    });
});
