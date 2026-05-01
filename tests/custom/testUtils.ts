import { faker } from "@faker-js/faker";
import { createReadStream } from "fs";
import { CortiClient } from "../../src";
import type { CustomStreamSocket as StreamSocket } from "../../src/custom/stream/CustomStreamSocket";
import type { CustomTranscribeSocket as TranscribeSocket } from "../../src/custom/transcribe/CustomTranscribeSocket";

/**
 * Creates a CortiClient instance configured for testing
 */
export function createTestCortiClient(): CortiClient {
    if (
        !process.env.CORTI_ENVIRONMENT ||
        !process.env.CORTI_TENANT_NAME ||
        !process.env.CORTI_CLIENT_ID ||
        !process.env.CORTI_CLIENT_SECRET
    ) {
        throw new Error("Missing required environment variables for CortiClient");
    }

    console.log("Connecting to Corti API with:", {
        environment: process.env.CORTI_ENVIRONMENT,
        tenantName: process.env.CORTI_TENANT_NAME,
        clientId: process.env.CORTI_CLIENT_ID,
    });

    return new CortiClient({
        environment: process.env.CORTI_ENVIRONMENT,
        tenantName: process.env.CORTI_TENANT_NAME,
        auth: {
            clientId: process.env.CORTI_CLIENT_ID,
            clientSecret: process.env.CORTI_CLIENT_SECRET,
        },
    });
}

/** Rethrow with a readable prefix; attach original error as `cause` when available. */
export function rethrowWithContext(context: string, error: unknown): never {
    const inner = error instanceof Error ? error.message : String(error);
    const wrapped = new Error(`${context}: ${inner}`);
    Object.defineProperty(wrapped, "cause", { value: error, enumerable: false });
    throw wrapped;
}

function collectRejectedDeleteFailures(
    kind: string,
    ids: string[],
    results: PromiseSettledResult<unknown>[],
): string[] {
    const failures: string[] = [];
    for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status !== "rejected") {
            continue;
        }

        const id = ids[i];
        const reason = r.reason;
        const detail = reason instanceof Error ? reason.message : String(reason);
        const msg = `Failed to delete ${kind} ${id}: ${detail}`;
        console.warn(msg, reason);
        failures.push(msg);
    }
    return failures;
}

/**
 * Creates a test interaction using faker data.
 * Optionally pass overrides for the interaction payload shape.
 */
export async function createTestInteraction(cortiClient: CortiClient, overrideData?: any): Promise<string> {
    const defaultData = {
        encounter: {
            identifier: faker.string.alphanumeric(20),
            status: "planned",
            type: "first_consultation",
        },
    };

    const interactionData = overrideData
        ? {
              ...defaultData,
              ...overrideData,
              encounter: overrideData.encounter
                  ? { ...defaultData.encounter, ...overrideData.encounter }
                  : defaultData.encounter,
          }
        : defaultData;

    const interaction = await cortiClient.interactions.create(interactionData);

    await pause();

    return interaction.interactionId;
}

/**
 * Deletes all interactions and agents in the current tenant.
 * Used by the empty-state integration suite (see tests/custom/empty-state.ts).
 *
 * Interactions: collect ids via `for await` over `interactions.list()`, then delete all in parallel with
 * `Promise.allSettled`. Failures are logged after that batch settles.
 *
 * Agents: merge ids from `list({ ephemeral: false })` and `list({ ephemeral: true })` (deduped),
 * parallel `Promise.allSettled` deletes; optional `id` omitted on references. Same batch logging behaviour.
 */
export async function purgeIntegrationTenant(cortiClient: CortiClient): Promise<void> {
    const failedDeletes: string[] = [];

    try {
        const page = await cortiClient.interactions.list();
        const interactionIds: string[] = [];

        for await (const row of page) {
            interactionIds.push(String(row.id));
        }

        const interactionResults = await Promise.allSettled(
            interactionIds.map((id) => cortiClient.interactions.delete(id)),
        );
        failedDeletes.push(...collectRejectedDeleteFailures("interaction", interactionIds, interactionResults));
    } catch (error) {
        console.error("purgeIntegrationTenant: interactions phase failed:", error);
        rethrowWithContext("purgeIntegrationTenant interactions phase failed", error);
    }

    try {
        const agentIds = new Set<string>();
        const agentListRequests = [{ ephemeral: false }, { ephemeral: true }] as const;

        for (const request of agentListRequests) {
            const agents = await cortiClient.agents.list(request);
            for (const agent of agents) {
                const { id } = agent;
                if (id != null) {
                    agentIds.add(id);
                }
            }
        }

        const agentIdList = [...agentIds];
        const agentResults = await Promise.allSettled(agentIdList.map((id) => cortiClient.agents.delete(id)));
        failedDeletes.push(...collectRejectedDeleteFailures("agent", agentIdList, agentResults));
    } catch (error) {
        console.error("purgeIntegrationTenant: agents phase failed:", error);
        rethrowWithContext("purgeIntegrationTenant agents phase failed", error);
    }

    if (failedDeletes.length > 0) {
        throw new Error(
            `purgeIntegrationTenant: ${failedDeletes.length} delete(s) failed — ${failedDeletes.join(" | ")}`,
        );
    }
}

/**
 * Sets up console.warn spy for tests
 */
export function setupConsoleWarnSpy(): ReturnType<typeof vi.spyOn> {
    return vi.spyOn(console, "warn").mockImplementation(() => {});
}

/**
 * Adds a pause to ensure backend processing is complete
 * @param ms - Duration to pause in milliseconds (default: 1000ms)
 */
export function pause(ms: number = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gets valid fact groups from the API, with fallback to 'other'
 */
export async function getValidFactGroups(cortiClient: CortiClient): Promise<string[]> {
    const factGroupsResponse = await cortiClient.facts.factGroupsList();
    const factGroups = factGroupsResponse.data
        .map((factGroup) => factGroup.key)
        .filter((key): key is string => key !== undefined);

    return [...new Set(factGroups)];
}

export async function getValidSectionKeys(cortiClient: CortiClient): Promise<string[]> {
    const sectionsResponse = await cortiClient.templates.sectionList();
    const sectionKeys = sectionsResponse.data
        .map((section) => section.key)
        .filter((key): key is string => key !== undefined);

    return [...new Set(sectionKeys)];
}

/**
 * Gets a valid template key and output language from the API for document tests
 */
export async function getValidTemplateKeyAndLanguage(
    cortiClient: CortiClient,
): Promise<{ templateKey: string; outputLanguage: string }> {
    const templatesList = await cortiClient.templates.list();
    const first = templatesList.data?.[0];

    if (!first) {
        throw new Error("No templates available for testing");
    }

    const outputLanguage = first.translations?.[0]?.languageId || "en";

    return { templateKey: first.key, outputLanguage };
}

/**
 * Creates test facts using faker data and returns their IDs
 * Used for testing facts.update functionality
 */
export async function createTestFacts(
    cortiClient: CortiClient,
    interactionId: string,
    count: number = 1,
): Promise<string[]> {
    const validFactGroups = await getValidFactGroups(cortiClient);

    const factsToCreate = Array.from({ length: count }, () => ({
        text: faker.lorem.sentence(),
        group: faker.helpers.arrayElement(validFactGroups),
    }));

    const response = await cortiClient.facts.create(interactionId, {
        facts: factsToCreate,
    });

    const factIds = response.facts.map((fact) => fact.id).filter((id): id is string => id !== undefined);

    await pause();

    return factIds;
}

/**
 * Creates a single test document using faker data and returns its ID
 * Used for testing documents functionality
 */
export async function createTestDocument(cortiClient: CortiClient, interactionId: string): Promise<string> {
    const templateData = await getValidTemplateKeyAndLanguage(cortiClient);

    const response = await cortiClient.documents.create(interactionId, {
        context: [
            {
                type: "string",
                data: faker.lorem.paragraph(),
            },
        ],
        templateKey: templateData.templateKey,
        outputLanguage: templateData.outputLanguage,
    });

    if (!response.id) {
        throw new Error("Document creation failed - no ID returned.");
    }

    await pause();

    return response.id;
}

/**
 * Creates a test recording using the trouble-breathing.mp3 file
 * Optionally pushes the created recordingId to the provided array
 * Used for testing recordings functionality
 */
export async function createTestRecording(
    cortiClient: CortiClient,
    interactionId: string,
    createdRecordingIds?: string[],
): Promise<string> {
    const uploadFile = createReadStream("tests/custom/trouble-breathing.mp3", {
        autoClose: true,
    });

    const uploadResult = await cortiClient.recordings.upload(uploadFile, interactionId);

    if (createdRecordingIds) {
        createdRecordingIds.push(uploadResult.recordingId);
    }

    await pause();

    return uploadResult.recordingId;
}

/**
 * Creates a test transcript for a given interaction and recording
 * Used for testing transcripts functionality
 * Note: This requires a valid language/model combination to work
 */
export async function createTestTranscript(
    cortiClient: CortiClient,
    interactionId: string,
    recordingId: string,
): Promise<string> {
    // Wait for the backend to finish processing the uploaded recording before
    // requesting transcription — 1 s (from createTestRecording) is not enough.
    await pause(5000);

    const transcriptResult = await cortiClient.transcripts.create(interactionId, {
        recordingId,
        primaryLanguage: "en",
    });

    if (!transcriptResult.id) {
        throw new Error("Transcript creation failed - no ID returned.");
    }

    await pause();

    return transcriptResult.id;
}

/**
 * Creates a promise that waits for a specific WebSocket message type
 * Used for testing WebSocket message handling in stream tests
 */
export function waitForWebSocketMessage(
    streamSocket: StreamSocket | TranscribeSocket,
    expectedMessageType: string,
    options: {
        messages?: any[];
        rejectOnWrongMessage?: boolean;
        timeoutMs?: number;
    } = {},
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const { messages = [], rejectOnWrongMessage = false, timeoutMs = 30000 } = options;

        const cleanup = () => {
            streamSocket.off("message");
            streamSocket.off("error");
        };

        const finishResolve = () => {
            clearTimeout(timeout);
            cleanup();
            resolve();
        };

        const finishReject = (error: Error) => {
            clearTimeout(timeout);
            cleanup();
            reject(error);
        };

        const timeout = setTimeout(() => {
            finishReject(new Error(`Timeout waiting for message type: ${expectedMessageType}`));
        }, timeoutMs);

        // Check if message already exists in the array
        if (messages.some((msg: any) => msg.type === expectedMessageType)) {
            finishResolve();
            return;
        }

        const messageHandler = (data: any) => {
            console.log("incoming message", data);

            // Add message to the array
            messages.push(data);

            if (data.type === expectedMessageType) {
                finishResolve();
            } else if (rejectOnWrongMessage) {
                finishReject(new Error(`Unexpected message type: ${data.type}, expected: ${expectedMessageType}`));
            }
        };

        const errorHandler = (error: any) => {
            finishReject(new Error(`WebSocket error: ${error.message}`));
        };

        streamSocket.on("message", messageHandler);
        streamSocket.on("error", errorHandler);
    });
}

/**
 * Creates a test agent using faker data and returns the created agent.
 */
export async function createTestAgent(cortiClient: CortiClient): Promise<any> {
    const agent = await cortiClient.agents.create({
        name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
    });

    if (!agent.id) {
        throw new Error("Agent creation failed - no ID returned.");
    }

    await pause();

    return agent;
}

/**
 * Sends a test message to an agent and returns the response
 * Used for testing agents.messageSend functionality
 */
export async function sendTestMessage(cortiClient: CortiClient, agentId: string, messageText?: string) {
    const message = await cortiClient.agents.messageSend(agentId, {
        message: {
            role: "user",
            parts: [
                {
                    kind: "text",
                    text: messageText || faker.lorem.sentence(),
                },
            ],
            messageId: faker.string.uuid(),
            kind: "message",
        },
    });

    await pause();

    return message;
}
