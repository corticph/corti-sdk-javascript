import { CortiClient } from '../../src/custom/CortiClient';
import { faker } from '@faker-js/faker';
import type { MockInstance } from 'vitest';
import fs from 'fs';
import path from 'path';
import { 
  createTestCortiClient, 
  createTestInteraction,
  cleanupInteractions, 
  setupConsoleWarnSpy,
  waitForWebSocketMessage
} from './testUtils';

describe('cortiClient.stream.connect', () => {
  let cortiClient: CortiClient;
  let createdInteractionIds: string[];
  let consoleWarnSpy: MockInstance;
  let activeSockets: any[] = [];

  beforeAll(async () => {
    cortiClient = createTestCortiClient();
    createdInteractionIds = [];
  });

  beforeEach(() => {
    consoleWarnSpy = setupConsoleWarnSpy();
    activeSockets = [];
  });

  afterEach(async () => {
    // Close all active sockets to ensure cleanup
    activeSockets.forEach(socket => {
      if (socket && typeof socket.close === 'function') {
        try {
          socket.close();
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    });
    activeSockets = [];

    await cleanupInteractions(cortiClient, createdInteractionIds);
    createdInteractionIds = [];
  });

  describe('should connect with minimal configuration', () => {
    it.concurrent('should connect with minimal configuration passed to connect', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
            ],
          },
          mode: {
            type: 'facts',
          },
        },
      });
      activeSockets.push(streamSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it.concurrent('should connect and send configuration manually on open event', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
      });
      activeSockets.push(streamSocket);

      streamSocket.on('open', () => {
        streamSocket.sendConfiguration({
          type: 'config',
          configuration: {
            transcription: {
              primaryLanguage: 'en',
              participants: [
                {
                  channel: faker.number.int({ min: 0, max: 10 }),
                  role: 'doctor',
                },
              ],
            },
            mode: {
              type: 'facts',
            },
          },
        });
      });

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });
  });

  describe('should connect with full configuration', () => {
    it.concurrent('should connect with full configuration passed to connect', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            isDiarization: true,
            isMultichannel: true,
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'patient',
              },
            ],
          },
          mode: {
            type: 'facts',
            outputLocale: 'en',
          },
        },
      });
      activeSockets.push(streamSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it.concurrent('should connect and send full configuration manually on open event', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
      });
      activeSockets.push(streamSocket);

      streamSocket.on('open', () => {
        streamSocket.sendConfiguration({
          type: 'config',
          configuration: {
            transcription: {
              primaryLanguage: 'en',
              isDiarization: true,
              isMultichannel: true,
              participants: [
                {
                  channel: faker.number.int({ min: 0, max: 10 }),
                  role: 'doctor',
                },
                {
                  channel: faker.number.int({ min: 0, max: 10 }),
                  role: 'patient',
                },
              ],
            },
            mode: {
              type: 'facts',
              outputLocale: 'en',
            },
          },
        });
      });

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });
  });

  describe('should connect with different participant roles', () => {
    it.concurrent('should connect with doctor role', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
            ],
          },
          mode: {
            type: 'facts',
          },
        },
      });
      activeSockets.push(streamSocket);

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it.concurrent('should connect with patient role', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'patient',
              },
            ],
          },
          mode: {
            type: 'facts',
          },
        },
      });
      activeSockets.push(streamSocket);

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it.concurrent('should connect with multiple role', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'multiple',
              },
            ],
          },
          mode: {
            type: 'facts',
          },
        },
      });
      activeSockets.push(streamSocket);

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });
  });

  describe('should connect with different mode types', () => {
    it.concurrent('should connect with facts mode', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
            ],
          },
          mode: {
            type: 'facts',
          },
        },
      });
      activeSockets.push(streamSocket);

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it.concurrent('should connect with transcription mode', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
            ],
          },
          mode: {
            type: 'transcription',
          },
        },
      });
      activeSockets.push(streamSocket);

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it.concurrent('should connect with documentation mode', async () => {
      expect.assertions(4);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
            ],
          },
          mode: {
            type: 'documentation',
          },
        },
      });
      activeSockets.push(streamSocket);

      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(streamSocket).toBeDefined();
      expect(streamSocket.socket).toBeDefined();
      expect(streamSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });
  });

  describe('should handle transcription scenario with audio', () => {
    it.concurrent('should process audio and receive transcription messages', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'patient',
              },
            ],
          },
          mode: {
            type: 'transcription',
          },
        },
      });
      activeSockets.push(streamSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      const audioFilePath = path.join(__dirname, 'trouble-breathing.mp3');
      const audioBuffer = fs.readFileSync(audioFilePath);

      for (let i = 0; i < 3; i++) {
        const chunk = audioBuffer.subarray(i * 60 * 1024, (i + 1) * 60 * 1024);
        streamSocket.sendAudio(chunk);
      }

      await waitForWebSocketMessage(streamSocket, 'transcript', { messages, timeoutMs: 30000 });

      streamSocket.sendEnd({ type: 'end' });

      await waitForWebSocketMessage(streamSocket, 'usage', { messages });

      await waitForWebSocketMessage(streamSocket, 'ENDED', { messages });

      expect([2, 3]).toContain(streamSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // FIXME takes too much time to have facts
    it.skip('should process audio and receive facts messages', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'patient',
              },
            ],
          },
          mode: {
            type: 'facts',
          },
        },
      });
      activeSockets.push(streamSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(streamSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      const audioFilePath = path.join(__dirname, 'trouble-breathing.mp3');
      const audioBuffer = fs.readFileSync(audioFilePath);

      for (let i = 0; i < 6; i++) {
        const chunk = audioBuffer.subarray(i * 60 * 1024, (i + 1) * 60 * 1024);
        streamSocket.sendAudio(chunk);
      }

      await waitForWebSocketMessage(streamSocket, 'transcript', { messages, timeoutMs: 30000 });
      await waitForWebSocketMessage(streamSocket, 'facts', { messages, timeoutMs: 60000 });

      streamSocket.sendEnd({ type: 'end' });

      await waitForWebSocketMessage(streamSocket, 'usage', { messages });

      await waitForWebSocketMessage(streamSocket, 'ENDED', { messages });

      expect([2, 3]).toContain(streamSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('should handle configuration errors', () => {
    it.concurrent('should reject invalid configuration', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'invalid_language',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'doctor',
              },
            ],
          },
          mode: {
            type: 'transcription',
          },
        },
      });
      activeSockets.push(streamSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(streamSocket, 'CONFIG_DENIED', { messages, rejectOnWrongMessage: true });

      expect([2, 3]).toContain(streamSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // FIXME no message received from WS
    it.skip('should reject missing configuration', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
      });
      activeSockets.push(streamSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(streamSocket, 'CONFIG_MISSING', {
        messages,
        rejectOnWrongMessage: true,
        timeoutMs: 60000
      });

      expect([2, 3]).toContain(streamSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it.concurrent('should reject configuration with invalid participant role', async () => {
      expect.assertions(2);

      const interactionId = await createTestInteraction(cortiClient, createdInteractionIds);
      
      const streamSocket = await cortiClient.stream.connect({
        id: interactionId,
        configuration: {
          transcription: {
            primaryLanguage: 'en',
            participants: [
              {
                channel: faker.number.int({ min: 0, max: 10 }),
                role: 'invalid_role' as any,
              },
            ],
          },
          mode: {
            type: 'transcription',
          },
        },
      });
      activeSockets.push(streamSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(streamSocket, 'CONFIG_DENIED', { messages, rejectOnWrongMessage: true });

      expect([2, 3]).toContain(streamSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});