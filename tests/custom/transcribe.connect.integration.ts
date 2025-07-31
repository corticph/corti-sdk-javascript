import { CortiClient } from '../../src/custom/CortiClient';
import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';
import { 
  createTestCortiClient, 
  setupConsoleWarnSpy,
  waitForWebSocketMessage
} from './testUtils';

describe('cortiClient.transcribe.connect', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: jest.SpyInstance;
  let activeSockets: any[] = [];

  beforeAll(async () => {
    cortiClient = createTestCortiClient();
  });

  beforeEach(() => {
    consoleWarnSpy = setupConsoleWarnSpy();
    activeSockets = [];
  });

  afterEach(() => {
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
  });

  describe('should connect with minimal configuration', () => {
    it('should connect with minimal configuration passed to connect', async () => {
      expect.assertions(4);

      const transcribeSocket = await cortiClient.transcribe.connect({
        configuration: {
          primaryLanguage: 'en',
        },
      });
      activeSockets.push(transcribeSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      expect(transcribeSocket).toBeDefined();
      expect(transcribeSocket.socket).toBeDefined();
      expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should connect and send configuration manually on open event', async () => {
      expect.assertions(4);

      const transcribeSocket = await cortiClient.transcribe.connect();
      activeSockets.push(transcribeSocket);

      transcribeSocket.on('open', () => {
        transcribeSocket.sendConfiguration({
          type: 'config',
          configuration: {
            primaryLanguage: 'en',
          },
        });
      });

      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(transcribeSocket).toBeDefined();
      expect(transcribeSocket.socket).toBeDefined();
      expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });
  });

  describe('should connect with full configuration', () => {
    it('should connect with full configuration passed to connect', async () => {
      expect.assertions(4);

      const transcribeSocket = await cortiClient.transcribe.connect({
        configuration: {
          primaryLanguage: 'en',
          interimResults: true,
          spokenPunctuation: true,
          automaticPunctuation: true,
          commands: [
            {
              id: faker.string.alphanumeric(8),
              phrases: ['stop recording', 'end session'],
            },
          ],
        },
      });
      activeSockets.push(transcribeSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      expect(transcribeSocket).toBeDefined();
      expect(transcribeSocket.socket).toBeDefined();
      expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it('should connect and send full configuration manually on open event', async () => {
      expect.assertions(4);

      
      const transcribeSocket = await cortiClient.transcribe.connect();
      activeSockets.push(transcribeSocket);

      transcribeSocket.on('open', () => {
        transcribeSocket.sendConfiguration({
          type: 'config',
          configuration: {
            primaryLanguage: 'en',
            interimResults: true,
            spokenPunctuation: true,
            automaticPunctuation: true,
            commands: [
              {
                id: faker.string.alphanumeric(8),
                phrases: ['stop recording', 'end session'],
              },
            ],
          },
        });
      });

      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_ACCEPTED', { rejectOnWrongMessage: true });

      expect(transcribeSocket).toBeDefined();
      expect(transcribeSocket.socket).toBeDefined();
      expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it('should connect with full configuration including command variables', async () => {
      expect.assertions(4);

      const transcribeSocket = await cortiClient.transcribe.connect({
        configuration: {
          primaryLanguage: 'en',
          interimResults: true,
          spokenPunctuation: true,
          automaticPunctuation: true,
          commands: [
            {
              id: faker.string.alphanumeric(8),
              phrases: ['set status to', 'change status to'],
              variables: [
                {
                  key: 'status',
                  type: 'enum',
                  enum: ['active', 'inactive', 'pending', 'completed'],
                },
              ],
            },
          ],
        },
      });
      activeSockets.push(transcribeSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      expect(transcribeSocket).toBeDefined();
      expect(transcribeSocket.socket).toBeDefined();
      expect(transcribeSocket.socket.readyState).toBe(1); // OPEN
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });
  });

  describe('should handle transcription scenario with audio', () => {
    it('should process audio and receive transcription messages', async () => {
      expect.assertions(1);
      
      const transcribeSocket = await cortiClient.transcribe.connect({
        configuration: {
          primaryLanguage: 'en',
        },
      });
      activeSockets.push(transcribeSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_ACCEPTED', { messages, rejectOnWrongMessage: true });

      const audioFilePath = path.join(__dirname, 'trouble-breathing.mp3');
      const audioBuffer = fs.readFileSync(audioFilePath);

      for (let i = 0; i < 3; i++) {
        const chunk = audioBuffer.subarray(i * 60 * 1024, (i + 1) * 60 * 1024);
        transcribeSocket.sendAudio(chunk);
      }

      await waitForWebSocketMessage(transcribeSocket, 'transcript', { messages, timeoutMs: 30000 });

      transcribeSocket.sendEnd({ type: 'end' });

      // FIXME skip this part of the test since it takes too long on production to get these messages
      // await waitForWebSocketMessage(transcribeSocket, 'usage', { messages });
      //
      // await waitForWebSocketMessage(transcribeSocket, 'ended', { messages });

      // expect([2, 3]).toContain(transcribeSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });
  });

  describe('should handle configuration errors', () => {
    it('should reject invalid configuration', async () => {
      expect.assertions(2);

      
      const transcribeSocket = await cortiClient.transcribe.connect({
        configuration: {
          primaryLanguage: 'invalid_language',
        },
      });
      activeSockets.push(transcribeSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_DENIED', { messages, rejectOnWrongMessage: true });

      expect([2, 3]).toContain(transcribeSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it('should reject missing configuration', async () => {
      expect.assertions(1);
      
      const transcribeSocket = await cortiClient.transcribe.connect();
      activeSockets.push(transcribeSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_TIMEOUT', {
        messages,
        rejectOnWrongMessage: true,
        timeoutMs: 60000
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();

    });

    it('should reject configuration with invalid command', async () => {
      expect.assertions(2);
      
      const transcribeSocket = await cortiClient.transcribe.connect({
        configuration: {
          primaryLanguage: 'en',
          commands: [
            {
              id: '',
              phrases: [],
            } as any,
          ],
        },
      });
      activeSockets.push(transcribeSocket);

      const messages: any[] = [];
      await waitForWebSocketMessage(transcribeSocket, 'CONFIG_DENIED', { messages, rejectOnWrongMessage: true });

      expect([2, 3]).toContain(transcribeSocket.socket.readyState); // CLOSING or CLOSED
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
