import type * as Corti from "../../api/index.js";
import { CortiEnvironment } from "../../environments.js";
import { CustomTranscribe } from "../transcribe/CustomTranscribe.js";
import type { CustomTranscribeSocket } from "../transcribe/CustomTranscribeSocket.js";
import type { ProxyOptions } from "../utils/encodeHeadersAsWsProtocols.js";

/**
 * Lightweight proxy transcribe client — no CortiClient or auth needed.
 * Pass a proxy URL (and optionally protocols/queryParameters) directly in connect().
 */
export class CustomProxyTranscribe {
    private readonly _transcribe = new CustomTranscribe({
        environment: CortiEnvironment.Eu,
        tenantName: "",
    });

    public connect(args: {
        proxy: ProxyOptions;
        configuration?: Corti.TranscribeConfig;
        awaitConfiguration?: boolean;
        debug?: boolean;
        reconnectAttempts?: number;
    }): Promise<CustomTranscribeSocket> {
        return this._transcribe.connect(args);
    }
}
