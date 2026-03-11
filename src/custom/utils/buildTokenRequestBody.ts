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

export function buildTokenRequestBody(
    request: TokenRequestClientCredentials | TokenRequestRopc,
): Corti.AuthTokenRequestClientCredentials | Corti.AuthTokenRequestRopc {
    const scope = buildScopeString(request.scopes);

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
