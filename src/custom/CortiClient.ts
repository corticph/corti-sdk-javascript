import { CortiClient as BaseCortiClient } from "../Client.js";
import type { OAuthAuthProvider } from "../auth/OAuthAuthProvider.js";
import { authToBaseOptions } from "./utils/authToBaseOptions.js";
import { getEnvironment, type Environment } from "./utils/environment.js";
import { CortiAuth } from "./CortiAuth.js";

export declare namespace CortiClient {
    export type Auth =
        | { clientId: string; clientSecret: string }
        | { accessToken: string; refreshAccessToken?: OAuthAuthProvider.RefreshAccessTokenFunction; expiresIn?: number; refreshToken?: string; refreshExpiresIn?: number; clientId?: string }
        | { clientId: string; username: string; password: string }
        | { refreshAccessToken: OAuthAuthProvider.RefreshAccessTokenFunction; accessToken?: string; expiresIn?: number; refreshToken?: string; refreshExpiresIn?: number; clientId?: string };

    export type Options = Omit<BaseCortiClient.Options, "clientId" | "clientSecret" | "token" | "environment"> & {
        auth: CortiClient.Auth;
        environment: Environment;
    };

    export interface RequestOptions extends BaseCortiClient.RequestOptions {}
}

export class CortiClient extends BaseCortiClient {
    protected override _auth: CortiAuth | undefined;

    constructor(options: CortiClient.Options) {
        const { auth, environment, ...rest } = options;

        super(authToBaseOptions(auth, { ...rest, environment: getEnvironment(environment) }));
    }

    public override get auth(): CortiAuth {
        return (this._auth ??= new CortiAuth(this._options));
    }
}
