import * as core from "../../core/index.js";
import { decodeToken } from "./decodeToken.js";
import { CortiClient } from "../CortiClient.js";
import { ParseError } from "../../core/schemas/index.js";
import { Environment, getEnvironment } from "./getEnvironmentFromString.js";

type ResolvedClientOptions = {
    environment: Environment;
    tenantName: core.Supplier<string>;
};

function isClientCredentialsOptions(options: CortiClient.Options): options is CortiClient.OptionsWithClientCredentials {
    return "clientId" in options.auth;
}

export function resolveClientOptions(options: CortiClient.Options): ResolvedClientOptions {
    if (isClientCredentialsOptions(options)) {
        return {
            tenantName: options.tenantName,
            environment: options.environment,
        };
    }

    if ("accessToken" in options.auth && options.auth.accessToken) {
        const decoded = decodeToken(options.auth.accessToken);

        if (!decoded) {
            throw new ParseError([
                {
                    path: ["auth", "accessToken"],
                    message: "Invalid access token format",
                },
            ]);
        }

        return {
            tenantName: options.tenantName || decoded.tenantName,
            environment: options.environment || decoded.environment,
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

    const tokenResponsePromise = (async () => {
        const tokenResponse = await core.Supplier.get(options.auth.refreshAccessToken!);
        const decoded = decodeToken(tokenResponse.accessToken);

        if (!decoded) {
            throw new ParseError([
                {
                    path: ["auth", "refreshAccessToken"],
                    message: "Returned invalid access token format",
                },
            ]);
        }

        return {
            tenantName: decoded.tenantName,
            environment: decoded.environment,
        };
    })();

    return {
        tenantName:
            options.tenantName ||
            async function () {
                return (await tokenResponsePromise).tenantName;
            },
        environment: options.environment || async function () {
            const environment = getEnvironment((await tokenResponsePromise).environment);

            return core.Supplier.get(environment);
        },
    };
}
