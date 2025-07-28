import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestDocument,
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.documents.delete', () => {
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

  it('should successfully delete an existing document without errors or warnings', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const documentId = await createTestDocument(cortiClient, interactionId);

    const result = await cortiClient.documents.delete(interactionId, documentId);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.documents.delete('invalid-uuid', faker.string.uuid())
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when document ID is invalid format', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.documents.delete(interactionId, 'invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.documents.delete(faker.string.uuid(), faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });
  });
}); 