import type { OAuthAuthProvider } from "../auth/OAuthAuthProvider.js";
import { CortiClient as BaseCortiClient } from "../Client.js";
import type * as environments from "../environments.js";
import { CortiAuth } from "./auth/CortiAuth.js";
import { CustomStream } from "./stream/CustomStream.js";
import { CustomTranscribe } from "./transcribe/CustomTranscribe.js";
import { authToBaseOptions } from "./utils/authToBaseOptions.js";
import { setDefaultWithCredentials } from "./utils/withCredentialsConfig.js";
import { type Environment, getEnvironment } from "./utils/environment.js";
import { resolveClientOptions } from "./utils/resolveClientOptions.js";

type TokenDerivableAuth =
    | {
          accessToken: string;
          refreshAccessToken?: OAuthAuthProvider.RefreshAccessTokenFunction;
          expiresIn?: number;
          refreshToken?: string;
          refreshExpiresIn?: number;
          clientId?: string;
      }
    | {
          refreshAccessToken: OAuthAuthProvider.RefreshAccessTokenFunction;
          accessToken?: string;
          expiresIn?: number;
          refreshToken?: string;
          refreshExpiresIn?: number;
          clientId?: string;
      };

type OptionsBase = Omit<
    BaseCortiClient.Options,
    "clientId" | "clientSecret" | "token" | "environment" | "tenantName" | "baseUrl"
> & {
    withCredentials?: boolean;
};

export declare namespace CortiClient {
    export type Auth =
        | { clientId: string; clientSecret: string }
        | {
              accessToken: string;
              refreshAccessToken?: OAuthAuthProvider.RefreshAccessTokenFunction;
              expiresIn?: number;
              refreshToken?: string;
              refreshExpiresIn?: number;
              clientId?: string;
          }
        | { clientId: string; username: string; password: string }
        | { clientId: string; clientSecret: string; code: string; redirectUri: string }
        | { clientId: string; code: string; redirectUri: string; codeVerifier?: string }
        | {
              refreshAccessToken: OAuthAuthProvider.RefreshAccessTokenFunction;
              accessToken?: string;
              expiresIn?: number;
              refreshToken?: string;
              refreshExpiresIn?: number;
              clientId?: string;
          };

    export type Options =
        // CC / ROPC / AuthCode / PKCE — tenantName and environment always required
        | (OptionsBase & {
              auth:
                  | { clientId: string; clientSecret: string }
                  | { clientId: string; username: string; password: string }
                  | { clientId: string; clientSecret: string; code: string; redirectUri: string }
                  | { clientId: string; code: string; redirectUri: string; codeVerifier?: string };
              tenantName: string;
              environment: Environment;
          })
        // Bearer / refresh — tenantName and environment derived from JWT when omitted
        | (OptionsBase & { auth: TokenDerivableAuth; tenantName?: string; environment?: Environment })
        // baseUrl set — fully custom endpoint, standard fields optional
        | (OptionsBase & { baseUrl: string; auth?: CortiClient.Auth; tenantName?: string; environment?: Environment })
        // Full CortiEnvironmentUrls object — explicit URLs, tenantName optional
        | (OptionsBase & {
              environment: environments.CortiEnvironmentUrls;
              auth?: CortiClient.Auth;
              tenantName?: string;
          });

    export interface RequestOptions extends BaseCortiClient.RequestOptions {}
}

export class CortiClient extends BaseCortiClient {
    protected override _auth: CortiAuth | undefined;
    protected override _stream: CustomStream | undefined;
    protected override _transcribe: CustomTranscribe | undefined;

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
    }

    public override get auth(): CortiAuth {
        return (this._auth ??= new CortiAuth(this._options));
    }

    public override get stream(): CustomStream {
        return (this._stream ??= new CustomStream(this._options));
    }

    public override get transcribe(): CustomTranscribe {
        return (this._transcribe ??= new CustomTranscribe(this._options));
    }
}
