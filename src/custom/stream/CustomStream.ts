import { StreamClient } from "../../api/resources/stream/client/Client.js";
import type { StreamSocket } from "../../api/resources/stream/client/Socket.js";
import * as core from "../../core/index.js";

export type CustomStreamConnectArgs = { id: string } & Partial<
    Omit<StreamClient.ConnectArgs, "id" | "tenantName" | "token">
>;

export class CustomStream extends StreamClient {
    public override async connect(args: CustomStreamConnectArgs): Promise<StreamSocket> {
        const tenantName = await core.Supplier.get(this._options.tenantName);
        const authRequest = await this._options.authProvider?.getAuthRequest();
        const token = authRequest?.headers.Authorization ?? authRequest?.headers.authorization ?? "";
        return super.connect({ ...args, tenantName, token });
    }
}
