import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import {
  createTestCortiClient,
  createTestInteraction,
  createTestDocument,
  cleanupInteractions,
  setupConsoleWarnSpy,
  getValidSectionKeys
} from './testUtils';

describe('cortiClient.documents.update', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: MockInstance;
  let createdInteractionIds: string[] = [];
  let validSectionKeys: string[] = [];

  beforeAll(async () => {
    cortiClient = createTestCortiClient();
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

  describe('should update document with minimal fields', () => {
    it('should update document with empty request (no changes) without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const documentId = await createTestDocument(cortiClient, interactionId);

      const result = await cortiClient.documents.update(interactionId, documentId, {});

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update document with only name without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const documentId = await createTestDocument(cortiClient, interactionId);

      const originalDocument = await cortiClient.documents.get(interactionId, documentId);
      const originalName = originalDocument.name;

      const newName = faker.lorem.words(3);

      const result = await cortiClient.documents.update(interactionId, documentId, {
        name: newName,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe(newName);
      expect(result.name).not.toBe(originalName);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update document with only sections without errors or warnings', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const documentId = await createTestDocument(cortiClient, interactionId);
      const sectionKey = faker.helpers.arrayElement(validSectionKeys);

      const result = await cortiClient.documents.update(interactionId, documentId, {
        sections: [{
          key: sectionKey,
        }],
      });

      expect(result).toBeDefined();
      expect(result.sections).toBeDefined();
      expect(result.sections.some(section => section.key === sectionKey)).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should update document with section variations', () => {
    it('should update document with section containing all optional fields without errors or warnings', async () => {
      expect.assertions(7);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const documentId = await createTestDocument(cortiClient, interactionId);

      const originalDocument = await cortiClient.documents.get(interactionId, documentId);

      const sectionKey = faker.helpers.arrayElement(validSectionKeys);
      const sectionName = faker.lorem.words(3);
      const sectionText = faker.lorem.paragraphs(3);

      const result = await cortiClient.documents.update(interactionId, documentId, {
        sections: [{
          key: sectionKey,
          name: sectionName,
          text: sectionText,
          sort: 0,
        }],
      });

      expect(result).toBeDefined();
      expect(result.sections).toBeDefined();

      const updatedSection = result.sections.find(section => section.key === sectionKey);
      const originalSection = originalDocument.sections.find(section => section.key === sectionKey);

      expect(updatedSection).toBeDefined();
      expect(updatedSection?.name).toBe(sectionName);
      expect(updatedSection?.text).toBe(sectionText);

      const hasChanged = !originalSection ||
        updatedSection?.name !== originalSection.name ||
        updatedSection?.text !== originalSection.text;
      expect(hasChanged).toBe(true);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update document with empty sections array without errors or warnings', async () => {
       expect.assertions(2);

       const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
       const documentId = await createTestDocument(cortiClient, interactionId);

       const result = await cortiClient.documents.update(interactionId, documentId, {
           sections: [],
       });

       expect(result).toBeDefined();
       expect(consoleWarnSpy).not.toHaveBeenCalled();
     });
   });

  it('should update document with all possible optional parameters without errors or warnings', async () => {
    expect.assertions(8);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const documentId = await createTestDocument(cortiClient, interactionId);

    const originalDocument = await cortiClient.documents.get(interactionId, documentId);
    const originalName = originalDocument.name;

    const newName = faker.lorem.words(4);
    const sectionKey = faker.helpers.arrayElement(validSectionKeys);
    const sectionName = faker.lorem.words(3);
    const sectionText = faker.lorem.paragraphs(2);

    const result = await cortiClient.documents.update(interactionId, documentId, {
      name: newName,
      sections: [{
        key: sectionKey,
        name: sectionName,
        text: sectionText,
        sort: 0,
      }],
    });

    expect(result).toBeDefined();
    expect(result.name).toBe(newName);
    expect(result.name).not.toBe(originalName);
    expect(result.sections).toBeDefined();

    const updatedSection = result.sections.find(section => section.key === sectionKey);
    expect(updatedSection).toBeDefined();
    expect(updatedSection?.name).toBe(sectionName);
    expect(updatedSection?.text).toBe(sectionText);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const documentId = await createTestDocument(cortiClient, interactionId);

      await expect(
        cortiClient.documents.update('invalid-uuid', documentId, {
          name: faker.lorem.words(3),
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when document ID is invalid', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.documents.update(interactionId, 'invalid-uuid', {
          name: faker.lorem.words(3),
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const documentId = await createTestDocument(cortiClient, interactionId);

      await expect(
        cortiClient.documents.update(faker.string.uuid(), documentId, {
          name: faker.lorem.words(3),
        })
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when document ID does not exist', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      await expect(
        cortiClient.documents.update(interactionId, faker.string.uuid(), {
          name: faker.lorem.words(3),
        })
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when section key is missing', async () => {
      expect.assertions(1);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      const documentId = await createTestDocument(cortiClient, interactionId);

      await expect(
        cortiClient.documents.update(interactionId, documentId, {
          sections: [{
            name: faker.lorem.words(2),
            text: faker.lorem.paragraph(),
          }],
        } as any)
      ).rejects.toThrow('Missing required key "key"');
    });

  });
});