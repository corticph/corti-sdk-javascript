import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction, 
  cleanupInteractions, 
  setupConsoleWarnSpy, 
  getValidTemplateKeyAndLanguage,
  getValidFactGroups,
  getValidSectionKeys
} from './testUtils';

describe('cortiClient.documents.create', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: jest.SpyInstance;
  let createdInteractionIds: string[] = [];
  let templateKey: string;
  let outputLanguage: string;
  let validFactGroups: string[] = [];
  let validSectionKeys: string[] = [];

  beforeAll(async () => {
    cortiClient = createTestCortiClient();
    const templateData = await getValidTemplateKeyAndLanguage(cortiClient);
    templateKey = templateData.templateKey;
    outputLanguage = templateData.outputLanguage;
    validFactGroups = await getValidFactGroups(cortiClient);
    validSectionKeys = await getValidSectionKeys(cortiClient);
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

  describe('should create document with only required values', () => {
    it('should create document with DocumentsCreateRequestWithTemplateKey using facts context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            source: 'user',
          }],
        }],
        templateKey,
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplateKey using transcript context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'transcript',
          data: {
            text: faker.lorem.paragraphs(2),
            start: faker.number.int({ min: 0, max: 1000 }),
            end: faker.number.int({ min: 1001, max: 5000 }),
            channel: faker.number.int({ min: 0, max: 1 }),
            participant: faker.number.int({ min: 0, max: 1 }),
            speakerId: faker.number.int({ min: 1, max: 10 }),
          },
        }],
        templateKey,
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplateKey using string context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'string',
          data: faker.lorem.paragraph(),
        }],
        templateKey,
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using facts context and sectionKeys', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            source: 'user',
          }],
        }],
        template: {
          sectionKeys: [faker.helpers.arrayElement(validSectionKeys)]
        },
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using transcript context and sectionKeys', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'transcript',
          data: {
            text: faker.lorem.paragraphs(2),
            start: faker.number.int({ min: 0, max: 1000 }),
            end: faker.number.int({ min: 1001, max: 5000 }),
            channel: faker.number.int({ min: 0, max: 1 }),
            participant: faker.number.int({ min: 0, max: 1 }),
            speakerId: faker.number.int({ min: 1, max: 10 }),
          },
        }],
        template: {
          sectionKeys: [faker.helpers.arrayElement(validSectionKeys)]
        },
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using string context and sectionKeys', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'string',
          data: faker.lorem.paragraph(),
        }],
        template: {
          sectionKeys: [faker.helpers.arrayElement(validSectionKeys)]
        },
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
});

  describe('should create document with all optional values', () => {
    it('should create document with DocumentsCreateRequestWithTemplateKey using facts context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'user',
          }],
        }],
        templateKey,
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplateKey using transcript context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'transcript',
          data: {
            text: faker.lorem.paragraphs(2),
            start: faker.number.int({ min: 0, max: 1000 }),
            end: faker.number.int({ min: 1001, max: 5000 }),
            channel: faker.number.int({ min: 0, max: 1 }),
            participant: faker.number.int({ min: 0, max: 1 }),
            speakerId: faker.number.int({ min: 1, max: 10 }),
          },
        }],
        templateKey,
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplateKey using string context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'string',
          data: faker.lorem.paragraph(),
        }],
        templateKey,
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using facts context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'user',
          }],
        }],
        template: {
          documentName: faker.lorem.words(3),
          additionalInstructions: faker.lorem.sentence(),
          sectionKeys: [
            faker.helpers.arrayElement(validSectionKeys),
            faker.helpers.arrayElement(validSectionKeys)
          ],
        },
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using transcript context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'transcript',
          data: {
            text: faker.lorem.paragraphs(2),
            start: faker.number.int({ min: 0, max: 1000 }),
            end: faker.number.int({ min: 1001, max: 5000 }),
            channel: faker.number.int({ min: 0, max: 1 }),
            participant: faker.number.int({ min: 0, max: 1 }),
            speakerId: faker.number.int({ min: 1, max: 10 }),
          },
        }],
        template: {
          documentName: faker.lorem.words(3),
          additionalInstructions: faker.lorem.sentence(),
          sectionKeys: [
            faker.helpers.arrayElement(validSectionKeys),
            faker.helpers.arrayElement(validSectionKeys)
          ],
        },
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using string context', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'string',
          data: faker.lorem.paragraph(),
        }],
        template: {
          documentName: faker.lorem.words(3),
          additionalInstructions: faker.lorem.sentence(),
          sectionKeys: [
            faker.helpers.arrayElement(validSectionKeys),
            faker.helpers.arrayElement(validSectionKeys)
          ],
        },
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should create document with all source enum values in facts context', () => {
    it('should create document with DocumentsCreateRequestWithTemplateKey using source: core', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'core',
          }],
        }],
        templateKey,
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplateKey using source: system', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'system',
          }],
        }],
        templateKey,
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplateKey using source: user', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'user',
          }],
        }],
        templateKey,
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using source: core', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'core',
          }],
        }],
        template: {
          documentName: faker.lorem.words(3),
          additionalInstructions: faker.lorem.sentence(),
          sectionKeys: [
            faker.helpers.arrayElement(validSectionKeys),
            faker.helpers.arrayElement(validSectionKeys)
          ],
        },
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using source: system', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'system',
          }],
        }],
        template: {
          documentName: faker.lorem.words(3),
          additionalInstructions: faker.lorem.sentence(),
          sectionKeys: [
            faker.helpers.arrayElement(validSectionKeys),
            faker.helpers.arrayElement(validSectionKeys)
          ],
        },
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create document with DocumentsCreateRequestWithTemplate using source: user', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const result = await cortiClient.documents.create(interactionId, {
        context: [{
          type: 'facts',
          data: [{
            text: faker.lorem.sentence(),
            group: faker.helpers.arrayElement(validFactGroups),
            source: 'user',
          }],
        }],
        template: {
          documentName: faker.lorem.words(3),
          additionalInstructions: faker.lorem.sentence(),
          sectionKeys: [
            faker.helpers.arrayElement(validSectionKeys),
            faker.helpers.arrayElement(validSectionKeys)
          ],
        },
        name: faker.lorem.words(3),
        outputLanguage: "en",
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should handle errors when required parameters are missing', () => {
    it('should throw error when context is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          templateKey,
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Missing required key "context"');
    });

    it('should throw error when context is empty array', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [],
          templateKey,
          outputLanguage: "en",
        })
      ).rejects.toThrow('BadRequestError');
    });

    it('should throw error when outputLanguage is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'facts',
            data: [{
              text: faker.lorem.sentence(),
              group: faker.helpers.arrayElement(validFactGroups),
              source: 'user',
            }],
          }],
          templateKey,
        } as any)
      ).rejects.toThrow('Missing required key "outputLanguage"');
    });

    it('should throw error when templateKey is missing for DocumentsCreateRequestWithTemplateKey', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'facts',
            data: [{
              text: faker.lorem.sentence(),
              group: faker.helpers.arrayElement(validFactGroups),
              source: 'user',
            }],
          }],
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Missing required key "templateKey"');
    });

    it('should throw error when text is missing in facts context', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'facts',
            data: [{
              group: faker.helpers.arrayElement(validFactGroups),
              source: 'user',
            }],
          }],
          templateKey,
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Missing required key "text"');
    });

    it('should throw error when source is missing in facts context', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'facts',
            data: [{
              text: faker.lorem.sentence(),
              group: faker.helpers.arrayElement(validFactGroups),
            }],
          }],
          templateKey,
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Missing required key "source"');
    });

    it('should throw error when transcript text is missing in transcript context', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'transcript',
            data: {
              start: faker.number.int({ min: 0, max: 1000 }),
              end: faker.number.int({ min: 1001, max: 5000 }),
              channel: faker.number.int({ min: 0, max: 1 }),
              participant: faker.number.int({ min: 0, max: 1 }),
              speakerId: faker.number.int({ min: 1, max: 10 }),
            },
          }],
          templateKey,
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Missing required key "text"');
    });

    it('should throw error when string data is missing in string context', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'string',
            data: undefined,
          }],
          templateKey,
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Expected string. Received undefined.');
    });

    it('should throw error when template is missing for DocumentsCreateRequestWithTemplate', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'facts',
            data: [{
              text: faker.lorem.sentence(),
              group: faker.helpers.arrayElement(validFactGroups),
              source: 'user',
            }],
          }],
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Missing required key "template"');
    });

    it('should throw error when context type is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'invalid_type',
            data: 'some data',
          }],
          templateKey,
          outputLanguage: "en",
        } as any)
      ).rejects.toThrow('Received "invalid_type"');
    });

    it('should throw error when outputLanguage is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      await expect(
        cortiClient.documents.create(interactionId, {
          context: [{
            type: 'facts',
            data: [{
              text: faker.lorem.sentence(),
              group: faker.helpers.arrayElement(validFactGroups),
              source: 'user',
            }],
          }],
          templateKey,
          outputLanguage: "invalid_language",
        })
      ).rejects.toThrow('BadRequestError');
    });
  });
});
