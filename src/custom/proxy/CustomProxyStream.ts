import * as Corti from "../../api/index.js";
import { CortiEnvironment } from "../../environments.js";
import { CustomStream } from "../stream/CustomStream.js";
import type { CustomStreamSocket } from "../stream/CustomStreamSocket.js";
import type { ProxyOptions } from "../utils/encodeHeadersAsWsProtocols.js";

/**
 * Lightweight proxy stream client — no CortiClient or auth needed.
 * Pass a proxy URL (and optionally protocols/queryParameters) directly in connect().
 */
export class CustomProxyStream {
    private readonly _stream = new CustomStream({ environment: CortiEnvironment.Eu, tenantName: "" });

    public connect(args: {
        proxy: ProxyOptions;
        configuration?: Corti.StreamConfig;
        awaitConfiguration?: boolean;
        debug?: boolean;
        reconnectAttempts?: number;
    }): Promise<CustomStreamSocket> {
        return this._stream.connect({ ...args, id: "" });
    }
}
