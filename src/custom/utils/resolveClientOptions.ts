import type { OAuthAuthProvider } from "../../auth/OAuthAuthProvider.js";
import type * as core from "../../core/index.js";
import { ParseError } from "../../core/schemas/index.js";
import type * as environments from "../../environments.js";
import type { CortiClient } from "../overrides/CortiClient.js";
import { decodeToken } from "./decodeToken.js";
import { type Environment, getEnvironment } from "./environment.js";

export type ResolvedClientOptions = {
    environment: Environment;
    tenantName: core.Supplier<string>;
    /** Seeded token response from the discovery call — passed to the provider to avoid a second refreshAccessToken call. */
    initialTokenResponse?: Promise<OAuthAuthProvider.ExpectedTokenResponse>;
};

// Proxy mode: baseUrl or a full CortiEnvironmentUrls object — decode errors are silently ignored
function isProxyMode(options: { baseUrl?: string; environment?: Environment }): boolean {
    return !!(
        options.baseUrl ||
        (options.environment && typeof options.environment === "object" && !("then" in (options.environment as object)))
    );
}

function isCcOrRopcAuth(auth: CortiClient.Auth): boolean {
    return "clientSecret" in auth || "username" in auth;
}

export function resolveClientOptions(options: CortiClient.Options): ResolvedClientOptions {
    const opts = options as {
        auth?: CortiClient.Auth;
        tenantName?: string;
        environment?: Environment;
        baseUrl?: string;
    };

    // CC / ROPC — tenantName and environment are required by the Options type for this auth shape
    if (opts.auth && isCcOrRopcAuth(opts.auth)) {
        return {
            tenantName: opts.tenantName as string,
            environment: opts.environment as Environment,
        };
    }

    // Both already explicit — skip all JWT parsing regardless of auth variant
    if (opts.tenantName && opts.environment) {
        return { tenantName: opts.tenantName, environment: opts.environment };
    }

    // No auth (baseUrl-only or CortiEnvironmentUrls scenario)
    if (!opts.auth) {
        return { tenantName: opts.tenantName || "", environment: opts.environment || "" };
    }

    // accessToken present — decode to fill in whichever of tenantName/environment is still missing
    if ("accessToken" in opts.auth) {
        const decoded = decodeToken((opts.auth as { accessToken?: string }).accessToken || "");
        if (!decoded && !isProxyMode(opts)) {
            throw new ParseError([{ path: ["auth", "accessToken"], message: "Invalid access token format" }]);
        }
        return {
            tenantName: opts.tenantName || decoded?.tenantName || "",
            environment: opts.environment || decoded?.environment || "",
        };
    }

    // Only refreshAccessToken — fire once, share the same promise for tenant/env discovery AND
    // as the seed token for the provider (avoids a second refreshAccessToken call on first API request).
    const auth = opts.auth as {
        refreshAccessToken: OAuthAuthProvider.RefreshAccessTokenFunction;
        refreshToken?: string;
    };
    const discoveryPromise = (async () => {
        const tokenResponse = await auth.refreshAccessToken(auth.refreshToken);
        const decoded = decodeToken(tokenResponse.accessToken ?? "");
        if (!decoded && !isProxyMode(opts)) {
            throw new ParseError([
                { path: ["auth", "refreshAccessToken"], message: "Returned invalid access token format" },
            ]);
        }
        return { tokenResponse, tenantName: decoded?.tenantName || "", environment: decoded?.environment || "" };
    })();

    return {
        tenantName: opts.tenantName || discoveryPromise.then(({ tenantName }) => tenantName),
        // Must convert the decoded string region → CortiEnvironmentUrls; Promise<CortiEnvironmentUrls>
        // is a valid Supplier<CortiEnvironment | CortiEnvironmentUrls>.
        environment:
            opts.environment ||
            discoveryPromise.then(({ environment: env }) => getEnvironment(env) as environments.CortiEnvironmentUrls),
        initialTokenResponse: discoveryPromise.then(({ tokenResponse }) => tokenResponse),
    };
}
