/**
 * This file is the custom implementation of the main CortiClient class (src/Client.ts)
 *
 * It's (almost) handwritten, and it replaces the auto-generated version, and here is why:
 *
 * 1. The auto-generated version uses direct client imports -> we can not always easily replace them without a patch in Main client
 * 2. The auto-generated version produces TypeScript error when initializes authClient in `_oauthTokenProvider`
 * 3. `_oauthTokenProvider` is a private field in the auto-generated version,
 *   so we cannot easily rewrite it in the custom implementation. We can use another field for OAuthProvider,
 *   but then we need to rewrite all the methods anyway => it will be easier to forget,
 *   since it would exist in the class, but not properly implemented
 *
 * => Must be manually synced with src/Client.ts (which is auto-generated).
 *
 * All the patches marked with `// Patch: ...` comments.
 */

import * as environments from "../environments.js";
import * as core from "../core/index.js";
/**
 * Patch: changed import to custom Auth implementation
 */
import { Auth } from "./CortiAuth.js";
import { mergeHeaders } from "../core/headers.js";
import { Interactions } from "../api/resources/interactions/client/Client.js";
import { Recordings } from "../api/resources/recordings/client/Client.js";
import { Transcripts } from "../api/resources/transcripts/client/Client.js";
import { Facts } from "../api/resources/facts/client/Client.js";
import { Documents } from "../api/resources/documents/client/Client.js";
import { Templates } from "../api/resources/templates/client/Client.js";
import { Agents } from "../api/resources/agents/client/Client.js";

/**
 * Patch: changed import to custom Stream and Transcribe implementations
 */
import { Stream } from "./CustomStream.js";
import { Transcribe } from "./CustomTranscribe.js";

/**
 * Patch: added SDK_VERSION import and custom code imports
 */
import { SDK_VERSION } from "../version.js";
import { getEnvironment, Environment, CortiInternalEnvironment } from "./utils/getEnvironmentFromString.js";
import { resolveClientOptions } from "./utils/resolveClientOptions.js";
import { BearerOptions, RefreshBearerProvider } from "./RefreshBearerProvider.js";

export declare namespace CortiClient {
    /**
     * Patch: added new public type for `Options` + internal interfaces to create it
     */

    interface ClientCredentials {
        clientId: core.Supplier<string>;
        clientSecret: core.Supplier<string>;
    }

    interface BaseOptions {
        /** Additional headers to include in requests. */
        headers?: Record<string, string | core.Supplier<string | undefined> | undefined>;
        /** Specify a custom URL to connect the client to. */
        baseUrl?: core.Supplier<string>;
    }

    interface OptionsWithClientCredentials extends BaseOptions {
        /**
         * Patch: allow to pass a custom string-based environment
         * */
        environment: Environment;
        /** Override the Tenant-Name header */
        tenantName: core.Supplier<string>;
        auth: ClientCredentials;
    }

    interface OptionsWithBearerToken extends BaseOptions {
        /**
         * Patch: allow to pass a custom string-based environment
         * */
        environment?: Environment;
        /** Override the Tenant-Name header */
        tenantName?: core.Supplier<string>;
        auth: BearerOptions;
    }

    export type Options = OptionsWithClientCredentials | OptionsWithBearerToken;

    /**
     * Patch:
     *  - renamed `Options` to `InternalOptions`
     *  - added `token` field to support BearerProvider
     *  - made clientId and clientSecret optional
     *  - updated environment type to CortiInternalEnvironment
     */
    interface InternalOptions {
        environment: CortiInternalEnvironment;
        /** Specify a custom URL to connect the client to. */
        baseUrl?: core.Supplier<string>;
        clientId?: core.Supplier<string>;
        clientSecret?: core.Supplier<string>;
        token?: core.Supplier<string>;
        /** Override the Tenant-Name header */
        tenantName: core.Supplier<string>;
        /** Additional headers to include in requests. */
        headers?: Record<string, string | core.Supplier<string | undefined> | undefined>;
    }

    export interface RequestOptions {
        /** The maximum time to wait for a response in seconds. */
        timeoutInSeconds?: number;
        /** The number of times to retry the request. Defaults to 2. */
        maxRetries?: number;
        /** A hook to abort the request. */
        abortSignal?: AbortSignal;
        /** Override the Tenant-Name header */
        tenantName?: string;
        /** Additional headers to include in the request. */
        headers?: Record<string, string | core.Supplier<string | undefined> | undefined>;
    }
}

export class CortiClient {
    /**
     * Patch: this._options is now of type `CortiClient.InternalOptions` (which matches generated implementation)
     */
    protected readonly _options: CortiClient.InternalOptions;
    /**
     * Patch: extended `_oauthTokenProvider` to support both `RefreshBearerProvider` and `OAuthTokenProvider` options
     */
    private readonly _oauthTokenProvider: core.OAuthTokenProvider | RefreshBearerProvider;
    protected _interactions: Interactions | undefined;
    protected _recordings: Recordings | undefined;
    protected _transcripts: Transcripts | undefined;
    protected _facts: Facts | undefined;
    protected _templates: Templates | undefined;
    protected _documents: Documents | undefined;
    protected _agents: Agents | undefined;
    /**
     * Patch: removed `auth` field
     * `_oauthTokenProvider` uses Auth module directly to get the token,
     *   and our client also don't need to use it within the main client.
     *   For other cases they can use `CortiAuth` module directly.
     */
    protected _stream: Stream | undefined;
    protected _transcribe: Transcribe | undefined;

    constructor(_options: CortiClient.Options) {
        /**
         * Patch: resolve tenantName and environment from options or token
         */
        const { tenantName, environment, initialTokenResponse } = resolveClientOptions(_options);

        /**
         * Patch: redefining options based on new schema
         */
        this._options = {
            ..._options,
            headers: mergeHeaders(
                {
                    "Tenant-Name": tenantName,
                    "X-Fern-Language": "JavaScript",
                    "X-Fern-SDK-Name": "@corti/sdk",
                    /**
                     * Patch: replaced hardcoded SDK version with imported one
                     */
                    "X-Fern-SDK-Version": SDK_VERSION,
                    "User-Agent": `@corti/sdk/${SDK_VERSION}`,
                    "X-Fern-Runtime": core.RUNTIME.type,
                    "X-Fern-Runtime-Version": core.RUNTIME.version,
                },
                _options?.headers,
            ),
            clientId: "clientId" in _options.auth ? _options.auth.clientId : undefined,
            clientSecret: "clientSecret" in _options.auth ? _options.auth.clientSecret : undefined,
            token: "accessToken" in _options.auth ? _options.auth.accessToken : undefined,
            tenantName,
            environment: getEnvironment(environment),
        };

        /**
         * Patch: if `clientId` is provided, use OAuthTokenProvider, otherwise use BearerProvider
         */
        this._oauthTokenProvider =
            "clientId" in _options.auth
                ? new core.OAuthTokenProvider({
                      clientId: _options.auth.clientId,
                      clientSecret: _options.auth.clientSecret,
                      /**
                       * Patch: provide whole `options` object to the Auth client, since it depends on both tenantName and environment
                       */
                      authClient: new Auth(this._options),
                  })
                : new RefreshBearerProvider({
                      ..._options.auth,
                      initialTokenResponse,
                  });
    }

    public get interactions(): Interactions {
        return (this._interactions ??= new Interactions({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get recordings(): Recordings {
        return (this._recordings ??= new Recordings({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get transcripts(): Transcripts {
        return (this._transcripts ??= new Transcripts({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get facts(): Facts {
        return (this._facts ??= new Facts({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get documents(): Documents {
        return (this._documents ??= new Documents({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get templates(): Templates {
        return (this._templates ??= new Templates({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get agents(): Agents {
        return (this._agents ??= new Agents({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get stream(): Stream {
        return (this._stream ??= new Stream({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    public get transcribe(): Transcribe {
        return (this._transcribe ??= new Transcribe({
            ...this._options,
            token: async () => await this._oauthTokenProvider.getToken(),
        }));
    }

    /**
     * Patch: removed `auth` getter
     */
}
