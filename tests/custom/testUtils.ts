import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { createReadStream } from 'fs';
import { StreamSocket } from '../../src/custom/CustomStreamSocket';
import { TranscribeSocket } from '../../src/custom/CustomTranscribeSocket';

/**
 * Creates a CortiClient instance configured for testing
 */
export function createTestCortiClient(): CortiClient {
  if (
      !process.env.CORTI_ENVIRONMENT
      || !process.env.CORTI_TENANT_NAME
      || !process.env.CORTI_CLIENT_ID
      || !process.env.CORTI_CLIENT_SECRET
  ) {
    throw new Error('Missing required environment variables for CortiClient');
  }

  return new CortiClient({
    environment: process.env.CORTI_ENVIRONMENT,
    tenantName: process.env.CORTI_TENANT_NAME,
    auth: {
      clientId: process.env.CORTI_CLIENT_ID,
      clientSecret: process.env.CORTI_CLIENT_SECRET,
    },
  });
}

/**
 * Creates a test interaction using faker data
 * Optionally pushes the created interactionId to the provided array
 * Allows overriding default interaction data
 */
export async function createTestInteraction(
  cortiClient: CortiClient, 
  createdInteractionIds?: string[], 
  overrideData?: any
): Promise<string> {
  const defaultData = {
    encounter: {
      identifier: faker.string.alphanumeric(20),
      status: 'planned',
      type: 'first_consultation',
    },
  };

  const interactionData = overrideData 
    ? {
        ...defaultData,
        ...overrideData,
        encounter: overrideData.encounter 
          ? { ...defaultData.encounter, ...overrideData.encounter }
          : defaultData.encounter
      }
    : defaultData;
  
  const interaction = await cortiClient.interactions.create(interactionData);

  if (createdInteractionIds) {
    createdInteractionIds.push(interaction.interactionId);
  }

  await pause();

  return interaction.interactionId;
}

/**
 * Cleans up interactions by deleting them (this will cascade delete all associated resources)
 */
export async function cleanupInteractions(cortiClient: CortiClient, interactionIds: string[]): Promise<void> {
  for (const interactionId of interactionIds) {
    try {
      await cortiClient.interactions.delete(interactionId);
    } catch (error) {
      console.warn(`Failed to clean up interaction ${interactionId}:`, error);
    }
  }
}

/**
 * Sets up console.warn spy for tests
 */
export function setupConsoleWarnSpy(): jest.SpyInstance {
  return jest.spyOn(console, 'warn').mockImplementation(() => {});
}

/**
 * Adds a pause to ensure backend processing is complete
 * @param ms - Duration to pause in milliseconds (default: 1000ms)
 */
export function pause(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets valid fact groups from the API, with fallback to 'other'
 */
export async function getValidFactGroups(cortiClient: CortiClient): Promise<string[]> {
  const factGroupsResponse = await cortiClient.facts.factGroupsList();
  const factGroups = factGroupsResponse.data
    .map(factGroup => factGroup.key)
    .filter((key): key is string => key !== undefined);
  
  return [...new Set(factGroups)];
}

export async function getValidSectionKeys(cortiClient: CortiClient): Promise<string[]> {
  const sectionsResponse = await cortiClient.templates.sectionList();
  const sectionKeys = sectionsResponse.data
    .map(section => section.key)
    .filter((key): key is string => key !== undefined);
  
  return [...new Set(sectionKeys)];
}

/**
 * Gets a valid template key and output language from the API for document tests
 */
export async function getValidTemplateKeyAndLanguage(cortiClient: CortiClient): Promise<{ templateKey: string, outputLanguage: string }> {
  const templatesList = await cortiClient.templates.list();
  const first = templatesList.data?.[0];

  if (!first) {
    throw new Error('No templates available for testing');
  }

  const outputLanguage = first.translations?.[0]?.languagesId || 'en';

  return { templateKey: first.key, outputLanguage };
}

/**
 * Creates test facts using faker data and returns their IDs
 * Used for testing facts.update functionality  
 */
export async function createTestFacts(cortiClient: CortiClient, interactionId: string, count: number = 1): Promise<string[]> {
  const validFactGroups = await getValidFactGroups(cortiClient);
  
  const factsToCreate = Array.from({ length: count }, () => ({
    text: faker.lorem.sentence(),
    group: faker.helpers.arrayElement(validFactGroups),
  }));

  const response = await cortiClient.facts.create(interactionId, {
    facts: factsToCreate,
  });

  const factIds = response.facts
    .map(fact => fact.id)
    .filter((id): id is string => id !== undefined);

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
    context: [{
      type: 'string',
      data: faker.lorem.paragraph(),
    }],
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
  createdRecordingIds?: string[]
): Promise<string> {
  const uploadFile = createReadStream('tests/custom/trouble-breathing.mp3', {
    autoClose: true
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
  recordingId: string
): Promise<string> {
  // Note: Using a supported language/model combination
  // This may need to be updated based on actual supported languages
  const transcriptResult = await cortiClient.transcripts.create(interactionId, {
    recordingId,
    primaryLanguage: 'en',
    modelName: 'premier',
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
  } = {}
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const { messages = [], rejectOnWrongMessage = false, timeoutMs = 10000 } = options;
    
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout waiting for message type: ${expectedMessageType}`));
    }, timeoutMs);

    // Check if message already exists in the array
    if (messages.some((msg: any) => msg.type === expectedMessageType)) {
      clearTimeout(timeout);
      resolve();
      return;
    }

    const messageHandler = (data: any) => {
      console.log('incoming message', data);
      
      // Add message to the array
      messages.push(data);

      if (data.type === expectedMessageType) {
        clearTimeout(timeout);
        resolve();
      } else if (rejectOnWrongMessage) {
        clearTimeout(timeout);
        reject(new Error(`Unexpected message type: ${data.type}, expected: ${expectedMessageType}`));
      }
    };

    streamSocket.on('message', messageHandler);

    streamSocket.on('error', (error: any) => {
      clearTimeout(timeout);
      reject(new Error(`WebSocket error: ${error.message}`));
    });
  });
}