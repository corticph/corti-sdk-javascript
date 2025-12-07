/**
 * This file is implementation of the Auth client that can be used in 2 scenarios:
 * 1. Under the hood by the package when Client credentials are used
 * 2. Directly imported by the user to implement Authorization code flow
 *
 * Locally based on the auto-generated Auth client (src/api/resources/auth/client/Client.ts), but with some changes:
 * 1. Token request sends proper `application/x-www-form-urlencoded` content type instead of `application/json`
 * 2. Token request accepts additional parameters to support Authorization code flow
 * 3. Additional methods to support Authorization code flow
 *
 * All methods are re-implemented, but class still extends the auto-generated one to make sure that we keep the same interface
 *  and to maybe remove some of the re-implementations in the future when `x-www-form-urlencoded` is supported
 */

import { Auth as FernAuth } from "../api/resources/auth/client/Client.js";
import * as core from "../core/index.js";
import * as Corti from "../api/index.js";
import { mergeHeaders, mergeOnlyDefinedHeaders } from "../core/headers.js";
import * as serializers from "../serialization/index.js";
import * as errors from "../errors/index.js";
import { Environment, CortiInternalEnvironment, getEnvironment } from "./utils/getEnvironmentFromString.js";
import { ParseError } from "../core/schemas/builders/schema-utils/ParseError.js";
import { getLocalStorageItem, setLocalStorageItem } from "./utils/localStorage.js";
import { generateCodeChallenge, generateCodeVerifier } from "./utils/pkce.js";
import { buildTokenRequestBody } from "./utils/tokenRequest.js";

const CODE_VERIFIER_KEY = "corti_js_sdk_code_verifier";

/**
 * Patch: added codeChallenge to the AuthorizationCodeClient interface to support PKCE flow
 */
interface AuthorizationCodeClient {
    clientId: string;
    redirectUri: string;
    codeChallenge?: string;
    scopes?: string[];
}

/**
 * Patch: renamed AuthorizationCodeClient to AuthorizationCode as it can be used for both(server and client) flows
 */
interface AuthorizationCode {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
    scopes?: string[];
}

/**
 * Patch: added type for AuthorizationPkce request
 */
interface AuthorizationPkce {
    clientId: string;
    redirectUri: string;
    code: string;
    codeVerifier?: string;
    scopes?: string[];
}

/**
 * Patch: added type for AuthorizationRopc request
 */
interface AuthorizationRopcServer {
    clientId: string;
    username: string;
    password: string;
    scopes?: string[];
}

interface AuthorizationRefreshServer {
    clientId: string;
    /**
     * Patch: added optional clientSecret for ROPC and PKCE flow
     */
    clientSecret?: string;
    refreshToken: string;
    scopes?: string[];
}

interface Options {
    skipRedirect?: boolean;
}

type AuthOptionsBase = Omit<FernAuth.Options, "environment" | "tenantName" | "baseUrl">;

// When baseUrl is provided, environment and tenantName are optional
type AuthOptionsWithBaseUrl = AuthOptionsBase & {
    baseUrl: core.Supplier<string>;
    environment?: Environment;
    tenantName?: core.Supplier<string>;
};

// When environment is an object, tenantName is optional
type AuthOptionsWithObjectEnvironment = AuthOptionsBase & {
    baseUrl?: core.Supplier<string>;
    environment: CortiInternalEnvironment;
    tenantName?: core.Supplier<string>;
};

// When environment is a string, tenantName is required
type AuthOptionsWithStringEnvironment = AuthOptionsBase & {
    baseUrl?: core.Supplier<string>;
    environment: string;
    tenantName: core.Supplier<string>;
};

type AuthOptions = AuthOptionsWithBaseUrl | AuthOptionsWithObjectEnvironment | AuthOptionsWithStringEnvironment;

export class Auth extends FernAuth {
    /**
     * Patch: use custom AuthOptions type to support string-based environment
     * When baseUrl is provided, environment and tenantName become optional
     */
    constructor(_options: AuthOptions) {
        super({
            ..._options,
            tenantName: _options.tenantName || "",
            environment: getEnvironment(_options.environment),
        });
    }

    /**
     * Patch: Generate PKCE authorization URL with automatic code verifier generation
     */
    public async authorizePkceUrl(
        { clientId, redirectUri, scopes }: AuthorizationCodeClient,
        options?: Options,
    ): Promise<string> {
        const codeVerifier = generateCodeVerifier();
        setLocalStorageItem(CODE_VERIFIER_KEY, codeVerifier);

        const codeChallenge = await generateCodeChallenge(codeVerifier);

        return this.authorizeURL(
            {
                clientId,
                redirectUri,
                codeChallenge,
                scopes,
            },
            options,
        );
    }

    /**
     * Patch: Get the stored PKCE code verifier
     */
    public getCodeVerifier(): string | null {
        return getLocalStorageItem(CODE_VERIFIER_KEY);
    }

    /**
     * Patch: called custom implementation this.__getToken_custom instead of this.__getToken
     * Extended to support additional scopes
     */
    public getToken(
        request: Corti.AuthGetTokenRequest & { scopes?: string[] },
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return core.HttpResponsePromise.fromPromise(this.__getToken_custom(request, requestOptions));
    }

    /**
     * Patch: added method to get Authorization URL for Authorization code flow and PKCE flow
     */
    public async authorizeURL(
        { clientId, redirectUri, codeChallenge, scopes }: AuthorizationCodeClient,
        options?: Options,
    ): Promise<string> {
        const authUrl = new URL(
            core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)).login,
                await core.Supplier.get(this._options.tenantName),
                "protocol/openid-connect/auth",
            ),
        );

        authUrl.searchParams.set("response_type", "code");

        // Build scope string: always include "openid profile", add any additional scopes
        const allScopes = ["openid", "profile", ...(scopes || [])];
        const scopeString = [...new Set(allScopes)].join(" ");

        authUrl.searchParams.set("scope", scopeString);

        if (clientId !== undefined) {
            authUrl.searchParams.set("client_id", clientId);
        }

        if (redirectUri !== undefined) {
            authUrl.searchParams.set("redirect_uri", redirectUri);
        }

        if (codeChallenge !== undefined) {
            authUrl.searchParams.set("code_challenge", codeChallenge);
            authUrl.searchParams.set("code_challenge_method", "S256");
        }

        const authUrlString = authUrl.toString();

        if (typeof window !== "undefined" && !options?.skipRedirect) {
            window.location.href = authUrlString;
            return authUrlString;
        }

        return authUrlString;
    }

    /**
     * Patch: calls __getToken_custom with additional fields to support Authorization code flow
     */
    public getCodeFlowToken(
        request: AuthorizationCode,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return core.HttpResponsePromise.fromPromise(
            this.__getToken_custom(
                {
                    ...request,
                    grantType: "authorization_code",
                },
                requestOptions,
            ),
        );
    }

    /**
     * Patch: PKCE-specific method
     */
    public getPkceFlowToken(
        request: AuthorizationPkce,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        const codeVerifier = request.codeVerifier || this.getCodeVerifier();

        if (!codeVerifier) {
            throw new ParseError([
                {
                    path: ["codeVerifier"],
                    message: "Code verifier was not provided and not found in localStorage.",
                },
            ]);
        }

        return core.HttpResponsePromise.fromPromise(
            this.__getToken_custom(
                {
                    ...request,
                    codeVerifier: codeVerifier,
                    grantType: "authorization_code",
                },
                requestOptions,
            ),
        );
    }

    /**
     * Patch: ROPC-specific method
     */
    public getRopcFlowToken(
        request: AuthorizationRopcServer,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return core.HttpResponsePromise.fromPromise(
            this.__getToken_custom(
                {
                    ...request,
                    grantType: "password",
                },
                requestOptions,
            ),
        );
    }

    /**
     * Patch: copy of this.__getToken with patches
     */
    private async __getToken_custom(
        /**
         * Patch: added additional fields to request to support Authorization PKCE and ROPC flow
         */
        request: Corti.AuthGetTokenRequest &
            Partial<{
                grantType: "client_credentials" | "authorization_code" | "refresh_token" | "password";
                code: string;
                redirectUri: string;
                refreshToken: string;
                codeVerifier: string;
                username: string;
                password: string;
                scopes: string[];
            }>,
        requestOptions?: FernAuth.RequestOptions,
    ): Promise<core.WithRawResponse<Corti.GetTokenResponse>> {
        const _response = await core.fetcher({
            url: core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                    (await core.Supplier.get(this._options.environment)).login,
                /**
                 * Patch: use tenantName as path parameter
                 *  (consider to be generated from the spec in the future)
                 */
                await core.Supplier.get(this._options.tenantName),
                "protocol/openid-connect/token",
            ),
            method: "POST",
            headers: mergeHeaders(
                this._options?.headers,
                mergeOnlyDefinedHeaders({
                    /**
                     * Patch: Removed `Authorization` header, as it is not needed for getting the token
                     */
                    "Tenant-Name": requestOptions?.tenantName,
                }),
                requestOptions?.headers,
            ),
            contentType: "application/x-www-form-urlencoded",
            /**
             * Patch: removed `requestType: "json"`, made body a URLSearchParams object
             */
            body: buildTokenRequestBody(request),
            timeoutMs: requestOptions?.timeoutInSeconds != null ? requestOptions.timeoutInSeconds * 1000 : 60000,
            maxRetries: requestOptions?.maxRetries,
            abortSignal: requestOptions?.abortSignal,
        });
        if (_response.ok) {
            return {
                data: serializers.GetTokenResponse.parseOrThrow(_response.body, {
                    unrecognizedObjectKeys: "passthrough",
                    allowUnrecognizedUnionMembers: true,
                    allowUnrecognizedEnumValues: true,
                    skipValidation: true,
                    breadcrumbsPrefix: ["response"],
                }),
                rawResponse: _response.rawResponse,
            };
        }

        if (_response.error.reason === "status-code") {
            throw new errors.CortiError({
                statusCode: _response.error.statusCode,
                body: _response.error.body,
                rawResponse: _response.rawResponse,
            });
        }

        switch (_response.error.reason) {
            case "non-json":
                throw new errors.CortiError({
                    statusCode: _response.error.statusCode,
                    body: _response.error.rawBody,
                    rawResponse: _response.rawResponse,
                });
            case "timeout":
                throw new errors.CortiTimeoutError(
                    "Timeout exceeded when calling POST /protocol/openid-connect/token.",
                );
            case "unknown":
                throw new errors.CortiError({
                    message: _response.error.errorMessage,
                    rawResponse: _response.rawResponse,
                });
        }
    }

    /**
     * Patch: calls __getToken_custom with additional fields to support Refresh token flow
     */
    public refreshToken(
        request: AuthorizationRefreshServer,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return core.HttpResponsePromise.fromPromise(
            this.__getToken_custom(
                {
                    ...request,
                    grantType: "refresh_token",
                },
                requestOptions,
            ),
        );
    }
}
