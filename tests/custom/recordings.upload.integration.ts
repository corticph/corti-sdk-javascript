import { faker } from "@faker-js/faker";
import { createReadStream, readFileSync } from "fs";
import type { CortiClient } from "../../src";
import { cleanupInteractions, createTestCortiClient, createTestInteraction, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.recordings.upload", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    let createdInteractionIds: string[] = [];

    beforeAll(() => {
        cortiClient = createTestCortiClient();
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

    describe("should upload recording with only required values", () => {
        it("should upload trouble-breathing.mp3 using createReadStream without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            const file = createReadStream("tests/custom/trouble-breathing.mp3", {
                autoClose: true,
            });

            const result = await cortiClient.recordings.upload(file, interactionId);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should upload trouble-breathing.mp3 using File object without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            const fileBuffer = readFileSync("tests/custom/trouble-breathing.mp3");

            const file = new File([fileBuffer], "trouble-breathing.mp3", {
                type: "audio/mpeg",
            });

            const result = await cortiClient.recordings.upload(file, interactionId);

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when uploading with null interaction ID", async () => {
            expect.assertions(1);

            const file = createReadStream("tests/custom/trouble-breathing.mp3", {
                autoClose: true,
            });

            await expect(cortiClient.recordings.upload(file, null as any)).rejects.toThrow(
                "Expected string. Received null.",
            );
        });

        it("should throw error when uploading with undefined interaction ID", async () => {
            expect.assertions(1);

            const file = createReadStream("tests/custom/trouble-breathing.mp3", {
                autoClose: true,
            });

            await expect(cortiClient.recordings.upload(file, undefined as any)).rejects.toThrow(
                "Expected string. Received undefined.",
            );
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when uploading to non-existent interaction", async () => {
            expect.assertions(1);

            const file = createReadStream("tests/custom/trouble-breathing.mp3", {
                autoClose: true,
            });

            await expect(cortiClient.recordings.upload(file, faker.string.uuid())).rejects.toThrow("Status code: 404");
        });

        it("should throw error when uploading with invalid interaction ID format", async () => {
            expect.assertions(1);

            const file = createReadStream("tests/custom/trouble-breathing.mp3", {
                autoClose: true,
            });

            await expect(cortiClient.recordings.upload(file, "invalid-uuid-format")).rejects.toThrow("Status code: 400");
        });
    });
});
