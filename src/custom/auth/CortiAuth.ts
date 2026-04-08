import type * as Corti from "../../api/index.js";
import { AuthClient } from "../../api/resources/auth/client/Client.js";
import type { OAuthAuthProvider } from "../../auth/OAuthAuthProvider.js";
import * as core from "../../core/index.js";
import { ParseError } from "../../core/schemas/index.js";
import { buildTokenRequestBody } from "../utils/buildTokenRequestBody.js";
import { type Environment, getEnvironment } from "../utils/environment.js";
import { CODE_VERIFIER_KEY, getLocalStorageItem, setLocalStorageItem } from "../utils/localStorageHelpers.js";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/pkceHelpers.js";
import { stripFernNormalizedHeaders } from "../utils/stripFernNormalizedHeaders.js";

interface Options {
    skipRedirect?: boolean;
}

export declare namespace CortiAuth {
    /** Auth (clientId/clientSecret or token) is optional; credentials can be passed to getToken() instead. */
    export type Options = Omit<AuthClient.Options, "clientId" | "clientSecret" | "token" | "environment"> &
        Partial<OAuthAuthProvider.ClientCredentials> &
        Partial<OAuthAuthProvider.TokenOverride> & {
            environment: Environment;
        };

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

    /** Authorization code grant request for getCodeFlowToken. */
    export interface GetCodeFlowTokenRequest {
        clientId: string;
        clientSecret: string;
        redirectUri: string;
        code: string;
        scopes?: string[];
    }

    /** PKCE grant request for getPkceFlowToken. codeVerifier is optional — if omitted, reads from localStorage. */
    export interface GetPkceFlowTokenRequest {
        clientId: string;
        redirectUri: string;
        code: string;
        codeVerifier?: string;
        scopes?: string[];
    }

    /** Parameters for authorizeURL — builds the Keycloak authorization endpoint URL. */
    export interface AuthorizationCodeClient {
        clientId: string;
        redirectUri: string;
        codeChallenge?: string;
        scopes?: string[];
    }

    /** Parameters for authorizePkceUrl — like AuthorizationCodeClient but without codeChallenge (generated internally). */
    export interface PkceClient {
        clientId: string;
        redirectUri: string;
        scopes?: string[];
        codeVerifier?: string;
    }
}

export class CortiAuth extends AuthClient {
    private readonly _tenantName: core.Supplier<string>;

    /** No-op auth provider so super.token() does not trigger OAuth refresh. When auth is omitted, a dummy token is passed so the base constructor does not throw. */
    constructor(options: CortiAuth.Options) {
        const { environment, tenantName, ...rest } = options;
        super({
            ...rest,
            tenantName: "",
            environment: getEnvironment(environment),
            token: options.token ?? (() => ""),
        });

        this._tenantName = tenantName;
        this._options.authProvider = new core.NoOpAuthProvider();

        /** Stripping Fern headers to bypass CORS on authentication requests */
        this._options.headers = stripFernNormalizedHeaders(this._options.headers);
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
        request:
            | CortiAuth.GetTokenRequest
            | CortiAuth.GetRopcFlowTokenRequest
            | CortiAuth.RefreshTokenRequest
            | CortiAuth.GetCodeFlowTokenRequest
            | (CortiAuth.GetPkceFlowTokenRequest & { codeVerifier: string }),
        requestOptions: AuthClient.RequestOptions,
    ): Promise<core.WithRawResponse<Corti.AuthTokenResponse>> {
        const authRequest = buildTokenRequestBody(request);
        const tenantName = await core.Supplier.get(this._tenantName);

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

    /** Exchange an authorization code for an access token (authorization_code grant). */
    public getCodeFlowToken(
        request: CortiAuth.GetCodeFlowTokenRequest,
        requestOptions?: AuthClient.RequestOptions,
    ): core.HttpResponsePromise<Corti.AuthTokenResponse> {
        return core.HttpResponsePromise.fromPromise(this._getTokenWithTenant(request, requestOptions ?? {}));
    }

    /**
     * Exchange a PKCE authorization code for an access token (authorization_code grant with code_verifier).
     * If codeVerifier is omitted, it is read from localStorage (set by authorizePkceUrl).
     */
    public getPkceFlowToken(
        request: CortiAuth.GetPkceFlowTokenRequest,
        requestOptions?: AuthClient.RequestOptions,
    ): core.HttpResponsePromise<Corti.AuthTokenResponse> {
        const codeVerifier = request.codeVerifier ?? getLocalStorageItem(CODE_VERIFIER_KEY);

        if (!codeVerifier) {
            throw new ParseError([
                {
                    path: ["codeVerifier"],
                    message: "Code verifier was not provided and not found in localStorage.",
                },
            ]);
        }

        return core.HttpResponsePromise.fromPromise(
            this._getTokenWithTenant({ ...request, codeVerifier }, requestOptions ?? {}),
        );
    }

    /**
     * Build the Keycloak authorization endpoint URL for the PKCE flow.
     * Generates a code verifier if not provided, stores it in localStorage, and computes the challenge.
     * In a browser environment, redirects to the URL unless skipRedirect is true.
     */
    public async authorizePkceUrl(
        { clientId, redirectUri, scopes, codeVerifier }: CortiAuth.PkceClient,
        options?: Options,
    ): Promise<string> {
        const verifier = codeVerifier ?? generateCodeVerifier();
        setLocalStorageItem(CODE_VERIFIER_KEY, verifier);

        const codeChallenge = await generateCodeChallenge(verifier);

        return this.authorizeURL({ clientId, redirectUri, codeChallenge, scopes }, options);
    }

    /** Read the PKCE code verifier stored in localStorage by authorizePkceUrl. Returns null if not found. */
    public static getCodeVerifier(): string | null {
        return getLocalStorageItem(CODE_VERIFIER_KEY);
    }

    /**
     * Build the Keycloak authorization endpoint URL for the authorization code flow.
     * In a browser environment, redirects to the URL unless skipRedirect is true.
     * In a server environment (no window), always returns the URL string.
     *
     * @param client - clientId, redirectUri, and optional codeChallenge/scopes
     * @param options - { skipRedirect?: boolean }
     */
    public async authorizeURL(
        { clientId, redirectUri, codeChallenge, scopes }: CortiAuth.AuthorizationCodeClient,
        options?: Options,
    ): Promise<string> {
        const envUrls = await core.Supplier.get(this._options.environment);
        const tenantName = await core.Supplier.get(this._tenantName);

        const authUrl = new URL(core.url.join(envUrls.login, tenantName, "protocol/openid-connect/auth"));

        authUrl.searchParams.set("response_type", "code");

        const allScopes = ["openid", "profile", ...(scopes ?? [])];
        authUrl.searchParams.set("scope", [...new Set(allScopes)].join(" "));

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
}
