import { CortiClient } from '../../src';
import type { MockInstance } from 'vitest';
import { 
  createTestCortiClient, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.facts.factGroupsList', () => {
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

  it.concurrent('should successfully retrieve fact groups list without errors or warnings', async () => {
    expect.assertions(2);

    const result = await cortiClient.facts.factGroupsList();

    expect(result.data.length).toBeGreaterThan(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });
}); 