import { faker } from "@faker-js/faker";
import type { CortiClient } from "../../src";
import { createTestAgent, createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.agents.messageSend", () => {
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

    describe("should send message with minimal fields", () => {
        it("should send message with only required fields without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should send message with agent role without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "agent",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should send message with all optional fields", () => {
        it("should send message with metadata without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                    metadata: {
                        testKey: faker.lorem.word(),
                    },
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should send message with extensions without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                    extensions: [faker.lorem.word()],
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        // FIXME: We need to be able to get a task in not final state, otherwise error is valid
        it.skip("should send message with taskId and contextId without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const firstMessage = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
            });

            const taskId = firstMessage.task?.id;
            const contextId = firstMessage.task?.contextId;

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                    taskId: taskId,
                    contextId: contextId,
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should send message with referenceTaskIds without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                    referenceTaskIds: [faker.string.uuid()],
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        // FIXME: We need to be able to get a task in not final state, otherwise error is valid
        it.skip("should send message with all optional parameters without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const firstMessage = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
            });

            const taskId = firstMessage.task?.id;
            const contextId = firstMessage.task?.contextId;

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "text",
                            text: faker.lorem.sentence(),
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                    metadata: {
                        testKey: faker.lorem.word(),
                    },
                    extensions: [faker.lorem.word()],
                    taskId: taskId,
                    contextId: contextId,
                    referenceTaskIds: [faker.string.uuid()],
                },
                configuration: {
                    blocking: true,
                },
                metadata: {
                    testMetadata: faker.lorem.word(),
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should send message with all part kinds", () => {
        it("should send message with file part (uri) without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "file",
                            file: { uri: "https://example.com/file.pdf", mimeType: "application/pdf" },
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should send message with data part without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [
                        {
                            kind: "data",
                            data: { key: faker.lorem.word() },
                        },
                    ],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should send message with configuration fields", () => {
        it("should send message with configuration.acceptedOutputModes without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [{ kind: "text", text: faker.lorem.sentence() }],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
                configuration: { acceptedOutputModes: ["text/plain"] },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should send message with configuration.historyLength without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [{ kind: "text", text: faker.lorem.sentence() }],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
                configuration: { historyLength: faker.number.int({ min: 1, max: 10 }) },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should send message with configuration.blocking false without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [{ kind: "text", text: faker.lorem.sentence() }],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
                configuration: { blocking: false },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should send message with top-level metadata", () => {
        it("should send message with metadata without errors or warnings", async () => {
            expect.assertions(2);

            const agent = await createTestAgent(cortiClient);

            const result = await cortiClient.agents.messageSend(agent.id, {
                message: {
                    role: "user",
                    parts: [{ kind: "text", text: faker.lorem.sentence() }],
                    messageId: faker.string.uuid(),
                    kind: "message",
                },
                metadata: { testKey: faker.lorem.word() },
            });

            expect(result).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should throw error when required parameters are missing", () => {
        it("should throw error when message is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(cortiClient.agents.messageSend(agent.id, {} as any)).rejects.toThrow(
                'Missing required key "message"',
            );
        });

        it("should throw error when role is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(
                cortiClient.agents.messageSend(agent.id, {
                    message: {
                        parts: [
                            {
                                kind: "text",
                                text: faker.lorem.sentence(),
                            },
                        ],
                        messageId: faker.string.uuid(),
                        kind: "message",
                    } as any,
                }),
            ).rejects.toThrow('Missing required key "role"');
        });

        it("should throw error when parts is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(
                cortiClient.agents.messageSend(agent.id, {
                    message: {
                        role: "user",
                        messageId: faker.string.uuid(),
                        kind: "message",
                    } as any,
                }),
            ).rejects.toThrow('Missing required key "parts"');
        });

        it("should throw error when messageId is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(
                cortiClient.agents.messageSend(agent.id, {
                    message: {
                        role: "user",
                        parts: [
                            {
                                kind: "text",
                                text: faker.lorem.sentence(),
                            },
                        ],
                        kind: "message",
                    } as any,
                }),
            ).rejects.toThrow('Missing required key "messageId"');
        });

        it("should throw error when kind is missing", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(
                cortiClient.agents.messageSend(agent.id, {
                    message: {
                        role: "user",
                        parts: [
                            {
                                kind: "text",
                                text: faker.lorem.sentence(),
                            },
                        ],
                        messageId: faker.string.uuid(),
                    } as any,
                }),
            ).rejects.toThrow('Missing required key "kind"');
        });

        it("should throw error when text is missing in text part", async () => {
            expect.assertions(1);

            const agent = await createTestAgent(cortiClient);

            await expect(
                cortiClient.agents.messageSend(agent.id, {
                    message: {
                        role: "user",
                        parts: [
                            {
                                kind: "text",
                            } as any,
                        ],
                        messageId: faker.string.uuid(),
                        kind: "message",
                    },
                }),
            ).rejects.toThrow('Missing required key "text"');
        });
    });

    describe("should throw error when invalid parameters are provided", () => {
        it("should throw error when agent ID is invalid format", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.agents.messageSend("invalid-uuid", {
                    message: {
                        role: "user",
                        parts: [
                            {
                                kind: "text",
                                text: faker.lorem.sentence(),
                            },
                        ],
                        messageId: faker.string.uuid(),
                        kind: "message",
                    },
                }),
            ).rejects.toThrow("Status code: 400");
        });

        it("should throw error when agent ID does not exist", async () => {
            expect.assertions(1);

            await expect(
                cortiClient.agents.messageSend(faker.string.uuid(), {
                    message: {
                        role: "user",
                        parts: [
                            {
                                kind: "text",
                                text: faker.lorem.sentence(),
                            },
                        ],
                        messageId: faker.string.uuid(),
                        kind: "message",
                    },
                }),
            ).rejects.toThrow("Status code: 404");
        });
    });
});
