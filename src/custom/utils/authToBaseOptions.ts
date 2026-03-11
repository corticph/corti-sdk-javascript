import type { CortiClient as BaseCortiClient } from "../../Client.js";
import type { OAuthAuthProvider } from "../../auth/OAuthAuthProvider.js";

export type AuthForBaseOptions =
    | { clientId: string; clientSecret: string }
    | { accessToken: string; refreshAccessToken?: OAuthAuthProvider.RefreshAccessTokenFunction; expiresIn?: number; refreshToken?: string; refreshExpiresIn?: number; clientId?: string }
    | { clientId: string; username: string; password: string }
    | { refreshAccessToken: OAuthAuthProvider.RefreshAccessTokenFunction; accessToken?: string; expiresIn?: number; refreshToken?: string; refreshExpiresIn?: number; clientId?: string };

export type OptionsRest = Omit<BaseCortiClient.Options, "clientId" | "clientSecret" | "token">;

export function authToBaseOptions(
    auth: AuthForBaseOptions,
    rest: OptionsRest,
): BaseCortiClient.Options {
    if ("username" in auth && "password" in auth) {
        return {
            ...rest,
            clientId: auth.clientId,
            username: auth.username,
            password: auth.password,
        };
    }

    if ("clientId" in auth && "clientSecret" in auth) {
        return { ...rest, clientId: auth.clientId, clientSecret: auth.clientSecret };
    }

    // Bearer / token override — covers plain token, token + optional refreshAccessToken, and standalone refreshAccessToken
    return {
        ...rest,
        token: auth.accessToken,
        refreshAccessToken: auth.refreshAccessToken,
        expiresIn: auth.expiresIn,
        refreshToken: auth.refreshToken,
        refreshExpiresIn: auth.refreshExpiresIn,
        clientId: auth.clientId,
    };
}
