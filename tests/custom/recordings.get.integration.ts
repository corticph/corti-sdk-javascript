import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import { createReadStream, readFileSync, createWriteStream } from 'fs';
import { Readable } from 'stream';
import { 
  createTestCortiClient, 
  createTestInteraction, 
  createTestRecording,
  cleanupInteractions, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.recordings.get', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: MockInstance;
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

  describe('should get recording from server-side', () => {
    it.concurrent('should get recording using stream() method without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const getResponse = await cortiClient.recordings.get(interactionId, recordingId);

      expect(getResponse).toBeDefined();
      expect(getResponse.bodyUsed).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      const webStream = getResponse.stream() as ReadableStream<Uint8Array>;
      expect(webStream).toBeInstanceOf(ReadableStream);
    });

    it.concurrent('should get recording using blob() method without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const getResponse = await cortiClient.recordings.get(interactionId, recordingId);

      expect(getResponse).toBeDefined();
      expect(getResponse.bodyUsed).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      const blob = await getResponse.blob();
      expect(blob).toBeInstanceOf(Blob);
    });

    it.concurrent('should get recording using arrayBuffer() method without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const getResponse = await cortiClient.recordings.get(interactionId, recordingId);

      expect(getResponse).toBeDefined();
      expect(getResponse.bodyUsed).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      const arrayBuffer = await getResponse.arrayBuffer();
      expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
    });

    it.concurrent('should verify downloaded file is not corrupted', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const getResponse = await cortiClient.recordings.get(interactionId, recordingId);

      const originalFileBuffer = readFileSync('tests/custom/trouble-breathing.mp3');
      const originalSize = originalFileBuffer.length;

      const downloadedArrayBuffer = await getResponse.arrayBuffer();
      const downloadedSize = downloadedArrayBuffer.byteLength;

      expect(getResponse).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(downloadedSize).toBe(originalSize);
      expect(downloadedSize).toBeGreaterThan(0);
    });
  });

  describe('should handle get errors', () => {
    it.concurrent('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.get('invalid-uuid', faker.string.uuid())
      ).rejects.toThrow('Status code: 400');
    });

    it.concurrent('should throw error when recording ID is invalid format', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.recordings.get(interactionId, 'invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it.concurrent('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.get(faker.string.uuid(), faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });

    it.concurrent('should throw error when recording ID does not exist', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.recordings.get(interactionId, faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });

    it.concurrent('should throw error when interaction ID is null', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.get(null as any, faker.string.uuid())
      ).rejects.toThrow('Expected string. Received null.');
    });

    it.concurrent('should throw error when recording ID is null', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.recordings.get(interactionId, null as any)
      ).rejects.toThrow('Expected string. Received null.');
    });

    it.concurrent('should throw error when interaction ID is undefined', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.recordings.get(undefined as any, faker.string.uuid())
      ).rejects.toThrow('Expected string. Received undefined.');
    });

    it.concurrent('should throw error when recording ID is undefined', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.recordings.get(interactionId, undefined as any)
      ).rejects.toThrow('Expected string. Received undefined.');
    });
  });
}); 