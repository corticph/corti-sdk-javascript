import type * as Corti from "../../api/index.js";

/**
 * Patch: Custom scope handling for getToken (openid + optional scopes, deduped).
 */
export function buildTokenRequestBody(request: {
    clientId: string;
    clientSecret: string;
    scopes?: string[];
}): Corti.AuthTokenRequestClientCredentials {
    const allScopes = ["openid", ...(request.scopes || [])];
    const scopeString = [...new Set(allScopes)].join(" ");

    return {
        clientId: request.clientId,
        clientSecret: request.clientSecret,
        grantType: "client_credentials",
        scope: scopeString,
    };
}
