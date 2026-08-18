import { CortiClient as BaseCortiClient } from "../Client.js";
import { mergeHeaders } from "../core/headers.js";
import * as core from "../core/index.js";
import type * as environments from "../environments.js";
import { CustomAgentic } from "./agentic/CustomAgentic.js";
import { CustomAgents } from "./agents/CustomAgents.js";
import { CortiAuth } from "./auth/CortiAuth.js";
import { CustomStream } from "./stream/CustomStream.js";
import { CustomTranscribe } from "./transcribe/CustomTranscribe.js";
import { X_CORTI_ANALYTICS } from "./utils/analytics.js";
import { authToBaseOptions } from "./utils/authToBaseOptions.js";
import { type Environment, getEnvironment } from "./utils/environment.js";
import { resolveClientOptions } from "./utils/resolveClientOptions.js";
import { setDefaultWithCredentials } from "./utils/withCredentialsConfig.js";

type OptionsBase = Omit<
    BaseCortiClient.Options,
    "clientId" | "clientSecret" | "token" | "environment" | "tenantName" | "baseUrl"
> & {
    withCredentials?: boolean;
    /**
     * Additional call-site metadata merged into the X-Corti-Analytics payload.
     * `sdk_version` and `sdk_type` are reserved and always set by the SDK.
     */
    analytics?: Record<string, string>;
    /**
     * When true, encodes the client's auth headers as WebSocket subprotocol pairs instead of
     * HTTP headers on every WebSocket connection. Useful when connecting through a gateway
     * that strips HTTP headers but passes WS protocols through.
     */
    encodeHeadersAsWsProtocols?: boolean;
};

export declare namespace CortiClient {
    export type Auth = CortiAuth.AuthServer | CortiAuth.AuthTokenDerivable;

    export type Options =
        // CC / ROPC / AuthCode / PKCE — tenantName and environment always required
        | (OptionsBase & { auth: CortiAuth.AuthServer; tenantName: string; environment: Environment })
        // Bearer / refresh — tenantName and environment derived from JWT when omitted
        | (OptionsBase & { auth: CortiAuth.AuthTokenDerivable; tenantName?: string; environment?: Environment })
        // baseUrl set — fully custom endpoint, standard fields optional
        | (OptionsBase & { baseUrl: string; auth?: Auth; tenantName?: string; environment?: Environment })
        // Full CortiEnvironmentUrls object — explicit URLs, tenantName optional
        | (OptionsBase & { environment: environments.CortiEnvironmentUrls; auth?: Auth; tenantName?: string });

    export interface RequestOptions extends BaseCortiClient.RequestOptions {}
}

export class CortiClient extends BaseCortiClient {
    protected override _auth: CortiAuth | undefined;
    protected override _stream: CustomStream | undefined;
    protected override _transcribe: CustomTranscribe | undefined;
    protected override _agents: CustomAgents | undefined;
    protected override _agentic: CustomAgentic | undefined;

    private readonly _encodeHeadersAsWsProtocols: boolean | undefined;
    private readonly _analytics: Record<string, string> | undefined;

    constructor(options: CortiClient.Options) {
        const opts = options as {
            auth?: CortiClient.Auth;
            environment?: Environment;
            tenantName?: string;
            baseUrl?: string;
        };
        const ctx = resolveClientOptions(options);

        const restOptions = {
            ...opts,
            headers: mergeHeaders(options.headers, {
                [X_CORTI_ANALYTICS]: options.analytics,
            }),
            tenantName: ctx.tenantName,
            environment: getEnvironment(ctx.environment),
            ...(ctx.initialTokenResponse != null ? { initialTokenResponse: ctx.initialTokenResponse } : {}),
        } as Parameters<typeof authToBaseOptions>[1];

        super(authToBaseOptions(opts.auth, restOptions));

        setDefaultWithCredentials((options as OptionsBase).withCredentials);
        this._encodeHeadersAsWsProtocols = (options as OptionsBase).encodeHeadersAsWsProtocols;
        this._analytics = options.analytics;
    }

    public override get auth(): CortiAuth {
        return (this._auth ??= new CortiAuth(this._options));
    }

    public override get stream(): CustomStream {
        return (this._stream ??= new CustomStream({
            ...this._options,
            encodeHeadersAsWsProtocols: this._encodeHeadersAsWsProtocols,
            analytics: this._analytics,
        }));
    }

    public override get transcribe(): CustomTranscribe {
        return (this._transcribe ??= new CustomTranscribe({
            ...this._options,
            encodeHeadersAsWsProtocols: this._encodeHeadersAsWsProtocols,
            analytics: this._analytics,
        }));
    }

    /** @deprecated Migrate to the Agentic API v2. See https://docs.corti.ai/agentic/guides/migrate-v1-to-v2 */
    public override get agents(): CustomAgents {
        return (this._agents ??= new CustomAgents(this._options));
    }

    public override get agentic(): CustomAgentic {
        return (this._agentic ??= new CustomAgentic(this._options));
    }

    /**
     * Returns the full set of URLs the client is configured to use.
     *
     * If a custom `baseUrl` was provided it overrides the `base` field; all
     * other URLs are derived from the configured environment.
     *
     * @example
     * ```typescript
     * const client = new CortiClient({ environment: "eu", ... });
     * const urls = await client.getEnvironmentUrls();
     * // { base: "https://api.eu.corti.app/v2", wss: "wss://...", login: "https://...", agents: "https://..." }
     * ```
     */
    public getEnvironmentUrls = async (): Promise<environments.CortiEnvironmentUrls> => {
        const baseUrl = await core.Supplier.get(this._options.baseUrl);
        // baseUrl is a universal override: all generated clients use `baseUrl ?? env.<field>`.
        // Resolve environment only in the fallback path to avoid triggering auth discovery needlessly.
        if (baseUrl != null) return { base: baseUrl, wss: baseUrl, login: baseUrl, agents: baseUrl };
        return await core.Supplier.get(this._options.environment);
    };

    /**
     * Retrieves authentication headers for API requests.
     *
     * This method returns a Headers object containing the Authorization header with a valid
     * bearer token and the Tenant-Name header. The token is automatically refreshed if needed.
     *
     * @returns A Promise that resolves to a Headers object with Authorization and Tenant-Name headers
     *
     * @example
     * ```typescript
     * const client = new CortiClient({ ... });
     * const headers = await client.getAuthHeaders();
     * console.log(headers.get("Authorization")); // "Bearer ..."
     * console.log(headers.get("Tenant-Name")); // "your-tenant"
     * ```
     */
    public getAuthHeaders = async (): Promise<Headers> => {
        const req = await this._options.authProvider.getAuthRequest();

        return new Headers({
            ...(req.headers ?? {}),
            "Tenant-Name": await core.Supplier.get(this._options.tenantName),
        });
    };
}
