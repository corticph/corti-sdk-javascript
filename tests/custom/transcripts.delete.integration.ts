import { CortiClient } from "../../src";
import { faker } from "@faker-js/faker";
import {
    createTestCortiClient,
    createTestInteraction,
    createTestRecording,
    createTestTranscript,
    setupConsoleWarnSpy,
    cleanupInteractions,
} from "./testUtils";

describe("cortiClient.transcripts.delete", () => {
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

    it("should successfully delete an existing transcript without errors or warnings", async () => {
        expect.assertions(2);

        const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
        const recordingId = await createTestRecording(cortiClient, interactionId);
        const transcriptId = await createTestTranscript(cortiClient, interactionId, recordingId);

        const result = await cortiClient.transcripts.delete(interactionId, transcriptId);

        expect(result).toBeUndefined();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.delete("invalid-uuid", faker.string.uuid())).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when transcript ID is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(cortiClient.transcripts.delete(interactionId, "invalid-uuid")).rejects.toThrow(
                "Status code: 400",
            );
        });

        it("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.delete(faker.string.uuid(), faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });

        it("should throw error when interaction ID is null", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.delete(null as any, faker.string.uuid())).rejects.toThrow(
                "Expected string. Received null.",
            );
        });

        it("should throw error when transcript ID is null", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(cortiClient.transcripts.delete(interactionId, null as any)).rejects.toThrow(
                "Expected string. Received null.",
            );
        });

        it("should throw error when interaction ID is undefined", async () => {
            expect.assertions(1);

            await expect(cortiClient.transcripts.delete(undefined as any, faker.string.uuid())).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });

        it("should throw error when transcript ID is undefined", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(cortiClient.transcripts.delete(interactionId, undefined as any)).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });

        it("should throw error when transcript ID does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(cortiClient.transcripts.delete(interactionId, faker.string.uuid())).rejects.toThrow(
                "Status code: 404",
            );
        });
    });
});
