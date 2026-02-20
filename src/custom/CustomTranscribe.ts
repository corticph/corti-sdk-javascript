/**
 * Patch: use custom Transcribe implementation to support passing _options parameters to connection function
 */
import { Transcribe as FernTranscribe } from "../api/resources/transcribe/client/Client.js";

import * as core from "../core/index.js";

/**
 * Patch: added import for types and message parsing logic
 */
import * as api from "../api/index.js";
import { fromJson } from "../core/json.js";
import * as serializers from "../serialization/index.js";
import { ErrorEvent } from "../core/websocket/events.js";

/**
 * Patch: changed import to custom TranscribeSocket implementation
 */
import { TranscribeSocket } from "./CustomTranscribeSocket.js";
/**
 * Patch: import getWsProtocols for building WS protocols from headers when encodeHeadersAsWsProtocols is set.
 */
import { getWsProtocols } from "./utils/encodeHeadersAsWsProtocols.js";
import type { CortiClient } from "./CortiClient.js";

/** Patch: options type extended with encodeHeadersAsWsProtocols (set by CortiClient). */
type TranscribeOptionsWithEncode = FernTranscribe["_options"] & { encodeHeadersAsWsProtocols?: boolean };

export class Transcribe extends FernTranscribe {
    /** Patch: narrow type so encodeHeadersAsWsProtocols is available when client is CortiClient. */
    protected readonly _options: TranscribeOptionsWithEncode;

    /** Patch: constructor accepts extended options so _options is correctly typed. */
    constructor(_options: TranscribeOptionsWithEncode) {
        super(_options);
        this._options = _options;
    }

    /**
     * Patch: use custom connect method to support passing _options parameters.
     * Patch: optional proxy parameter for direct WebSocket connection (proxy scenarios).
     * Patch: use proxy path when proxy is passed or encodeHeadersAsWsProtocols is set.
     * Patch: protocols from getWsProtocols; queryParameters from proxy or empty.
     */
    public async connect({
        configuration,
        proxy,
        ...args
    }: Omit<FernTranscribe.ConnectArgs, "token" | "tenantName"> & {
        configuration?: api.TranscribeConfig;
        /** Patch: proxy connection options - bypasses normal URL construction. protocols: array passed as-is, object encoded like headers. */
        proxy?: {
            url?: string;
            protocols?: string[] | CortiClient.HeadersRecord;
            queryParameters?: Record<string, string>;
        };
    } = {}): Promise<TranscribeSocket> {
        const useProxyPath = proxy || this._options.encodeHeadersAsWsProtocols;
        const protocols = await getWsProtocols(this._options, proxy?.protocols);

        const socket = useProxyPath
            ? new core.ReconnectingWebSocket({
                  url:
                      proxy?.url ||
                      core.url.join(
                          (await core.Supplier.get(this._options["baseUrl"])) ??
                              (await core.Supplier.get(this._options["environment"])).wss,
                          "/transcribe"
                      ),
                  protocols,
                  queryParameters: proxy?.queryParameters ?? {},
                  headers: args.headers ?? {},
                  options: { debug: args.debug ?? false, maxRetries: args.reconnectAttempts ?? 30 },
              })
            : (
                  await super.connect({
                      ...args,
                      token: (await this._getAuthorizationHeader()) || "",
                      tenantName: await core.Supplier.get(this._options.tenantName),
                  })
              ).socket;

        const ws = new TranscribeSocket({ socket });

        if (!configuration) {
            return ws;
        }

        ws.socket.addEventListener("open", () => {
            ws.sendConfiguration({
                type: "config",
                configuration,
            });
        });

        ws.socket.addEventListener("message", (event) => {
            const data = fromJson(event.data);

            const parsedResponse = serializers.TranscribeSocketResponse.parse(data, {
                unrecognizedObjectKeys: "passthrough",
                allowUnrecognizedUnionMembers: true,
                allowUnrecognizedEnumValues: true,
                skipValidation: true,
                omitUndefined: true,
            });

            if (parsedResponse.ok && parsedResponse.value.type === "CONFIG_ACCEPTED") {
                return;
            }

            if (
                parsedResponse.ok &&
                (parsedResponse.value.type === "CONFIG_DENIED" || parsedResponse.value.type === "CONFIG_TIMEOUT")
            ) {
                ws.socket.dispatchEvent(
                    new ErrorEvent(
                        {
                            name: parsedResponse.value.type,
                            message: JSON.stringify(parsedResponse.value),
                        },
                        "",
                    ),
                );

                ws.close();
                return;
            }

            if (parsedResponse.ok && parsedResponse.value.type === "error") {
                ws.socket.dispatchEvent(
                    new ErrorEvent(
                        {
                            name: "error",
                            message: JSON.stringify(parsedResponse.value),
                        },
                        "",
                    ),
                );

                ws.close();
                return;
            }

            if (parsedResponse.ok && parsedResponse.value.type === "ended") {
                ws.close();
                return;
            }
        });

        return ws;
    }
}
