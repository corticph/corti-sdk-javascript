import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestRecording,
  createTestTranscript,
  cleanupInteractions, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.transcripts.get', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: jest.SpyInstance;
  let createdInteractionIds: string[] = [];

  beforeAll(() => {
    cortiClient = createTestCortiClient();
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

  it('should successfully retrieve an existing transcript without errors or warnings', async () => {
    expect.assertions(3);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const recordingId = await createTestRecording(cortiClient, interactionId);
    const transcriptId = await createTestTranscript(cortiClient, interactionId, recordingId);
    
    const result = await cortiClient.transcripts.get(interactionId, transcriptId);

    expect(result).toBeDefined();
    expect(result.id).toBe(transcriptId);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should handle get errors', () => {
    it('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.get('invalid-uuid', faker.string.uuid())
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when transcript ID is invalid format', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.transcripts.get(interactionId, 'invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.get(faker.string.uuid(), faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when transcript ID does not exist', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.transcripts.get(interactionId, faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when interaction ID is null', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.get(null as any, faker.string.uuid())
      ).rejects.toThrow('Expected string. Received null.');
    });

    it('should throw error when transcript ID is null', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.transcripts.get(interactionId, null as any)
      ).rejects.toThrow('Expected string. Received null.');
    });

    it('should throw error when interaction ID is undefined', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.get(undefined as any, faker.string.uuid())
      ).rejects.toThrow('Expected string. Received undefined.');
    });

    it('should throw error when transcript ID is undefined', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.transcripts.get(interactionId, undefined as any)
      ).rejects.toThrow('Expected string. Received undefined.');
    });
  });
}); 