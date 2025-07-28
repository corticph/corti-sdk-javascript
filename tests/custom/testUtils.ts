import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';

/**
 * Creates a CortiClient instance configured for testing
 */
export function createTestCortiClient(): CortiClient {
  return new CortiClient({
    environment: process.env.CORTI_ENVIRONMENT
        // || 'eu'
        || 'dev-weu',
    tenantName: process.env.CORTI_TENANT_NAME
        // || 'base'
        || 'copilotdeveu',
    auth: {
      clientId: process.env.CORTI_CLIENT_ID
          // || 'test-e10035-test'
          || 'markitosha-580b7906-2d09-48d5-9aa3-c638b6d0d7a4-test',
      clientSecret: process.env.CORTI_CLIENT_SECRET
          // || 'fBEHs8Ts5GMKfawX5n2vr9m0s00KXojg'
          || 'hqO2fiOVmHhZI6rsIFEcQKivRXiNoXae',
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

  return response.id;
}