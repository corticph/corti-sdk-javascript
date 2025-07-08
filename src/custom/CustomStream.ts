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
     */
    public async connect(
        args: Omit<FernStream.ConnectArgs, 'token' | 'tenantName'>,
        configuration?: api.StreamConfigurationMessage['configuration']
    ): Promise<StreamSocket> {
        const ws = await super.connect({
            ...args,
            token: await this._getAuthorizationHeader() || '',
            tenantName: await core.Supplier.get(this._options.tenantName),
        }) as StreamSocket;

        if (!configuration) {
            return ws;
        }

        ws.socket.addEventListener('open', () => {
            ws.sendConfiguration({
                type: 'config',
                configuration,
            });
        });

        ws.socket.addEventListener('message', (event) => {
            const data = fromJson(event.data);

            const parsedResponse = serializers.StreamSocketResponse.parse(data, {
                unrecognizedObjectKeys: "passthrough",
                allowUnrecognizedUnionMembers: true,
                allowUnrecognizedEnumValues: true,
                skipValidation: true,
                omitUndefined: true,
            });

            if (parsedResponse.ok && parsedResponse.value.type === 'CONFIG_ACCEPTED') {
                return;
            }

            if (parsedResponse.ok && (
                parsedResponse.value.type === 'CONFIG_DENIED'
                || parsedResponse.value.type === 'CONFIG_MISSING'
                || parsedResponse.value.type === 'CONFIG_TIMEOUT'
                || parsedResponse.value.type === 'CONFIG_NOT_PROVIDED'
            )) {
                ws.socket.dispatchEvent(new ErrorEvent({
                    name: parsedResponse.value.type,
                    message: `Configuration error "${parsedResponse.value.type}" : ${parsedResponse.value.reason || 'No reason provided'}`,
                }, ''));

                ws.close();
                return;
            }

            if (parsedResponse.ok && parsedResponse.value.type === 'ENDED') {
                ws.close();
                return;
            }
        })

        return ws;
    }
}
