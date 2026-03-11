import type * as Corti from "../api/index.js";
import { AuthClient } from "../api/resources/auth/client/Client.js";
import type { OAuthAuthProvider } from "../auth/OAuthAuthProvider.js";
import * as core from "../core/index.js";
import { buildTokenRequestBody } from "./utils/buildTokenRequestBody.js";

export declare namespace CortiAuth {
    /** Auth (clientId/clientSecret or token) is optional; credentials can be passed to getToken() instead. */
    export type Options = Omit<AuthClient.Options, "clientId" | "clientSecret" | "token"> &
        Partial<OAuthAuthProvider.ClientCredentials> &
        Partial<OAuthAuthProvider.TokenOverride>;

    /** Optional scopes on getToken request. */
    export interface GetTokenRequest extends Corti.OAuthTokenRequest {
        scopes?: string[];
    }

    /** ROPC (resource owner password credentials) request for getRopcFlowToken. */
    export interface GetRopcFlowTokenRequest {
        clientId: string;
        username: string;
        password: string;
        scopes?: string[];
    }

    /** Refresh token request for refreshToken. */
    export interface RefreshTokenRequest {
        clientId: string;
        refreshToken: string;
        clientSecret?: string;
        scopes?: string[];
    }
}

export class CortiAuth extends AuthClient {
    /** No-op auth provider so super.token() does not trigger OAuth refresh. When auth is omitted, a dummy token is passed so the base constructor does not throw. */
    constructor(options: CortiAuth.Options) {
        super({
            ...options,
            token: options.token ?? (() => ""),
        });

        this._options.authProvider = new core.NoOpAuthProvider();
    }

    /**
     * Exchange credentials for a short-lived access token using the tenant token endpoint (client_credentials).
     * Resolves tenant from client options. Supports optional scopes (openid is always included).
     *
     * @param request - Client credentials and optional scopes
     * @param requestOptions - Request-specific configuration
     *
     * @throws {@link Corti.BadRequestError}
     * @throws {@link Corti.UnauthorizedError}
     *
     * @example
     *     const response = await auth.getToken({
     *         clientId: "client_id",
     *         clientSecret: "client_secret",
     *         scopes: ["profile"]
     *     });
     */
    public override getToken(
        request: CortiAuth.GetTokenRequest,
        requestOptions?: AuthClient.RequestOptions,
    ): core.HttpResponsePromise<Corti.AuthTokenResponse> {
        return core.HttpResponsePromise.fromPromise(this._getTokenWithTenant(request, requestOptions ?? {}));
    }

    private async _getTokenWithTenant(
        request: CortiAuth.GetTokenRequest | CortiAuth.GetRopcFlowTokenRequest | CortiAuth.RefreshTokenRequest,
        requestOptions: AuthClient.RequestOptions,
    ): Promise<core.WithRawResponse<Corti.AuthTokenResponse>> {
        const authRequest = buildTokenRequestBody(request);
        const tenantName = await core.Supplier.get(this._options.tenantName);

        return this.token(tenantName, authRequest, requestOptions).withRawResponse();
    }

    /** Exchange username/password for access token via ROPC (resource owner password credentials). */
    public getRopcFlowToken(
        request: CortiAuth.GetRopcFlowTokenRequest,
        requestOptions?: AuthClient.RequestOptions,
    ): core.HttpResponsePromise<Corti.AuthTokenResponse> {
        return core.HttpResponsePromise.fromPromise(this._getTokenWithTenant(request, requestOptions ?? {}));
    }

    /**
     * Exchange a refresh token for a new access token (refresh_token grant).
     * Resolves tenant from client options.
     *
     * @param request - Client ID, refresh token, and optional scopes
     * @param requestOptions - Request-specific configuration
     *
     * @throws {@link Corti.BadRequestError}
     * @throws {@link Corti.UnauthorizedError}
     *
     * @example
     *     const response = await auth.refreshToken({
     *         clientId: "client_id",
     *         refreshToken: "refresh_token",
     *     });
     */
    public refreshToken(
        request: CortiAuth.RefreshTokenRequest,
        requestOptions?: AuthClient.RequestOptions,
    ): core.HttpResponsePromise<Corti.AuthTokenResponse> {
        return core.HttpResponsePromise.fromPromise(this._getTokenWithTenant(request, requestOptions ?? {}));
    }
}
