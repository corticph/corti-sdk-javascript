import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestRecording,
  setupConsoleWarnSpy,
  cleanupInteractions
} from './testUtils';

describe('cortiClient.recordings.list', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: jest.SpyInstance;
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

  it('should return empty list when interaction has no recordings', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

    const result = await cortiClient.recordings.list(interactionId);

    expect(result.recordings.length).toBe(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should return recordings when interaction has recordings', async () => {
    expect.assertions(3);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const recordingId = await createTestRecording(cortiClient, interactionId);

    const result = await cortiClient.recordings.list(interactionId);

    expect(result.recordings.length).toBeGreaterThan(0);
    expect(result.recordings.includes(recordingId)).toBe(true);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should return multiple recordings when interaction has multiple recordings', async () => {
    expect.assertions(4);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const recordingId1 = await createTestRecording(cortiClient, interactionId);
    const recordingId2 = await createTestRecording(cortiClient, interactionId);

    const result = await cortiClient.recordings.list(interactionId);

    expect(result.recordings.length).toBeGreaterThanOrEqual(2);
    expect(result.recordings.includes(recordingId1)).toBe(true);
    expect(result.recordings.includes(recordingId2)).toBe(true);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.list('invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.list(faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when interaction ID is null', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.list(null as any)
      ).rejects.toThrow('Expected string. Received null.');
    });

    it('should throw error when interaction ID is undefined', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.list(undefined as any)
      ).rejects.toThrow('Expected string. Received undefined.');
    });
  });
}); 