import { StreamClient } from "../../api/resources/stream/client/Client.js";
import type { StreamSocket } from "../../api/resources/stream/client/Socket.js";
import * as Corti from "../../api/index.js";
import { ErrorEvent } from "../../core/websocket/events.js";
import { parseStreamResponseType } from "./parseStreamResponseType.js";
import * as core from "../../core/index.js";

const STREAM_CONFIG_REJECTION_TYPES: readonly string[] = [
    Corti.StreamConfigStatusMessageType.ConfigDenied,
    Corti.StreamConfigStatusMessageType.ConfigMissing,
    Corti.StreamConfigStatusMessageType.ConfigTimeout,
    Corti.StreamConfigStatusMessageType.ConfigNotProvided,
];

export type CustomStreamConnectArgs = {
    id: string;
    /** When provided, connect() resolves after CONFIG_ACCEPTED or rejects on failure. */
    configuration?: Corti.StreamConfig;
    /**
     * When true (default), connect() resolves after CONFIG_ACCEPTED or rejects on failure.
     * When false, returns socket immediately; config errors are dispatched as ErrorEvent.
     */
    awaitConfiguration?: boolean;
} & Partial<Omit<StreamClient.ConnectArgs, "id" | "tenantName" | "token">>;

export class CustomStream extends StreamClient {
    public override async connect(args: CustomStreamConnectArgs): Promise<StreamSocket> {
        const { configuration, awaitConfiguration = true, ...rest } = args;

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
     * Rejects and closes socket on CONFIG_DENIED / CONFIG_MISSING / CONFIG_TIMEOUT /
     * CONFIG_NOT_PROVIDED / connection error / ENDED.
     */
    private async _connectWithConfigAck(
        socket: StreamSocket,
        configuration: Corti.StreamConfig,
    ): Promise<StreamSocket> {
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
        socket: StreamSocket,
        configuration: Corti.StreamConfig,
    ): StreamSocket {
        socket.socket.addEventListener("open", () => {
            socket.sendConfiguration({ type: "config", configuration });
        });

        socket.socket.addEventListener("message", (event) => {
            const type = parseStreamResponseType(event.data);

            if (type == null || type === Corti.StreamConfigStatusMessageType.ConfigAccepted) {
                return;
            }

            if (STREAM_CONFIG_REJECTION_TYPES.includes(type) || type === "error") {
                socket.socket.dispatchEvent(new ErrorEvent(new Error(type), socket.socket));
                socket.close();
            } else if (type === "ENDED") {
                socket.close();
            }
        });

        return socket;
    }

    /** Resolves on CONFIG_ACCEPTED; rejects on rejection types, socket error, or ENDED. */
    private _buildConfigAckPromise(socket: StreamSocket): Promise<void> {
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
                const type = parseStreamResponseType(event.data);
                if (type == null) return;

                if (type === Corti.StreamConfigStatusMessageType.ConfigAccepted) {
                    cleanup();
                    resolve();
                } else if (STREAM_CONFIG_REJECTION_TYPES.includes(type)) {
                    cleanup();
                    reject(new Error(type));
                } else if (type === "ENDED") {
                    cleanup();
                    reject(new Error("Connection ended before config was accepted"));
                }
            };

            socket.socket.addEventListener("message", onMessage);
            socket.socket.addEventListener("error", onError);
        });
    }
}
