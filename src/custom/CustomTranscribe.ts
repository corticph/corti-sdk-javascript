import { TranscribeClient } from "../api/resources/transcribe/client/Client.js";
import type { TranscribeSocket } from "../api/resources/transcribe/client/Socket.js";
import * as core from "../core/index.js";

export type CustomTranscribeConnectArgs = Partial<Omit<TranscribeClient.ConnectArgs, "tenantName" | "token">>;

export class CustomTranscribe extends TranscribeClient {
    public override async connect(args?: CustomTranscribeConnectArgs): Promise<TranscribeSocket> {
        const tenantName = await core.Supplier.get(this._options.tenantName);
        const authRequest = await this._options.authProvider?.getAuthRequest();
        const token = authRequest?.headers.Authorization ?? authRequest?.headers.authorization ?? "";

        return super.connect({ ...args, tenantName, token });
    }
}
