import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  createTestRecording,
  cleanupInteractions, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.transcripts.create', () => {
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

  describe('should create transcript with only required values', () => {
    it('should create transcript with only required fields without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
        recordingId,
        primaryLanguage: 'en',
        modelName: 'premier',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // FIXME: Skipped because modelName must match language - for "en" only "premier" is valid -- https://linear.app/corti/issue/ASR-416/request-for-a-languages-endpoint-to-return-supported-languages-for
  describe.skip('should create transcript with all modelName enum values', () => {
    it('should create transcript with modelName "base"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
        recordingId,
        primaryLanguage: 'en',
        modelName: 'base',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create transcript with modelName "enhanced"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
        recordingId,
        primaryLanguage: 'en',
        modelName: 'enhanced',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create transcript with modelName "premier"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
        recordingId,
        primaryLanguage: 'en',
        modelName: 'premier',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should create transcript with all participant role enum values', () => {
    it('should create transcript with participant role "doctor"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
          participants: [{
            channel: 0,
            role: 'doctor',
          }],
        });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create transcript with participant role "patient"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
          participants: [{
            channel: 0,
            role: 'patient',
          }],
        });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create transcript with participant role "multiple"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
          participants: [{
            channel: 0,
            role: 'multiple',
          }],
        });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create transcript with multiple participants', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);
      
      const result = await cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
          participants: [
            {
              channel: 0,
              role: 'doctor',
            },
            {
              channel: 1,
              role: 'patient',
            },
          ],
        });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  it('should create transcript with all optional parameters without errors or warnings', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const recordingId = await createTestRecording(cortiClient, interactionId);
    
    const result = await cortiClient.transcripts.create(interactionId, {
        recordingId,
        primaryLanguage: 'en',
        modelName: 'premier',
        isDictation: faker.datatype.boolean(),
        isMultichannel: faker.datatype.boolean(),
        diarize: faker.datatype.boolean(),
        participants: [
          {
            channel: faker.number.int({ min: 0, max: 1 }),
            role: faker.helpers.arrayElement(['doctor', 'patient', 'multiple']),
          },
          {
            channel: faker.number.int({ min: 0, max: 1 }),
            role: faker.helpers.arrayElement(['doctor', 'patient', 'multiple']),
          },
        ],
      });

    expect(result).toBeDefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when required fields are missing', () => {
    it('should throw error when recordingId is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          primaryLanguage: 'en',
          modelName: 'premier',
        } as any)
      ).rejects.toThrow('Missing required key "recordingId"');
    });

    it('should throw error when primaryLanguage is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId,
          modelName: 'premier',
        } as any)
      ).rejects.toThrow('Missing required key "primaryLanguage"');
    });

    it('should throw error when modelName is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
        } as any)
      ).rejects.toThrow('Missing required key "modelName"');
    });

    it('should throw error when participant channel is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
          participants: [{
            role: 'doctor',
          } as any],
        })
      ).rejects.toThrow('Missing required key "channel"');
    });

    it('should throw error when participant role is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
          participants: [{
            channel: 0,
          } as any],
        })
      ).rejects.toThrow('Missing required key "role"');
    });

    it('should throw error when interaction ID is invalid format', async () => {
      expect.assertions(1);

      const recordingId = faker.string.uuid();

      await expect(
        cortiClient.transcripts.create('invalid-uuid', {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      const recordingId = faker.string.uuid();

      await expect(
        cortiClient.transcripts.create(faker.string.uuid(), {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
        })
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when recordingId does not exist', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId: faker.string.uuid(),
          primaryLanguage: 'en',
          modelName: 'premier',
        })
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when recordingId is invalid format', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId: 'invalid-uuid',
          primaryLanguage: 'en',
          modelName: 'premier',
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when primaryLanguage is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'invalid-language',
          modelName: 'premier',
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when modelName is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'invalid-model' as any,
        })
      ).rejects.toThrow('Expected enum. Received "invalid-model"');
    });

    it('should throw error when participant role is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const recordingId = await createTestRecording(cortiClient, interactionId);

      await expect(
        cortiClient.transcripts.create(interactionId, {
          recordingId,
          primaryLanguage: 'en',
          modelName: 'premier',
          participants: [{
            channel: 0,
            role: 'invalid-role' as any,
          }],
        })
      ).rejects.toThrow('Expected enum. Received "invalid-role"');
    });
  });
}); 