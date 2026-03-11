import { CortiClient as BaseCortiClient } from "../Client.js";
import { authToBaseOptions } from "./utils/authToBaseOptions.js";
import { CortiAuth } from "./CortiAuth.js";

export declare namespace CortiClient {
    export type Auth =
        | { clientId: string; clientSecret: string }
        | { accessToken: string }
        | { clientId: string; username: string; password: string };

    export type Options = Omit<BaseCortiClient.Options, "clientId" | "clientSecret" | "token"> & {
        auth: CortiClient.Auth;
    };

    export interface RequestOptions extends BaseCortiClient.RequestOptions {}
}

export class CortiClient extends BaseCortiClient {
    protected override _auth: CortiAuth | undefined;

    constructor(options: CortiClient.Options) {
        const { auth, ...rest } = options;

        super(authToBaseOptions(auth, rest));
    }

    public override get auth(): CortiAuth {
        return (this._auth ??= new CortiAuth(this._options));
    }
}
