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
import * as environments from "../environments.js";
import { getEnvironment } from "./utils/getEnvironmentFromString.js";
import { AuthGetTokenRequestCustom } from "./serialization/index.js";
import { AuthGetTokenRequestWithAuthorizationCode } from "./serialization/corti-auth/AuthGetTokenRequestWithAuthorizationCode.js";
import { AuthGetTokenRequestWithRefreshToken } from "./serialization/corti-auth/AuthGetTokenWithRefreshToken.js";

export { AuthGetTokenRequestCustom };

interface AuthorizationCodeClient {
    clientId: string;
    redirectUri: string;
}

interface Options {
    skipRedirect?: boolean;
}

type AuthOptions = Omit<FernAuth.Options, "environment"> & {
    environment: core.Supplier<environments.CortiEnvironment | environments.CortiEnvironmentUrls> | string;
};

export class Auth extends FernAuth {
    /**
     * Patch: use custom AuthOptions type to support string-based environment
     */
    constructor(_options: AuthOptions) {
        super({
            ..._options,
            environment: getEnvironment(_options.environment),
        });
    }

    /**
     * Patch: called custom implementation this.__getToken_custom instead of this.__getToken
     */
    public getToken(
        request: Corti.AuthGetTokenRequest,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return core.HttpResponsePromise.fromPromise(
            this.__getToken_custom({ ...request, grantType: "client_credentials" }, requestOptions),
        );
    }

    /**
     * Patch: added method to get Authorization URL for Authorization code flow
     */
    public async authorizeURL({ clientId, redirectUri }: AuthorizationCodeClient, options?: Options): Promise<string> {
        const authUrl = new URL(
            core.url.join(
                (await core.Supplier.get(this._options.baseUrl)) ??
                (await core.Supplier.get(this._options.environment)).login,
                await core.Supplier.get(this._options.tenantName),
                "protocol/openid-connect/auth",
            ),
        );

        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", "openid profile");

        if (clientId !== undefined) {
            authUrl.searchParams.set("client_id", clientId);
        }

        if (redirectUri !== undefined) {
            authUrl.searchParams.set("redirect_uri", redirectUri);
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
        request: Omit<AuthGetTokenRequestWithAuthorizationCode, "grantType">,
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
     * Patch: copy of this.__getToken with patches
     */
    private async __getToken_custom(
        /**
         * Patch: added additional fields to request to support Authorization code flow
         */
        request: AuthGetTokenRequestCustom,
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
            body: new URLSearchParams({
                ...AuthGetTokenRequestCustom.jsonOrThrow(request, {
                    unrecognizedObjectKeys: "strip",
                    omitUndefined: true,
                }),
                scope: "openid",
            }),
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
        request: Omit<AuthGetTokenRequestWithRefreshToken, "grantType">,
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
