import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestFacts,
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.facts.list', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: jest.SpyInstance;
  const createdInteractionIds: string[] = [];

  beforeAll(() => {
    cortiClient = createTestCortiClient();
  });

  beforeEach(() => {
    consoleWarnSpy = setupConsoleWarnSpy();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should return empty list when interaction has no facts', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

    const result = await cortiClient.facts.list(interactionId);

    expect(result.facts.length).toBe(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should return facts when interaction has facts', async () => {
    expect.assertions(3);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const factIds = await createTestFacts(cortiClient, interactionId, 1);
    const factId = factIds[0];

    const result = await cortiClient.facts.list(interactionId);

    expect(result.facts.length).toBeGreaterThan(0);
    expect(result.facts.some((fact: any) => fact.id === factId)).toBe(true);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.list('invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.list(faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });
  });
}); 