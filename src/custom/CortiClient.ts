import { CortiClient as BaseCortiClient } from "../Client.js";
import type * as environments from "../environments.js";
import type { OAuthAuthProvider } from "../auth/OAuthAuthProvider.js";
import { authToBaseOptions } from "./utils/authToBaseOptions.js";
import { getEnvironment, type Environment } from "./utils/environment.js";
import { resolveClientOptions } from "./utils/resolveClientOptions.js";
import { CortiAuth } from "./CortiAuth.js";

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
>;

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
    }

    public override get auth(): CortiAuth {
        return (this._auth ??= new CortiAuth(this._options));
    }
}
