import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestRecording,
  createTestTranscript,
  setupConsoleWarnSpy,
  cleanupInteractions
} from './testUtils';

describe('cortiClient.transcripts.list', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: MockInstance;
  const createdInteractionIds: string[] = [];

  beforeAll(() => {
    cortiClient = createTestCortiClient();
  });

  beforeEach(() => {
    consoleWarnSpy = setupConsoleWarnSpy();
  });

  afterEach(async () => {
    consoleWarnSpy.mockRestore();
    await cleanupInteractions(cortiClient, createdInteractionIds);
    createdInteractionIds.length = 0;
  });

  it.concurrent('should return empty list when interaction has no transcripts', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

    const result = await cortiClient.transcripts.list(interactionId);

    expect(result.transcripts).toBe(null);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it.concurrent('should return transcripts when interaction has transcripts', async () => {
    expect.assertions(3);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const recordingId = await createTestRecording(cortiClient, interactionId);
    const transcriptId = await createTestTranscript(cortiClient, interactionId, recordingId);

    const result = await cortiClient.transcripts.list(interactionId);

    expect(result.transcripts?.length || 0).toBeGreaterThan(0);
    expect(result.transcripts?.some(transcript => transcript.id === transcriptId)).toBe(true);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it.concurrent('should return multiple transcripts when interaction has multiple transcripts', async () => {
    expect.assertions(4);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const recordingId1 = await createTestRecording(cortiClient, interactionId);
    const recordingId2 = await createTestRecording(cortiClient, interactionId);
    const transcriptId1 = await createTestTranscript(cortiClient, interactionId, recordingId1);
    const transcriptId2 = await createTestTranscript(cortiClient, interactionId, recordingId2);

    const result = await cortiClient.transcripts.list(interactionId);

    expect(result.transcripts?.length || 0).toBeGreaterThanOrEqual(2);
    expect(result.transcripts?.some(transcript => transcript.id === transcriptId1)).toBe(true);
    expect(result.transcripts?.some(transcript => transcript.id === transcriptId2)).toBe(true);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('full parameter tests', () => {
    it.concurrent('should return transcripts with full parameter set to true', async () => {
      expect.assertions(3);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      const transcriptId = await createTestTranscript(cortiClient, interactionId, recordingId);

      const result = await cortiClient.transcripts.list(interactionId, { full: true });

      expect(result.transcripts?.length || 0).toBeGreaterThan(0);
      expect(result.transcripts?.some(transcript => transcript.id === transcriptId)).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it.concurrent('should return transcripts with full parameter set to false', async () => {
      expect.assertions(3);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      const transcriptId = await createTestTranscript(cortiClient, interactionId, recordingId);

      const result = await cortiClient.transcripts.list(interactionId, { full: false });

      expect(result.transcripts?.length || 0).toBeGreaterThan(0);
      expect(result.transcripts?.some(transcript => transcript.id === transcriptId)).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it.concurrent('should return different responses when full parameter is true vs false', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await createTestTranscript(cortiClient, interactionId, recordingId);

      const resultFull = await cortiClient.transcripts.list(interactionId, { full: true });
      const resultBasic = await cortiClient.transcripts.list(interactionId, { full: false });

      expect(resultFull.transcripts?.length || 0).toBeGreaterThan(0);
      expect(resultBasic.transcripts?.length || 0).toBeGreaterThan(0);
      expect(JSON.stringify(resultFull)).not.toBe(JSON.stringify(resultBasic));
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should throw error when invalid parameters are provided', () => {
    it.concurrent('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.list('invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it.concurrent('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.list(faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });

    it.concurrent('should throw error when interaction ID is null', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.list(null as any)
      ).rejects.toThrow('Expected string. Received null.');
    });

    it.concurrent('should throw error when interaction ID is undefined', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.transcripts.list(undefined as any)
      ).rejects.toThrow('Expected string. Received undefined.');
    });
  });
}); 