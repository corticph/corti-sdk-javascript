import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import { createReadStream, readFileSync } from 'fs';
import { 
  createTestCortiClient, 
  createTestInteraction, 
  cleanupInteractions, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.recordings.upload', () => {
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

  describe('should upload recording from server-side file stream', () => {
    it.concurrent('should upload trouble-breathing.mp3 using createReadStream without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const file = createReadStream('tests/custom/trouble-breathing.mp3', {
        autoClose: true
      });

      const result = await cortiClient.recordings.upload(file, interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it.concurrent('should upload trouble-breathing.mp3 using File object without errors or warnings', async () => {
        expect.assertions(2);
  
        const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

        const fileBuffer = readFileSync('tests/custom/trouble-breathing.mp3');
        
        // Create a File object (simulating browser environment)
        const file = new File([fileBuffer], 'trouble-breathing.mp3', {
          type: 'audio/mpeg'
        });
  
        const result = await cortiClient.recordings.upload(file, interactionId);
  
        expect(result).toBeDefined();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
  });

  describe('should handle upload errors', () => {
    it.concurrent('should throw error when uploading to non-existent interaction', async () => {
      expect.assertions(1);

      const nonExistentInteractionId = faker.string.uuid();
      const file = createReadStream('tests/custom/trouble-breathing.mp3', {
        autoClose: true
      });

      await expect(
        cortiClient.recordings.upload(file, nonExistentInteractionId)
      ).rejects.toThrow('Status code: 404');
    });

    it.concurrent('should throw error when uploading with invalid interaction ID format', async () => {
      expect.assertions(1);

      const invalidInteractionId = 'invalid-uuid-format';
      const file = createReadStream('tests/custom/trouble-breathing.mp3', {
        autoClose: true
      });

      await expect(
        cortiClient.recordings.upload(file, invalidInteractionId)
      ).rejects.toThrow('Status code: 400');
    });

    it.concurrent('should throw error when uploading with null interaction ID', async () => {
      expect.assertions(1);

      const file = createReadStream('tests/custom/trouble-breathing.mp3', {
        autoClose: true
      });

      await expect(
        cortiClient.recordings.upload(file, null as any)
      ).rejects.toThrow('Expected string. Received null.');
    });

    it.concurrent('should throw error when uploading with undefined interaction ID', async () => {
      expect.assertions(1);

      const file = createReadStream('tests/custom/trouble-breathing.mp3', {
        autoClose: true
      });

      await expect(
        cortiClient.recordings.upload(file, undefined as any)
      ).rejects.toThrow('Expected string. Received undefined.');
    });
  });

}); 