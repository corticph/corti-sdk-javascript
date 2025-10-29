import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import { 
  createTestCortiClient, 
  createTestAgent,
  cleanupAgents,
  setupConsoleWarnSpy 
} from './testUtils';

// FIXME : Skipping until delete agent functionality is restored
describe.skip('cortiClient.agents.delete', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: jest.SpyInstance;
  let createdAgentIds: string[] = [];

  beforeAll(() => {
    cortiClient = createTestCortiClient();
  });

  beforeEach(() => {
    consoleWarnSpy = setupConsoleWarnSpy();
    createdAgentIds = [];
  });

  afterEach(async () => {
    consoleWarnSpy.mockRestore();
    await cleanupAgents(cortiClient, createdAgentIds);
    createdAgentIds = [];
  });

  it('should successfully delete an existing agent without errors or warnings', async () => {
    expect.assertions(2);

    const agent = await createTestAgent(cortiClient, createdAgentIds);

    const result = await cortiClient.agents.delete(agent.id);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    it('should throw error when agent ID is invalid format', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.agents.delete('invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when agent ID does not exist', async () => {
      expect.assertions(1);

      await expect(
        cortiClient.agents.delete(faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });
  });
});
