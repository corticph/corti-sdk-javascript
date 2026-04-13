import { CortiClient as BaseCortiClient } from "../Client.js";
import type * as environments from "../environments.js";
import * as core from "../core/index.js";
import { CortiAuth } from "./auth/CortiAuth.js";
import { CustomAgents } from "./agents/CustomAgents.js";
import { CustomStream } from "./stream/CustomStream.js";
import { CustomTranscribe } from "./transcribe/CustomTranscribe.js";
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

    private readonly _encodeHeadersAsWsProtocols: boolean | undefined;

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
            tenantName: ctx.tenantName,
            environment: getEnvironment(ctx.environment),
            ...(ctx.initialTokenResponse != null ? { initialTokenResponse: ctx.initialTokenResponse } : {}),
        } as Parameters<typeof authToBaseOptions>[1];

        super(authToBaseOptions(opts.auth, restOptions));

        setDefaultWithCredentials((options as OptionsBase).withCredentials);
        this._encodeHeadersAsWsProtocols = (options as OptionsBase).encodeHeadersAsWsProtocols;
    }

    public override get auth(): CortiAuth {
        return (this._auth ??= new CortiAuth(this._options));
    }

    public override get stream(): CustomStream {
        return (this._stream ??= new CustomStream({
            ...this._options,
            encodeHeadersAsWsProtocols: this._encodeHeadersAsWsProtocols,
        }));
    }

    public override get transcribe(): CustomTranscribe {
        return (this._transcribe ??= new CustomTranscribe({
            ...this._options,
            encodeHeadersAsWsProtocols: this._encodeHeadersAsWsProtocols,
        }));
    }

    public override get agents(): CustomAgents {
        return (this._agents ??= new CustomAgents(this._options));
    }

    public getAuthHeaders = async (): Promise<Headers> => {
        const req = await this._options.authProvider.getAuthRequest();
        
        return new Headers({
            ...(req.headers ?? {}),
            "Tenant-Name": await core.Supplier.get(this._options.tenantName),
        });
    };

    /**
     * Patch: removed `auth` getter
     */
}
