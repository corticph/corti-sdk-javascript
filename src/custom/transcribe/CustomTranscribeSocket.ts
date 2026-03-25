import { TranscribeSocket } from "../../api/resources/transcribe/client/Socket.js";

export class CustomTranscribeSocket extends TranscribeSocket {
    /** Remove the handler for an event. If callback is supplied, only removes if it matches. */
    public off<T extends keyof TranscribeSocket.EventHandlers>(
        event: T,
        callback?: TranscribeSocket.EventHandlers[T],
    ): void {
        if (callback === undefined || this.eventHandlers[event] === callback) {
            this.eventHandlers[event] = undefined;
        }
    }

    /** Send raw data directly on the underlying WebSocket (e.g. binary audio, custom frames). */
    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        this.socket.send(data);
    }
}
