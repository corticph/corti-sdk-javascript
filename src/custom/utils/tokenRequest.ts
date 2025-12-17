import * as Corti from "../../api/index.js";
import * as serializers from "../../serialization/index.js";

export type TokenRequest = Corti.AuthGetTokenRequest &
    Partial<{
        grantType: "client_credentials" | "authorization_code" | "refresh_token" | "password";
        code: string;
        redirectUri: string;
        refreshToken: string;
        codeVerifier: string;
        username: string;
        password: string;
        scopes: string[];
    }>;

export const buildTokenRequestBody = (request: TokenRequest): URLSearchParams => {
    type TokenRequestBody = Record<string, string>;
    const serializedRequest = serializers.AuthGetTokenRequest.jsonOrThrow(request, {
        unrecognizedObjectKeys: "strip",
        omitUndefined: true,
    });

    // Build scope string: always include "openid", add any additional scopes
    const allScopes = ["openid", ...(request.scopes || [])];
    const scopeString = [...new Set(allScopes)].join(" ");

    const tokenRequestBody: TokenRequestBody = {
        scope: scopeString,
        grant_type: request.grantType || "client_credentials",
    };

    Object.entries(serializedRequest).forEach(([key, value]) => {
        if (value != null) {
            tokenRequestBody[key] = String(value);
        }
    });

    if (request.grantType === "authorization_code") {
        if (request.code != null) {
            tokenRequestBody.code = request.code;
        }
        if (request.redirectUri != null) {
            tokenRequestBody.redirect_uri = request.redirectUri;
        }
        if (request.codeVerifier != null) {
            tokenRequestBody.code_verifier = request.codeVerifier;
        }
    }

    if (request.grantType === "refresh_token" && request.refreshToken != null) {
        tokenRequestBody.refresh_token = request.refreshToken;
    }

    if (request.grantType === "password") {
        if (request.username != null) {
            tokenRequestBody.username = request.username;
        }
        if (request.password != null) {
            tokenRequestBody.password = request.password;
        }
    }

    return new URLSearchParams(tokenRequestBody);
};
