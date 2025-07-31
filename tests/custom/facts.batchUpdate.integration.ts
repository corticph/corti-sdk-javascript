import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestFacts,
  cleanupInteractions, 
  setupConsoleWarnSpy, 
  getValidFactGroups 
} from './testUtils';

describe('cortiClient.facts.batchUpdate', () => {
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

  describe('should batch update facts with minimal fields', () => {
    it('should batch update single fact with empty request (no changes) without errors or warnings', async () => {
      expect.assertions(3);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [{
          factId: factIds[0],
        }],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(1);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should batch update single fact with only text without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);
      const newText = faker.lorem.sentence();

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [{
          factId: factIds[0],
          text: newText,
        }],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(1);
      expect(result.facts[0].text).toBe(newText);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should batch update single fact with only group without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);
      const newGroup = faker.helpers.arrayElement(validFactGroups);

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [{
          factId: factIds[0],
          group: newGroup,
        }],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(1);
      expect(result.facts[0].group).toBe(newGroup);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should batch update single fact with only isDiscarded without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [{
          factId: factIds[0],
          isDiscarded: true,
        }],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(1);
      expect(result.facts[0].isDiscarded).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should batch update multiple facts', () => {
    it('should batch update multiple facts with different fields without errors or warnings', async () => {
      expect.assertions(6);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 3);
      const newText1 = faker.lorem.sentence();
      const newGroup2 = faker.helpers.arrayElement(validFactGroups);

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [
          {
            factId: factIds[0],
            text: newText1,
          },
          {
            factId: factIds[1],
            group: newGroup2,
          },
          {
            factId: factIds[2],
            isDiscarded: true,
          },
        ],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(3);
      expect(result.facts[0].text).toBe(newText1);
      expect(result.facts[1].group).toBe(newGroup2);
      expect(result.facts[2].isDiscarded).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should batch update multiple facts with all fields without errors or warnings', async () => {
      expect.assertions(9);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 2);
      const newText1 = faker.lorem.sentence();
      const newGroup1 = faker.helpers.arrayElement(validFactGroups);
      const newText2 = faker.lorem.sentence();
      const newGroup2 = faker.helpers.arrayElement(validFactGroups);

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [
          {
            factId: factIds[0],
            text: newText1,
            group: newGroup1,
            isDiscarded: false,
          },
          {
            factId: factIds[1],
            text: newText2,
            group: newGroup2,
            isDiscarded: true,
          },
        ],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(2);
      expect(result.facts[0].text).toBe(newText1);
      expect(result.facts[0].group).toBe(newGroup1);
      expect(result.facts[0].isDiscarded).toBe(false);
      expect(result.facts[1].text).toBe(newText2);
      expect(result.facts[1].group).toBe(newGroup2);
      expect(result.facts[1].isDiscarded).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should batch update facts with isDiscarded boolean values', () => {
    it('should batch update fact with isDiscarded set to true without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [{
          factId: factIds[0],
          isDiscarded: true,
        }],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(1);
      expect(result.facts[0].isDiscarded).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should batch update fact with isDiscarded set to false without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);

      const result = await cortiClient.facts.batchUpdate(interactionId, {
        facts: [{
          factId: factIds[0],
          isDiscarded: false,
        }],
      });

      expect(result).toBeDefined();
      expect(result.facts).toHaveLength(1);
      expect(result.facts[0].isDiscarded).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  it('should batch update facts with all optional parameters without errors or warnings', async () => {
    expect.assertions(7);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const factIds = await createTestFacts(cortiClient, interactionId, 2);
    const newText1 = faker.lorem.sentence();
    const newGroup1 = faker.helpers.arrayElement(validFactGroups);
    const newText2 = faker.lorem.sentence();
    const newGroup2 = faker.helpers.arrayElement(validFactGroups);

    const result = await cortiClient.facts.batchUpdate(interactionId, {
      facts: [
        {
          factId: factIds[0],
          text: newText1,
          group: newGroup1,
          isDiscarded: true,
        },
        {
          factId: factIds[1],
          text: newText2,
          group: newGroup2,
          isDiscarded: false,
        },
      ],
    });

    expect(result).toBeDefined();
    expect(result.facts).toHaveLength(2);
    expect(result.facts[0].text).toBe(newText1);
    expect(result.facts[0].group).toBe(newGroup1);
    expect(result.facts[0].isDiscarded).toBe(true);
    expect(result.facts[1].isDiscarded).toBe(false);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);

      await expect(
        cortiClient.facts.batchUpdate('invalid-uuid', {
          facts: [{
            factId: factIds[0],
            text: faker.lorem.sentence(),
          }],
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when fact ID is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.batchUpdate(interactionId, {
          facts: [{
            factId: 'invalid-uuid',
            text: faker.lorem.sentence(),
          }],
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const factIds = await createTestFacts(cortiClient, interactionId, 1);

      await expect(
        cortiClient.facts.batchUpdate(faker.string.uuid(), {
          facts: [{
            factId: factIds[0],
            text: faker.lorem.sentence(),
          }],
        })
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when fact ID does not exist', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.batchUpdate(interactionId, {
          facts: [{
            factId: faker.string.uuid(),
            text: faker.lorem.sentence(),
          }],
        })
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when facts array is empty', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.batchUpdate(interactionId, {
          facts: [],
        })
      ).rejects.toThrow();
    });

    it('should throw error when factId is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.facts.batchUpdate(interactionId, {
          facts: [{
            text: faker.lorem.sentence(),
          }],
        } as any)
      ).rejects.toThrow('Missing required key "factId"');
    });
  });
}); 