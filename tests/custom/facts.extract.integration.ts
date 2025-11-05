import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import { 
  createTestCortiClient, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.facts.extract', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: MockInstance;

  beforeAll(() => {
    cortiClient = createTestCortiClient();
  });

  beforeEach(() => {
    consoleWarnSpy = setupConsoleWarnSpy();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('should extract facts with required fields', () => {
    it('should extract facts with single text context without errors or warnings', async () => {
      expect.assertions(2);

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: faker.lorem.paragraph(),
        }],
        outputLanguage: 'en',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // FIXME : Temporarily skip this test until multiple contexts are supported
    it.skip('should extract facts with multiple text contexts without errors or warnings', async () => {
      expect.assertions(2);

      const result = await cortiClient.facts.extract({
        context: [
          {
            type: 'text',
            text: faker.lorem.paragraph(),
          },
          {
            type: 'text',
            text: faker.lorem.paragraph(),
          },
          {
            type: 'text',
            text: faker.lorem.paragraph(),
          },
        ],
        outputLanguage: 'en',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should extract facts with different output languages', () => {
    it('should extract facts with English output language without errors or warnings', async () => {
      expect.assertions(3);

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: faker.lorem.paragraph(),
        }],
        outputLanguage: 'en',
      });

      expect(result).toBeDefined();
      expect(result.outputLanguage).toBe('en');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should extract facts with Danish output language without errors or warnings', async () => {
      expect.assertions(3);

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: faker.lorem.paragraph(),
        }],
        outputLanguage: 'da',
      });

      expect(result).toBeDefined();
      expect(result.outputLanguage).toBe('da');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should extract facts with German output language without errors or warnings', async () => {
      expect.assertions(3);

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: faker.lorem.paragraph(),
        }],
        outputLanguage: 'de',
      });

      expect(result).toBeDefined();
      expect(result.outputLanguage).toBe('de');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should extract facts with meaningful medical text', () => {
    it('should extract facts from medical context text without errors or warnings', async () => {
      expect.assertions(2);

      const medicalText = 'Patient presents with chest pain, shortness of breath, and elevated blood pressure of 140/90. Patient has a history of hypertension and diabetes.';

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: medicalText,
        }],
        outputLanguage: 'en',
      });

      expect(result.facts).not.toEqual([]);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should extract facts from another medical text without errors or warnings', async () => {
      expect.assertions(2);

      const medicalText = 'Patient has fever of 38.5 degrees Celsius and cough for 3 days.';

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: medicalText,
        }],
        outputLanguage: 'en',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should extract facts with minimal text', () => {
    it('should handle extraction with minimal text without errors or warnings', async () => {
      expect.assertions(2);

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: faker.lorem.word(),
        }],
        outputLanguage: 'en',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should extract facts with long text', () => {
    it('should extract facts from long text without errors or warnings', async () => {
      expect.assertions(2);

      const longText = faker.lorem.paragraphs(10);

      const result = await cortiClient.facts.extract({
        context: [{
          type: 'text',
          text: longText,
        }],
        outputLanguage: 'en',
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should throw error when required fields are missing or invalid', () => {
    it('should throw error when context is missing', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.extract({
          outputLanguage: 'en',
        } as any)
      ).rejects.toThrow('Missing required key "context"');
    });

    it('should throw error when context is empty array', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.extract({
          context: [],
          outputLanguage: 'en',
        })
      ).rejects.toThrow();
    });

    it('should throw error when context text is empty', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.extract({
          context: [{
            type: 'text',
            text: '',
          }],
          outputLanguage: 'en',
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when outputLanguage is missing', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.extract({
          context: [{
            type: 'text',
            text: faker.lorem.paragraph(),
          }],
        } as any)
      ).rejects.toThrow('Missing required key "outputLanguage"');
    });

    it('should throw error when context item is missing type', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.extract({
          context: [{
            text: faker.lorem.paragraph(),
          }] as any,
          outputLanguage: 'en',
        })
      ).rejects.toThrow();
    });

    it('should throw error when context item is missing text', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.extract({
          context: [{
            type: 'text',
          }] as any,
          outputLanguage: 'en',
        })
      ).rejects.toThrow();
    });

    it('should throw error when context item has incorrect type value', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.facts.extract({
          context: [{
            type: 'invalid-type',
            text: faker.lorem.paragraph(),
          }] as any,
          outputLanguage: 'en',
        })
      ).rejects.toThrow();
    });
  });
});


