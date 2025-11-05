import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import { 
  createTestCortiClient, 
  createTestInteraction,
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.interactions.get', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: MockInstance;
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

  it('should successfully retrieve an existing interaction without errors or warnings', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

    const result = await cortiClient.interactions.get(interactionId);

    expect(result.id).toBe(interactionId);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.get('invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.get(faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });
  });
}); 