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

export class Transcribe extends FernTranscribe {
    /**
     * Patch: use custom connect method to support passing _options parameters
     * Added optional `proxy` parameter for direct WebSocket connection (proxy scenarios)
     */
    public async connect({
        configuration,
        proxy,
        ...args
    }: Omit<FernTranscribe.ConnectArgs, "token" | "tenantName"> & {
        configuration?: api.TranscribeConfig;
        /** Patch: Proxy connection options - bypasses normal URL construction */
        proxy?: {
            url?: string;
            protocols?: string[];
            queryParameters?: Record<string, string>;
        };
    } = {}): Promise<TranscribeSocket> {
        const socket = proxy
            ? new core.ReconnectingWebSocket({
                  url: proxy.url || core.url.join(
                      (await core.Supplier.get(this._options["baseUrl"])) ??
                        (await core.Supplier.get(this._options["environment"])).wss,
                        "/transcribe",
                  ),
                  protocols: proxy.protocols || [],
                  queryParameters: proxy.queryParameters || {},
                  headers: args.headers || {},
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
