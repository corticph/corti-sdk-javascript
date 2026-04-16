import { faker } from "@faker-js/faker";
import * as fs from "fs";
import * as path from "path";
import type { CortiClient } from "../../src/custom/CortiClient";
import { createTestCortiClient, setupConsoleWarnSpy, waitForWebSocketMessage } from "./testUtils";

describe("cortiClient.transcribe.connect", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;
    let activeSockets: any[] = [];

    beforeAll(async () => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
        activeSockets = [];
    });

    afterEach(() => {
        activeSockets.forEach((socket) => {
            if (socket && typeof socket.close === "function") {
                try {
                    socket.close();
                } catch (_error) {
                    // Ignore errors during cleanup
                }
            }
        });
        activeSockets = [];
    });

    describe("should connect with minimal configuration", () => {
        it("should connect with minimal configuration passed to connect", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect and send configuration manually on open event", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect();
            activeSockets.push(transcribeSocket);

            transcribeSocket.on("open", () => {
                transcribeSocket.sendConfiguration({
                    type: "config",
                    configuration: {
                        primaryLanguage: "en",
                    },
                });
            });

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should connect with full configuration", () => {
        it("should connect with full configuration passed to connect", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    interimResults: true,
                    spokenPunctuation: true,
                    automaticPunctuation: true,
                    commands: [
                        {
                            id: faker.string.alphanumeric(8),
                            phrases: ["stop recording", "end session"],
                        },
                    ],
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect and send full configuration manually on open event", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect();
            activeSockets.push(transcribeSocket);

            transcribeSocket.on("open", () => {
                transcribeSocket.sendConfiguration({
                    type: "config",
                    configuration: {
                        primaryLanguage: "en",
                        interimResults: true,
                        spokenPunctuation: true,
                        automaticPunctuation: true,
                        commands: [
                            {
                                id: faker.string.alphanumeric(8),
                                phrases: ["stop recording", "end session"],
                            },
                        ],
                    },
                });
            });

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect with full configuration including command variables", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    interimResults: true,
                    spokenPunctuation: true,
                    automaticPunctuation: true,
                    commands: [
                        {
                            id: faker.string.alphanumeric(8),
                            phrases: ["set status to", "change status to"],
                            variables: [
                                {
                                    key: "status",
                                    type: "enum",
                                    enum: ["active", "inactive", "pending", "completed"],
                                },
                            ],
                        },
                    ],
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should handle configuration status messages", () => {
        it("should return CONFIG_ALREADY_RECEIVED when configuration is sent twice", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect();
            activeSockets.push(transcribeSocket);

            const configuration = {
                primaryLanguage: "en" as const,
                interimResults: true,
            };

            transcribeSocket.on("open", () => {
                transcribeSocket.sendConfiguration({
                    type: "config",
                    configuration,
                });
            });

            const messages: any[] = [];
            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { messages });

            transcribeSocket.sendConfiguration({
                type: "config",
                configuration,
            });

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ALREADY_RECEIVED", { messages });

            expect(messages.some((message) => message.type === "CONFIG_ALREADY_RECEIVED")).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should handle transcription scenario with audio", () => {
        it("should process audio and receive transcription messages", async () => {
            expect.assertions(1);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                },
            });
            activeSockets.push(transcribeSocket);

            const messages: any[] = [];
            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", {
                messages,
                rejectOnWrongMessage: true,
            });

            const audioFilePath = path.join(__dirname, "trouble-breathing.mp3");
            const audioBuffer = fs.readFileSync(audioFilePath);

            for (let i = 0; i < 3; i++) {
                const chunk = audioBuffer.subarray(i * 60 * 1024, (i + 1) * 60 * 1024);
                transcribeSocket.sendAudio(chunk);
            }

            await waitForWebSocketMessage(transcribeSocket, "transcript", { messages, timeoutMs: 30000 });

            transcribeSocket.sendEnd({ type: "end" });

            // FIXME skip this part of the test since it takes too long on production to get these messages
            // await waitForWebSocketMessage(transcribeSocket, 'usage', { messages });
            //
            // await waitForWebSocketMessage(transcribeSocket, 'ended', { messages });

            // expect([2, 3]).toContain(transcribeSocket.socket.readyState); // CLOSING or CLOSED
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should handle configuration errors", () => {
        it("should reject invalid configuration", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "invalid_language",
                },
            });
            activeSockets.push(transcribeSocket);

            const messages: any[] = [];
            await waitForWebSocketMessage(transcribeSocket, "CONFIG_DENIED", { messages, rejectOnWrongMessage: true });

            expect([2, 3]).toContain(transcribeSocket.socket.readyState); // CLOSING or CLOSED
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should reject missing configuration", async () => {
            expect.assertions(1);

            const transcribeSocket = await cortiClient.transcribe.connect();
            activeSockets.push(transcribeSocket);

            const messages: any[] = [];
            await waitForWebSocketMessage(transcribeSocket, "CONFIG_TIMEOUT", {
                messages,
                rejectOnWrongMessage: true,
                timeoutMs: 60000,
            });

            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should reject configuration with invalid command", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    commands: [
                        {
                            id: "",
                            phrases: [],
                        } as any,
                    ],
                },
            });
            activeSockets.push(transcribeSocket);

            const messages: any[] = [];
            await waitForWebSocketMessage(transcribeSocket, "CONFIG_DENIED", { messages, rejectOnWrongMessage: true });

            expect([2, 3]).toContain(transcribeSocket.socket.readyState); // CLOSING or CLOSED
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should connect with formatting configuration", () => {
        it("should connect with dates formatting", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    formatting: { dates: "locale:long" },
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect with times formatting", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    formatting: { times: "h12" },
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect with numbers formatting", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    formatting: { numbers: "numerals" },
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect with measurements formatting", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    formatting: { measurements: "abbreviated" },
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect with numeric ranges formatting", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    formatting: { numericRanges: "numerals" },
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect with ordinals formatting", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    formatting: { ordinals: "numerals" },
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should connect with full formatting configuration", async () => {
            expect.assertions(2);

            const transcribeSocket = await cortiClient.transcribe.connect({
                awaitConfiguration: false,
                configuration: {
                    primaryLanguage: "en",
                    formatting: {
                        dates: "locale:long",
                        times: "h12",
                        numbers: "numerals",
                        measurements: "abbreviated",
                        numericRanges: "numerals",
                        ordinals: "numerals",
                    },
                },
            });
            activeSockets.push(transcribeSocket);

            await waitForWebSocketMessage(transcribeSocket, "CONFIG_ACCEPTED", { rejectOnWrongMessage: true });

            expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
