import { CortiClient } from '../../src';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import { 
  createTestCortiClient, 
  createTestAgent,
  cleanupAgents,
  setupConsoleWarnSpy,
  sendTestMessage
} from './testUtils';

describe('cortiClient.agents.getTask', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: MockInstance;
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

  it('should successfully retrieve a task without errors or warnings', async () => {
    expect.assertions(2);

    const agent = await createTestAgent(cortiClient, createdAgentIds);
    const messageResponse = await sendTestMessage(cortiClient, agent.id);

    const taskId = messageResponse.task?.id;

    if (!taskId) {
      throw new Error('No task ID returned from message send');
    }

    const result = await cortiClient.agents.getTask(agent.id, taskId);

    expect(result).toBeDefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should retrieve task with historyLength parameter without errors or warnings', async () => {
    expect.assertions(2);

    const agent = await createTestAgent(cortiClient, createdAgentIds);
    const messageResponse = await sendTestMessage(cortiClient, agent.id);
    const taskId = messageResponse.task?.id;

    if (!taskId) {
      throw new Error('No task ID returned from message send');
    }

    const result = await cortiClient.agents.getTask(agent.id, taskId, {
      historyLength: faker.number.int({ min: 1, max: 100 }),
    });

    expect(result).toBeDefined();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('should throw error when invalid parameters are provided', () => {
    // FIXME: re-enable when validation is implemented
    it.skip('should throw error when agent ID is invalid format', async () => {
      expect.assertions(1);

      const agent = await createTestAgent(cortiClient, createdAgentIds);
      const messageResponse = await sendTestMessage(cortiClient, agent.id);
      const taskId = messageResponse.task?.id;

      if (!taskId) {
        throw new Error('No task ID returned from message send');
      }

      await expect(
        cortiClient.agents.getTask('invalid-uuid', taskId)
      ).rejects.toThrow('Status code: 400');
    });

    it('should throw error when task ID is invalid format', async () => {
      expect.assertions(1);

      const agent = await createTestAgent(cortiClient, createdAgentIds);

      await expect(
        cortiClient.agents.getTask(agent.id, 'invalid-uuid')
      ).rejects.toThrow('Status code: 400');
    });

    // FIXME: re-enable when proper error handling is implemented
    it.skip('should throw error when agent ID does not exist', async () => {
      expect.assertions(1);

      const agent = await createTestAgent(cortiClient, createdAgentIds);
      const messageResponse = await sendTestMessage(cortiClient, agent.id);
      const taskId = messageResponse.task?.id;

      if (!taskId) {
        throw new Error('No task ID returned from message send');
      }

      await expect(
        cortiClient.agents.getTask(faker.string.uuid(), taskId)
      ).rejects.toThrow('Status code: 404');
    });

    it('should throw error when task ID does not exist', async () => {
      expect.assertions(1);

      const agent = await createTestAgent(cortiClient, createdAgentIds);

      await expect(
        cortiClient.agents.getTask(agent.id, faker.string.uuid())
      ).rejects.toThrow('Status code: 404');
    });
  });
});
