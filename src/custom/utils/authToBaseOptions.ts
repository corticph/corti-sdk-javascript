import type { OAuthAuthProvider } from "../../auth/OAuthAuthProvider.js";
import type { CortiClient as BaseCortiClient } from "../../Client.js";

type InitialTokenResponse = Promise<OAuthAuthProvider.ExpectedTokenResponse> | undefined;

export type AuthForBaseOptions =
    | { clientId: string; clientSecret: string }
    | {
          accessToken: string;
          refreshAccessToken?: OAuthAuthProvider.RefreshAccessTokenFunction;
          expiresIn?: number;
          refreshToken?: string;
          refreshExpiresIn?: number;
          clientId?: string;
      }
    | { clientId: string; username: string; password: string }
    | { clientId: string; clientSecret: string; code: string; redirectUri: string }
    | { clientId: string; code: string; redirectUri: string; codeVerifier?: string }
    | {
          refreshAccessToken: OAuthAuthProvider.RefreshAccessTokenFunction;
          accessToken?: string;
          expiresIn?: number;
          refreshToken?: string;
          refreshExpiresIn?: number;
          clientId?: string;
      };

export type OptionsRest = Omit<BaseCortiClient.Options, "clientId" | "clientSecret" | "token">;

export function authToBaseOptions(auth: AuthForBaseOptions | undefined, rest: OptionsRest): BaseCortiClient.Options {
    // No auth — proxy/passthrough mode (e.g. custom environment URLs with no credentials)
    if (!auth) {
        return rest as BaseCortiClient.Options;
    }

    if ("username" in auth && "password" in auth) {
        return {
            ...rest,
            clientId: auth.clientId,
            username: auth.username,
            password: auth.password,
        };
    }

    // PKCE — no clientSecret; must come before auth code (both have code + redirectUri)
    if ("code" in auth && "redirectUri" in auth && !("clientSecret" in auth)) {
        return {
            ...rest,
            clientId: auth.clientId,
            code: auth.code,
            redirectUri: auth.redirectUri,
            codeVerifier: auth.codeVerifier,
        };
    }

    // Auth code — must come before CC since both have clientId + clientSecret
    if ("code" in auth && "redirectUri" in auth) {
        return {
            ...rest,
            clientId: auth.clientId,
            clientSecret: auth.clientSecret,
            code: auth.code,
            redirectUri: auth.redirectUri,
        };
    }

    if ("clientId" in auth && "clientSecret" in auth) {
        return { ...rest, clientId: auth.clientId, clientSecret: auth.clientSecret };
    }

    // Bearer / token override — covers plain token, token + optional refreshAccessToken, and standalone refreshAccessToken
    const initialTokenResponse = (rest as Record<string, unknown>).initialTokenResponse as InitialTokenResponse;

    return {
        ...rest,
        token: auth.accessToken,
        refreshAccessToken: auth.refreshAccessToken,
        expiresIn: auth.expiresIn,
        refreshToken: auth.refreshToken,
        refreshExpiresIn: auth.refreshExpiresIn,
        clientId: auth.clientId,
        ...(initialTokenResponse != null ? { initialTokenResponse } : {}),
    } as BaseCortiClient.Options;
}
