import { faker } from "@faker-js/faker";
import type { MockInstance } from "vitest";
import type { CortiClient } from "../../src";
import {
    cleanupInteractions,
    createTestCortiClient,
    createTestInteraction,
    createTestRecording,
    setupConsoleWarnSpy,
} from "./testUtils";

describe("cortiClient.transcripts.create", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: MockInstance;
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

    describe("should create transcript with only required values", () => {
        it.concurrent("should create transcript with only required fields without errors or warnings", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.transcripts.create(interactionId, {
                recordingId,
                primaryLanguage: "en",
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should create transcript with all participant role enum values", () => {
        it.concurrent('should create transcript with participant role "doctor"', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.transcripts.create(interactionId, {
                recordingId,
                primaryLanguage: "en",
                participants: [
                    {
                        channel: 0,
                        role: "doctor",
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it.concurrent('should create transcript with participant role "patient"', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.transcripts.create(interactionId, {
                recordingId,
                primaryLanguage: "en",
                participants: [
                    {
                        channel: 0,
                        role: "patient",
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it.concurrent('should create transcript with participant role "multiple"', async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.transcripts.create(interactionId, {
                recordingId,
                primaryLanguage: "en",
                participants: [
                    {
                        channel: 0,
                        role: "multiple",
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it.concurrent("should create transcript with multiple participants", async () => {
            expect.assertions(2);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            const result = await cortiClient.transcripts.create(interactionId, {
                recordingId,
                primaryLanguage: "en",
                participants: [
                    {
                        channel: 0,
                        role: "doctor",
                    },
                    {
                        channel: 1,
                        role: "patient",
                    },
                ],
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    it.concurrent("should create transcript with all optional parameters without errors or warnings", async () => {
        expect.assertions(2);

        const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
        const recordingId = await createTestRecording(cortiClient, interactionId);

        const isMultichannel = faker.datatype.boolean();
        const diarize = isMultichannel ? faker.datatype.boolean() : false; // diarize can only be true if isMultichannel is true

        const result = await cortiClient.transcripts.create(interactionId, {
            recordingId,
            primaryLanguage: "en",
            isDictation: faker.datatype.boolean(),
            isMultichannel,
            diarize,
            participants: [
                {
                    channel: faker.number.int({ min: 0, max: 1 }),
                    role: faker.helpers.arrayElement(["doctor", "patient", "multiple"]),
                },
            ],
        });

        expect(result).toBeDefined();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    describe("should throw error when required fields are missing", () => {
        it.concurrent("should throw error when recordingId is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    primaryLanguage: "en",
                } as any),
            ).rejects.toThrow('Missing required key "recordingId"');
        });

        it.concurrent("should throw error when primaryLanguage is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId,
                } as any),
            ).rejects.toThrow('Missing required key "primaryLanguage"');
        });

        it.concurrent("should throw error when participant channel is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId,
                    primaryLanguage: "en",
                    participants: [
                        {
                            role: "doctor",
                        } as any,
                    ],
                }),
            ).rejects.toThrow('Missing required key "channel"');
        });

        it.concurrent("should throw error when participant role is missing", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId,
                    primaryLanguage: "en",
                    participants: [
                        {
                            channel: 0,
                        } as any,
                    ],
                }),
            ).rejects.toThrow('Missing required key "role"');
        });

        it.concurrent("should throw error when interaction ID is invalid format", async () => {
            expect.assertions(1);

            const recordingId = faker.string.uuid();

            await expect(
                cortiClient.transcripts.create("invalid-uuid", {
                    recordingId,
                    primaryLanguage: "en",
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it.concurrent("should throw error when interaction ID does not exist", async () => {
            expect.assertions(1);

            const recordingId = faker.string.uuid();

            await expect(
                cortiClient.transcripts.create(faker.string.uuid(), {
                    recordingId,
                    primaryLanguage: "en",
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it.concurrent("should throw error when recordingId does not exist", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId: faker.string.uuid(),
                    primaryLanguage: "en",
                }),
            ).rejects.toThrow("Status code: 404");
        });

        it.concurrent("should throw error when recordingId is invalid format", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId: "invalid-uuid",
                    primaryLanguage: "en",
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it.concurrent("should throw error when primaryLanguage is invalid", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId,
                    primaryLanguage: "invalid-language",
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it.concurrent("should throw error when participant role is invalid", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId,
                    primaryLanguage: "en",
                    participants: [
                        {
                            channel: 0,
                            role: "invalid-role" as any,
                        },
                    ],
                }),
            ).rejects.toThrow('Expected enum. Received "invalid-role"');
        });

        it.concurrent("should throw error when diarize is true but isMultichannel is false", async () => {
            expect.assertions(1);

            const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
            const recordingId = await createTestRecording(cortiClient, interactionId);

            await expect(
                cortiClient.transcripts.create(interactionId, {
                    recordingId,
                    primaryLanguage: "en",
                    isMultichannel: false,
                    diarize: true,
                    participants: [
                        {
                            channel: faker.number.int({ min: 0, max: 1 }),
                            role: faker.helpers.arrayElement(["doctor", "patient", "multiple"]),
                        },
                    ],
                }),
            ).rejects.toThrow("BadRequestError");
        });
    });
});
