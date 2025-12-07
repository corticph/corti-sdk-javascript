/**
 * Patch: Proxy-specific Stream wrapper that enforces `proxy` as required.
 *
 * Reuses the underlying CustomStream class to preserve the logic we added on top
 * of generated sockets (e.g., sending configuration messages, handling responses).
 */

import * as environments from "../../environments.js";
import * as api from "../../api/index.js";
import { Stream } from "../CustomStream.js";
import { StreamSocket } from "../CustomStreamSocket.js";

export type ProxyOptions = {
    url: string;
    protocols?: string[];
    queryParameters?: Record<string, string>;
};

export class CustomProxyStream {
    private _stream: Stream;

    constructor() {
        this._stream = new Stream({
            environment: environments.CortiEnvironment.Eu,
            tenantName: "",
        });
    }

    public connect(args: {
        proxy: ProxyOptions;
        configuration?: api.StreamConfig;
        headers?: Record<string, string>;
        debug?: boolean;
        reconnectAttempts?: number;
    }): Promise<StreamSocket> {
        // id is not used in proxy mode, but required by the underlying type
        return this._stream.connect({ ...args, id: "" });
    }
}
