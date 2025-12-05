import * as core from "../../core/index.js";
import { decodeToken } from "./decodeToken.js";
import { CortiClient } from "../CortiClient.js";
import { ParseError } from "../../core/schemas/index.js";
import { Environment, getEnvironment } from "./getEnvironmentFromString.js";
import { ExpectedTokenResponse } from "../RefreshBearerProvider.js";

type ResolvedClientOptions = {
    environment: Environment;
    tenantName: core.Supplier<string>;
    initialTokenResponse?: Promise<ExpectedTokenResponse>;
};

function isClientCredentialsOptions(options: CortiClient.Options): options is CortiClient.OptionsWithClientCredentials {
    return !!options.auth && "clientId" in options.auth;
}

export function resolveClientOptions(options: CortiClient.Options): ResolvedClientOptions {
    if (isClientCredentialsOptions(options)) {
        return {
            tenantName: options.tenantName,
            environment: options.environment,
        };
    }

    // When auth is not provided (baseUrl-only or environment-object scenario), use provided values or defaults
    if (!options.auth) {
        return {
            tenantName: options.tenantName || "",
            environment: options.environment || "",
        };
    }

    if ("accessToken" in options.auth) {
        const decoded = decodeToken(options.auth.accessToken || "");

        /**
         * Do not throw an error when we have some proxying:
         *  baseUrl is set
         *  or
         *  environment is explicitly provided (not string-generated)
         */
        if (!decoded && !options.baseUrl && typeof options.environment !== "object") {
            throw new ParseError([
                {
                    path: ["auth", "accessToken"],
                    message: "Invalid access token format",
                },
            ]);
        }

        return {
            tenantName: options.tenantName || decoded?.tenantName || "",
            environment: options.environment || decoded?.environment || "",
        };
    }

    /**
     * This branch -- is when we have "refreshAccessToken" defined but no accessToken.
     * Trying to avoid initial request at all cost
     */
    if (options.tenantName && options.environment) {
        return {
            tenantName: options.tenantName,
            environment: options.environment,
        };
    }

    // At this point, auth exists and has refreshAccessToken (BearerOptions without accessToken)
    const auth = options.auth as { refreshAccessToken: () => Promise<ExpectedTokenResponse> };

    const tokenResponsePromise = (async () => {
        const tokenResponse = await core.Supplier.get(auth.refreshAccessToken);
        const decoded = decodeToken(tokenResponse.accessToken);

        /**
         * Do not throw an error when we have some proxying:
         *  baseUrl is set
         *  or
         *  environment is explicitly provided (not string-generated)
         */
        if (!decoded && !options.baseUrl && typeof options.environment !== "object") {
            throw new ParseError([
                {
                    path: ["auth", "refreshAccessToken"],
                    message: "Returned invalid access token format",
                },
            ]);
        }

        return {
            tokenResponse,
            tenantName: decoded?.tenantName || "",
            environment: decoded?.environment || "",
        };
    })();

    return {
        tenantName: options.tenantName || tokenResponsePromise.then(({ tenantName }) => tenantName),
        environment:
            options.environment ||
            tokenResponsePromise.then(({ environment }) => core.Supplier.get(getEnvironment(environment))),
        initialTokenResponse: tokenResponsePromise.then((result) => result.tokenResponse),
    };
}
