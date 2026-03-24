import { TranscribeClient } from "../../api/resources/transcribe/client/Client.js";
import type { TranscribeSocket } from "../../api/resources/transcribe/client/Socket.js";
import * as Corti from "../../api/index.js";
import { ErrorEvent } from "../../core/websocket/events.js";
import { parseTranscribeResponseType } from "./parseTranscribeResponseType.js";
import * as core from "../../core/index.js";

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
} & Partial<Omit<TranscribeClient.ConnectArgs, "tenantName" | "token">>;

export class CustomTranscribe extends TranscribeClient {
    public override async connect(args?: CustomTranscribeConnectArgs): Promise<TranscribeSocket> {
        const { configuration, awaitConfiguration = true, ...rest } = args ?? {};

        const tenantName = await core.Supplier.get(this._options.tenantName);
        const authRequest = await this._options.authProvider?.getAuthRequest();
        const token = authRequest?.headers.Authorization ?? authRequest?.headers.authorization ?? "";

        const socket = await super.connect({ ...rest, tenantName, token });

        if (!configuration) {
            return socket;
        }

        if (awaitConfiguration) {
            return this._connectWithConfigAck(socket, configuration);
        }

        return this._connectWithConfigListeners(socket, configuration);
    }

    /**
     * Sends configuration on open, then resolves after CONFIG_ACCEPTED.
     * Rejects and closes socket on CONFIG_DENIED / CONFIG_TIMEOUT /
     * connection error / ended.
     */
    private async _connectWithConfigAck(
        socket: TranscribeSocket,
        configuration: Corti.TranscribeConfig,
    ): Promise<TranscribeSocket> {
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
        socket: TranscribeSocket,
        configuration: Corti.TranscribeConfig,
    ): TranscribeSocket {
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
    private _buildConfigAckPromise(socket: TranscribeSocket): Promise<void> {
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
