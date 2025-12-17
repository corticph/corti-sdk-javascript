/**
 * Patch: Lightweight proxy client with only WebSocket resources (stream and transcribe).
 * Use this when you need direct WebSocket connections through your own proxy backend.
 *
 * No environment or tenantName required - proxy is required in connect().
 */

import { CustomProxyStream } from "./proxy/CustomProxyStream.js";
import { CustomProxyTranscribe } from "./proxy/CustomProxyTranscribe.js";

export class CortiWebSocketProxyClient {
    private static _stream: CustomProxyStream | undefined;
    private static _transcribe: CustomProxyTranscribe | undefined;

    public static get stream(): CustomProxyStream {
        return (this._stream ??= new CustomProxyStream());
    }

    public static get transcribe(): CustomProxyTranscribe {
        return (this._transcribe ??= new CustomProxyTranscribe());
    }
}
