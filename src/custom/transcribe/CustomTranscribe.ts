import * as Corti from "../../api/index.js";
import { TranscribeClient } from "../../api/resources/transcribe/client/Client.js";
import * as core from "../../core/index.js";
import { ErrorEvent } from "../../core/websocket/events.js";
import { getWsProtocols, type ProxyOptions } from "../utils/encodeHeadersAsWsProtocols.js";
import { CustomTranscribeSocket } from "./CustomTranscribeSocket.js";
import { parseTranscribeResponseType } from "./parseTranscribeResponseType.js";

const TRANSCRIBE_CONFIG_REJECTION_TYPES: readonly string[] = [
    Corti.TranscribeConfigStatusMessageType.ConfigDenied,
    Corti.TranscribeConfigStatusMessageType.ConfigTimeout,
];

export type CustomTranscribeConnectArgs = {
    /** When provided, connect() resolves after CONFIG_ACCEPTED or rejects on failure. */
    configuration?: Corti.TranscribeConfig;
    /**
     * When true (default), connect() resolves after CONFIG_ACCEPTED or rejects on failure.
     * When false, returns socket immediately; config errors are dispatched as ErrorEvent.
     */
    awaitConfiguration?: boolean;
    /**
     * When provided, bypasses normal URL construction and auth. The WebSocket connects
     * directly to proxy.url. Useful for proxy backends that handle auth themselves.
     */
    proxy?: ProxyOptions;
} & Partial<Omit<TranscribeClient.ConnectArgs, "tenantName" | "token">>;

export class CustomTranscribe extends TranscribeClient {
    private readonly _encodeHeadersAsWsProtocols: boolean | undefined;

    constructor(options: TranscribeClient.Options & { encodeHeadersAsWsProtocols?: boolean }) {
        super(options);
        this._encodeHeadersAsWsProtocols = options.encodeHeadersAsWsProtocols;
    }

    public override async connect(args?: CustomTranscribeConnectArgs): Promise<CustomTranscribeSocket> {
        const { configuration, awaitConfiguration = true, proxy, ...rest } = args ?? {};

        const useProxyPath = proxy || this._encodeHeadersAsWsProtocols;
        const protocols = await getWsProtocols(
            { ...this._options, encodeHeadersAsWsProtocols: this._encodeHeadersAsWsProtocols },
            proxy?.protocols,
        );

        const socket = useProxyPath
            ? new core.ReconnectingWebSocket({
                  url:
                      proxy?.url ??
                      core.url.join(
                          (await core.Supplier.get(this._options.baseUrl)) ??
                              (await core.Supplier.get(this._options.environment)).wss,
                          "/transcribe",
                      ),
                  protocols,
                  queryParameters: proxy?.queryParameters ?? {},
                  headers: rest.headers ?? {},
                  options: { debug: rest.debug ?? false, maxRetries: rest.reconnectAttempts ?? 30 },
              })
            : (
                  await super.connect({
                      ...rest,
                      token: (await this._options.authProvider?.getAuthRequest())?.headers.Authorization || "",
                      tenantName: await core.Supplier.get(this._options.tenantName),
                  })
              ).socket;

        const ws = new CustomTranscribeSocket({ socket });

        if (!configuration) {
            return ws;
        }

        if (awaitConfiguration) {
            return this._connectWithConfigAck(ws, configuration);
        }

        return this._connectWithConfigListeners(ws, configuration);
    }

    /**
     * Sends configuration on open, then resolves after CONFIG_ACCEPTED.
     * Rejects and closes socket on CONFIG_DENIED / CONFIG_TIMEOUT /
     * connection error / ended.
     */
    private async _connectWithConfigAck(
        socket: CustomTranscribeSocket,
        configuration: Corti.TranscribeConfig,
    ): Promise<CustomTranscribeSocket> {
        const configAck = this._buildConfigAckPromise(socket);

        await socket.waitForOpen();

        socket.sendConfiguration({ type: "config", configuration });

        try {
            await configAck;
        } catch (err) {
            socket.close();
            throw err;
        }

        // Persistent listener re-sends config on each reconnect
        socket.socket.addEventListener("open", () => {
            socket.sendConfiguration({ type: "config", configuration });
        });

        return socket;
    }

    /**
     * Sends configuration on open and returns the socket immediately.
     * Config errors are dispatched as ErrorEvent and the socket is closed.
     */
    private _connectWithConfigListeners(
        socket: CustomTranscribeSocket,
        configuration: Corti.TranscribeConfig,
    ): CustomTranscribeSocket {
        socket.socket.addEventListener("open", () => {
            socket.sendConfiguration({ type: "config", configuration });
        });

        socket.socket.addEventListener("message", (event) => {
            const type = parseTranscribeResponseType(event.data);

            if (type == null || type === Corti.TranscribeConfigStatusMessageType.ConfigAccepted) {
                return;
            }

            if (TRANSCRIBE_CONFIG_REJECTION_TYPES.includes(type) || type === "error") {
                socket.socket.dispatchEvent(new ErrorEvent(new Error(type), socket.socket));
                socket.close();
            } else if (type === "ended") {
                socket.close();
            }
        });

        return socket;
    }

    /** Resolves on CONFIG_ACCEPTED; rejects on rejection types, socket error, or ended. */
    private _buildConfigAckPromise(socket: CustomTranscribeSocket): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                socket.socket.removeEventListener("message", onMessage);
                socket.socket.removeEventListener("error", onError);
            };

            const onError = (event: core.ErrorEvent) => {
                cleanup();
                reject(new Error(event.message));
            };

            const onMessage = (event: { data: string }) => {
                const type = parseTranscribeResponseType(event.data);
                if (type == null) return;

                if (type === Corti.TranscribeConfigStatusMessageType.ConfigAccepted) {
                    cleanup();
                    resolve();
                } else if (TRANSCRIBE_CONFIG_REJECTION_TYPES.includes(type)) {
                    cleanup();
                    reject(new Error(type));
                } else if (type === "ended") {
                    cleanup();
                    reject(new Error("Connection ended before config was accepted"));
                }
            };

            socket.socket.addEventListener("message", onMessage);
            socket.socket.addEventListener("error", onError);
        });
    }
}
