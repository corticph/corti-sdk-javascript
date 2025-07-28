import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction, 
  cleanupInteractions, 
  setupConsoleWarnSpy, 
  getValidFactGroups 
} from './testUtils';

describe('cortiClient.facts.create', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: jest.SpyInstance;
  let createdInteractionIds: string[] = [];
  let validFactGroups: string[] = [];

  beforeAll(async () => {
    cortiClient = createTestCortiClient();
    validFactGroups = await getValidFactGroups(cortiClient);
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

  const getValidFactGroup = (): string => {
    return faker.helpers.arrayElement(validFactGroups);
  };

  describe('should create facts with only required values', () => {
    it('should create single fact with only required fields without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.facts.create(interactionId, {
        facts: [{
          text: faker.lorem.sentence(),
          group: getValidFactGroup(),
        }],
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create multiple facts with only required fields without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.facts.create(interactionId, {
        facts: [
          {
            text: faker.lorem.sentence(),
            group: getValidFactGroup(),
          },
          {
            text: faker.lorem.sentence(),
            group: getValidFactGroup(),
          },
          {
            text: faker.lorem.sentence(),
            group: getValidFactGroup(),
          },
        ],
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should create facts with all source enum values', () => {
    it('should create fact with source "core"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.facts.create(interactionId, {
        facts: [{
          text: faker.lorem.sentence(),
          group: getValidFactGroup(),
          source: 'core',
        }],
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create fact with source "system"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.facts.create(interactionId, {
        facts: [{
          text: faker.lorem.sentence(),
          group: getValidFactGroup(),
          source: 'system',
        }],
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create fact with source "user"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.facts.create(interactionId, {
        facts: [{
          text: faker.lorem.sentence(),
          group: getValidFactGroup(),
          source: 'user',
        }],
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  it('should create facts with all optional parameters without errors or warnings', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    
    const result = await cortiClient.facts.create(interactionId, {
      facts: [
        {
          text: faker.lorem.paragraph(),
          group: getValidFactGroup(),
          source: 'user',
        },
        {
          text: faker.lorem.paragraph(),
          group: getValidFactGroup(),
          source: 'system',
        },
      ],
    });

    expect(result).toBeDefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when required fields are missing', () => {
    it('should throw error when facts array is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.create(interactionId, {} as any)
      ).rejects.toThrow('Missing required key "facts"');
    });

    it('should throw error when facts array is empty', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.create(interactionId, { facts: [] })
      ).rejects.toThrow();
    });

    it('should throw error when fact text is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.create(interactionId, {
          facts: [{
            group: getValidFactGroup(),
          } as any],
        })
      ).rejects.toThrow('Missing required key "text"');
    });

    it('should throw error when fact group is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.create(interactionId, {
          facts: [{
            text: faker.lorem.sentence(),
          } as any],
        })
      ).rejects.toThrow('Missing required key "group"');
    });

    it('should throw error when interaction ID is invalid', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.create('invalid-uuid', {
          facts: [{
            text: faker.lorem.sentence(),
            group: getValidFactGroup(),
          }],
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.create(faker.string.uuid(), {
          facts: [{
            text: faker.lorem.sentence(),
            group: getValidFactGroup(),
          }],
        })
      ).rejects.toThrow('Status code: 404');
    });
  });
}); 