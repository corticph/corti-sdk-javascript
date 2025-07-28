import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestDocument,
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.documents.list', () => {
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

  it('should return empty list when interaction has no documents', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

    const result = await cortiClient.documents.list(interactionId);

    expect(result.data.length).toBe(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should return documents when interaction has documents', async () => {
    expect.assertions(3);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const documentId = await createTestDocument(cortiClient, interactionId);

    const result = await cortiClient.documents.list(interactionId);

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.some((doc: any) => doc.id === documentId)).toBe(true);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.documents.list('invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.documents.list(faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });
  });
}); 