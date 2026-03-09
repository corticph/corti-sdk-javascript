import type * as Corti from "../api/index.js";
import { AuthClient } from "../api/resources/auth/client/Client.js";
import type { OAuthAuthProvider } from "../auth/OAuthAuthProvider.js";
import * as core from "../core/index.js";
import { buildTokenRequestBody } from "./utils/buildTokenRequestBody.js";

export declare namespace CortiAuth {
    /**
     * Patch: Auth (clientId/clientSecret or token) is optional; credentials can be passed to getToken() instead.
     */
    export type Options = Omit<AuthClient.Options, "clientId" | "clientSecret" | "token"> &
        Partial<OAuthAuthProvider.ClientCredentials> &
        Partial<OAuthAuthProvider.TokenOverride>;

    /**
     * Patch: Optional scopes on getToken request.
     */
    export interface GetTokenRequest extends Corti.OAuthTokenRequest {
        scopes?: string[];
    }
}

export class CortiAuth extends AuthClient {
    /**
     * Patch: Use no-op auth provider so super.token() does not trigger OAuthAuthProvider refresh (which calls base getToken → fake-token).
     * When auth is omitted from options, pass a dummy token so the base constructor does not throw.
     */
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
        request: CortiAuth.GetTokenRequest,
        requestOptions: AuthClient.RequestOptions,
    ): Promise<core.WithRawResponse<Corti.AuthTokenResponse>> {
        const authRequest = buildTokenRequestBody(request);
        const tenantName = await core.Supplier.get(this._options.tenantName);

        return this.token(tenantName, authRequest, requestOptions).withRawResponse();
    }
}
