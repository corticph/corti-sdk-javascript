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
     */
    public async connect(
        args: Omit<FernTranscribe.ConnectArgs, 'token' | 'tenantName'> = {},
        configuration?: api.TranscribeConfig
    ): Promise<TranscribeSocket> {
        const ws = await super.connect({
            ...args,
            token: await this._getAuthorizationHeader() || '',
            tenantName: await core.Supplier.get(this._options.tenantName),
        }) as TranscribeSocket;

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

            const parsedResponse = serializers.TranscribeSocketResponse.parse(data, {
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
                || parsedResponse.value.type === 'CONFIG_TIMEOUT'
            )) {
                ws.socket.dispatchEvent(new ErrorEvent({
                    name: parsedResponse.value.type,
                    message: `Configuration error "${parsedResponse.value.type}" : ${parsedResponse.value.reason || 'No reason provided'}`,
                }, ''));

                ws.close();
                return;
            }

            if (parsedResponse.ok && parsedResponse.value.type === 'ended') {
                ws.close();
                return;
            }
        });

        return ws;
    }
}
