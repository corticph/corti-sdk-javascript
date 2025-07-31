import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  cleanupInteractions, 
  setupConsoleWarnSpy
} from './testUtils';

describe('cortiClient.interactions.create', () => {
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

  describe('should create interaction with only required values', () => {
    it('should create interaction with only encounter required fields without errors or warnings', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with patient having only required identifier without errors or warnings', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
        patient: {
          identifier: faker.string.alphanumeric(15),
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should create interaction with all status enum values', () => {
    it('should create interaction with status "planned"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with status "in-progress"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'in-progress',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with status "on-hold"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'on-hold',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with status "completed"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'completed',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with status "cancelled"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'cancelled',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with status "deleted"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'deleted',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should create interaction with all type enum values', () => {
    it('should create interaction with type "first_consultation"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with type "consultation"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'consultation',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with type "emergency"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'emergency',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with type "inpatient"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'inpatient',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with type "outpatient"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'outpatient',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should create interaction with all gender enum values', () => {
    it('should create interaction with gender "male"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'male',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with gender "female"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'female',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with gender "unknown"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'unknown',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should create interaction with gender "other"', async () => {
      expect.assertions(2);

      const result = await cortiClient.interactions.create({
        encounter: {
          identifier: faker.string.alphanumeric(20),
          status: 'planned',
          type: 'first_consultation',
        },
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'other',
        },
      });

      createdInteractionIds.push(result.interactionId);

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  it('should create interaction with all optional parameters without errors or warnings', async () => {
    expect.assertions(2);

    const startDate = faker.date.recent();
    const endDate = faker.date.future({ refDate: startDate });
    const birthDate = faker.date.birthdate({ min: 18, max: 100, mode: 'age' });

    const result = await cortiClient.interactions.create({
      assignedUserId: faker.string.uuid(),
      encounter: {
        identifier: faker.string.alphanumeric(20),
        status: 'in-progress',
        type: 'consultation',
        title: faker.lorem.sentence(),
        period: {
          startedAt: startDate,
          endedAt: endDate,
        },
      },
      patient: {
        identifier: faker.string.alphanumeric(15),
        name: faker.person.fullName(),
        gender: 'male',
        birthDate: birthDate,
        pronouns: faker.helpers.arrayElement(['he/him', 'she/her', 'they/them']),
      },
    });

    createdInteractionIds.push(result.interactionId);

    expect(result).toBeDefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when required fields are missing', () => {
    it('should throw error when encounter is missing', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.create({} as any)
      ).rejects.toThrow('Missing required key "encounter"');
    });

    it('should throw error when encounter.identifier is missing', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.create({
          encounter: {
            status: 'planned',
            type: 'first_consultation',
          } as any,
        })
      ).rejects.toThrow('Missing required key "identifier"');
    });

    it('should throw error when encounter.status is missing', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.create({
          encounter: {
            identifier: faker.string.alphanumeric(20),
            type: 'first_consultation',
          } as any,
        })
      ).rejects.toThrow('Missing required key "status"');
    });

    it('should throw error when encounter.type is missing', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.create({
          encounter: {
            identifier: faker.string.alphanumeric(20),
            status: 'planned',
          } as any,
        })
      ).rejects.toThrow('Missing required key "type"');
    });

    it('should throw error when patient.identifier is missing', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.create({
          encounter: {
            identifier: faker.string.alphanumeric(20),
            status: 'planned',
            type: 'first_consultation',
          },
          patient: {
            name: faker.person.fullName(),
          } as any,
        })
      ).rejects.toThrow('Missing required key "identifier"');
    });
  });
});
