import type * as Corti from "../../api/index.js";

/** Shared scope string for token requests (openid + optional scopes, deduped). */
export function buildScopeString(scopes?: string[]): string {
    const allScopes = ["openid", ...(scopes || [])];
    return [...new Set(allScopes)].join(" ");
}

export type TokenRequestClientCredentials = {
    clientId: string;
    clientSecret: string;
    scopes?: string[];
};

export type TokenRequestRopc = {
    clientId: string;
    username: string;
    password: string;
    scopes?: string[];
};

export type TokenRequestRefresh = {
    clientId: string;
    refreshToken: string;
    clientSecret?: string;
    scopes?: string[];
};

export type TokenRequestAuthorizationCode = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
    scopes?: string[];
};

export function buildTokenRequestBody(
    request: TokenRequestClientCredentials | TokenRequestRopc | TokenRequestRefresh | TokenRequestAuthorizationCode,
):
    | Corti.AuthTokenRequestClientCredentials
    | Corti.AuthTokenRequestRopc
    | Corti.AuthTokenRequestRefresh
    | Corti.AuthTokenRequestAuthorizationCode {
    const scope = buildScopeString(request.scopes);

    if ("refreshToken" in request) {
        return {
            clientId: request.clientId,
            clientSecret: request.clientSecret,
            grantType: "refresh_token",
            refreshToken: request.refreshToken,
            scope,
        };
    }

    if ("code" in request) {
        return {
            clientId: request.clientId,
            clientSecret: request.clientSecret,
            grantType: "authorization_code",
            redirectUri: request.redirectUri,
            code: request.code,
            scope,
        };
    }

    if ("clientSecret" in request) {
        return {
            clientId: request.clientId,
            clientSecret: request.clientSecret,
            grantType: "client_credentials",
            scope,
        };
    }

    return {
        clientId: request.clientId,
        username: request.username,
        password: request.password,
        grantType: "password",
        scope,
    };
}
