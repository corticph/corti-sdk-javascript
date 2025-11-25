/**
 * Patch: file patches disability of auto-generating binary data methods for sending data to the socket
 */
import { TranscribeSocket as FernTranscribeSocket } from "../api/resources/transcribe/client/Socket.js";
import * as core from "../core/index.js";

export class TranscribeSocket extends FernTranscribeSocket {
    public sendAudio(message: ArrayBufferLike | Blob | ArrayBufferView | string): void {
        if (typeof message === "string") {
            return super.sendAudio(message);
        }

        this.__assertSocketIsOpen();
        super.sendBinary(message);
    }

    /**
     * Patch: have to repeat this method, because it is private in the base class
     */
    private __assertSocketIsOpen(): void {
        if (!this.socket) {
            throw new Error("Socket is not connected.");
        }

        if (this.socket.readyState !== core.ReconnectingWebSocket.OPEN) {
            throw new Error("Socket is not open.");
        }
    }

    /**
     * Patch: added ability to remove event handlers
     */
    public off<T extends keyof FernTranscribeSocket.EventHandlers>(
        event: T,
        callback?: FernTranscribeSocket.EventHandlers[T],
    ) {
        if (!callback || callback === this.eventHandlers[event]) {
            delete this.eventHandlers[event];
        }
    }
}
