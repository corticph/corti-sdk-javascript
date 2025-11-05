import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import {
  createTestCortiClient,
  createTestInteraction,
  createTestRecording,
  setupConsoleWarnSpy,
  cleanupInteractions
} from './testUtils';

describe('cortiClient.recordings.delete', () => {
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

  it.concurrent('should successfully delete an existing recording without errors or warnings', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const recordingId = await createTestRecording(cortiClient, interactionId);

    const result = await cortiClient.recordings.delete(interactionId, recordingId);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it.concurrent('should not throw error when recording ID does not exist', async () => {
    expect.assertions(1);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

    await expect(
        cortiClient.recordings.delete(interactionId, faker.string.uuid())
    ).resolves.toBe(undefined);
  });

  describe('should throw error when invalid parameters are provided', () => {
    it.concurrent('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.delete('invalid-uuid', faker.string.uuid())
      ).rejects.toThrow('Status code: 400');
    });

    it.concurrent('should throw error when recording ID is invalid format', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.recordings.delete(interactionId, 'invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it.concurrent('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.delete(faker.string.uuid(), faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });

    it.concurrent('should throw error when interaction ID is null', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.delete(null as any, faker.string.uuid())
      ).rejects.toThrow('Expected string. Received null.');
    });

    it.concurrent('should throw error when recording ID is null', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.recordings.delete(interactionId, null as any)
      ).rejects.toThrow('Expected string. Received null.');
    });

    it.concurrent('should throw error when interaction ID is undefined', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.delete(undefined as any, faker.string.uuid())
      ).rejects.toThrow('Expected string. Received undefined.');
    });

    it.concurrent('should throw error when recording ID is undefined', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.recordings.delete(interactionId, undefined as any)
      ).rejects.toThrow('Expected string. Received undefined.');
    });
  });
}); 