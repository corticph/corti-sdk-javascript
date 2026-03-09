import { CortiClient as BaseCortiClient } from "../Client.js";
import { CortiAuth } from "./CortiAuth.js";

export declare namespace CortiClient {
    /**
     * Patch: Auth via single object — clientId+clientSecret or accessToken — instead of top-level token/clientId/clientSecret.
     */
    export type Auth = { clientId: string; clientSecret: string } | { accessToken: string };

    export type Options = Omit<BaseCortiClient.Options, "clientId" | "clientSecret" | "token"> & {
        auth: CortiClient.Auth;
    };

    export interface RequestOptions extends BaseCortiClient.RequestOptions {}
}

/**
 * Patch: Extends base client; constructor takes auth object; auth getter returns CortiAuth instead of AuthClient.
 */
export class CortiClient extends BaseCortiClient {
    protected override _auth: CortiAuth | undefined;

    constructor(options: CortiClient.Options) {
        const { auth, ...rest } = options;
        const baseOptions: BaseCortiClient.Options =
            "clientId" in auth && "clientSecret" in auth
                ? { ...rest, clientId: auth.clientId, clientSecret: auth.clientSecret }
                : { ...rest, token: auth.accessToken };

        super(baseOptions);
    }

    public override get auth(): CortiAuth {
        return (this._auth ??= new CortiAuth(this._options));
    }
}
