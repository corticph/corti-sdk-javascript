import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestInteraction,
  cleanupInteractions, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.interactions.update', () => {
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

  describe('should update interaction with minimal fields', () => {
    it('should update interaction with empty request (no changes) without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {});

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with only assignedUserId without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        assignedUserId: faker.string.uuid(),
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with only encounter identifier without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          identifier: faker.string.alphanumeric(20),
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with only patient identifier without errors or warnings', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        patient: {
          identifier: faker.string.alphanumeric(15),
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should update interaction with all status enum values', () => {
    it('should update interaction with status "planned"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          status: 'planned',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with status "in-progress"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          status: 'in-progress',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with status "on-hold"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          status: 'on-hold',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with status "completed"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          status: 'completed',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with status "cancelled"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          status: 'cancelled',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with status "deleted"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          status: 'deleted',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should update interaction with all type enum values', () => {
    it('should update interaction with type "first_consultation"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          type: 'first_consultation',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with type "consultation"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          type: 'consultation',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with type "emergency"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          type: 'emergency',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with type "inpatient"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          type: 'inpatient',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with type "outpatient"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        encounter: {
          type: 'outpatient',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should update interaction with all gender enum values', () => {
    it('should update interaction with gender "male"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'male',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with gender "female"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'female',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with gender "unknown"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'unknown',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should update interaction with gender "other"', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);

      const result = await cortiClient.interactions.update(interactionId, {
        patient: {
          identifier: faker.string.alphanumeric(15),
          gender: 'other',
        },
      });

      expect(result).toBeDefined();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  it('should update interaction with all optional parameters without errors or warnings', async () => {
    expect.assertions(2);

    const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
    const startDate = faker.date.recent();
    const endDate = faker.date.future({ refDate: startDate });
    const birthDate = faker.date.birthdate({ min: 18, max: 100, mode: 'age' });

    const result = await cortiClient.interactions.update(interactionId, {
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

    expect(result).toBeDefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when interaction ID is invalid', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.update('invalid-uuid', {
          assignedUserId: faker.string.uuid(),
        })
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when interaction ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.interactions.update(faker.string.uuid(), {
          assignedUserId: faker.string.uuid(),
        })
      ).rejects.toThrow('Status code: 404');
    });
  });
}); 