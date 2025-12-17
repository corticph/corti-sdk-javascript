/**
 * Patch: use custom Stream implementation to support passing _options parameters to connection function
 */
import { Stream as FernStream } from "../api/resources/stream/client/Client.js";

import * as core from "../core/index.js";

/**
 * Patch: added import for types and message parsing logic
 */
import * as api from "../api/index.js";
import { fromJson } from "../core/json.js";
import * as serializers from "../serialization/index.js";
import { ErrorEvent } from "../core/websocket/events.js";

/**
 * Patch: changed import to custom StreamSocket implementation
 */
import { StreamSocket } from "./CustomStreamSocket.js";

export class Stream extends FernStream {
    /**
     * Patch: use custom connect method to support passing _options parameters
     * Added optional `proxy` parameter for direct WebSocket connection (proxy scenarios)
     */
    public async connect({
        configuration,
        proxy,
        ...args
    }: Omit<FernStream.ConnectArgs, "token" | "tenantName"> & {
        configuration?: api.StreamConfig;
        /** Patch: Proxy connection options - bypasses normal URL construction */
        proxy?: {
            url: string;
            protocols?: string[];
            queryParameters?: Record<string, string>;
        };
    }): Promise<StreamSocket> {
        const socket = proxy
            ? new core.ReconnectingWebSocket({
                  url: proxy.url,
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

        const ws = new StreamSocket({ socket });

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

            const parsedResponse = serializers.StreamSocketResponse.parse(data, {
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
                (parsedResponse.value.type === "CONFIG_DENIED" ||
                    parsedResponse.value.type === "CONFIG_MISSING" ||
                    parsedResponse.value.type === "CONFIG_TIMEOUT" ||
                    parsedResponse.value.type === "CONFIG_NOT_PROVIDED")
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

            if (parsedResponse.ok && parsedResponse.value.type === "ENDED") {
                ws.close();
                return;
            }
        });

        return ws;
    }
}
