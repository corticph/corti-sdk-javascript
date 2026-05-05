import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import {
    createTestCortiClient,
    createTestInteraction,
    createTestRecording,
    createTestTranscript,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.transcripts.getStatus", () => {
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

    describe("should get transcript status with only required values", () => {
        it("should return a valid status for an existing transcript", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient);
            const recordingId = await createTestRecording(cortiClient, interactionId);
            const transcriptId = await createTestTranscript(cortiClient, interactionId, recordingId);

            const result = await cortiClient.transcripts.getStatus(interactionId, transcriptId);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when interaction ID is null", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.getStatus(null as any, faker.string.uuid())).rejects.toThrow(
                "Expected string. Received null.",
            );
        });

        it("should throw error when transcript ID is null", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.transcripts.getStatus(interactionId, null as any)).rejects.toThrow(
                "Expected string. Received null.",
            );
        });

        it("should throw error when interaction ID is undefined", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.getStatus(undefined as any, faker.string.uuid())).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });

        it("should throw error when transcript ID is undefined", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.transcripts.getStatus(interactionId, undefined as any)).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.getStatus("invalid-uuid", faker.string.uuid())).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when transcript ID is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.transcripts.getStatus(interactionId, "invalid-uuid")).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.getStatus(faker.string.uuid(), faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });

        it("should throw error when transcript ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient);

            await expect(cortiClient.transcripts.getStatus(interactionId, faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
