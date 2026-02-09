/**
 * Patch: Proxy-specific Transcribe wrapper that enforces `proxy` as required.
 *
 * Reuses the underlying CustomTranscribe class to preserve the logic we added on top
 * of generated sockets (e.g., sending configuration messages, handling responses).
 */

import * as environments from "../../environments.js";
import * as api from "../../api/index.js";
import { Transcribe } from "../CustomTranscribe.js";
import { TranscribeSocket } from "../CustomTranscribeSocket.js";
import type { CortiClient } from "../CortiClient.js";

export type ProxyOptions = {
    url: string;
    /** Array passed as-is to WS; object encoded like headers (name, encodeURIComponent(value), ...). */
    protocols?: string[] | CortiClient.HeadersRecord;
    queryParameters?: Record<string, string>;
};

export class CustomProxyTranscribe {
    private _transcribe: Transcribe;

    constructor() {
        this._transcribe = new Transcribe({
            environment: environments.CortiEnvironment.Eu,
            tenantName: "",
        });
    }

    public connect(args: {
        proxy: ProxyOptions;
        configuration?: api.TranscribeConfig;
        debug?: boolean;
        reconnectAttempts?: number;
    }): Promise<TranscribeSocket> {
        return this._transcribe.connect(args);
    }
}
