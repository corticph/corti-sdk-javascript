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

import type * as Corti from "../api/index.js";
import { Auth as FernAuth } from "../api/resources/auth/client/Client.js";
import * as core from "../core/index.js";
import type * as environments from "../environments.js";
import { getEnvironment } from "./utils/getEnvironmentFromString.js";

interface AuthorizationCodeClient {
    clientId: string;
    redirectUri: string;
}

interface AuthorizationCodeServer {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    code: string;
}

interface AuthorizationRefreshServer {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
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
        const environment = getEnvironment(_options.environment);
        const loginUrl = core.Supplier.get(environment).then(async (env) => {
            const tenantName = await core.Supplier.get(_options.tenantName);

            return core.url.join(env.login, tenantName);
        });

        super({
            ..._options,
            environment,
            baseUrl: loginUrl,
        });
    }

    /**
     * Patch: called custom implementation this.__getToken_custom instead of this.__getToken
     */
    public getToken(
        request: Corti.AuthGetTokenRequest,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return super.getToken(
            {
                grantType: "client_credentials",
                ...request,
            },
            requestOptions,
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
        request: AuthorizationCodeServer,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return this.getToken(
            {
                ...request,
                grantType: "authorization_code",
            },
            requestOptions,
        );
    }

    /**
     * Patch: calls __getToken_custom with additional fields to support Refresh token flow
     */
    public refreshToken(
        request: AuthorizationRefreshServer,
        requestOptions?: FernAuth.RequestOptions,
    ): core.HttpResponsePromise<Corti.GetTokenResponse> {
        return this.getToken(
            {
                ...request,
                grantType: "refresh_token",
            },
            requestOptions,
        );
    }
}
