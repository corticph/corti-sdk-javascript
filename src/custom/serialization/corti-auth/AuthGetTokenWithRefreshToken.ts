import * as serializers from "../../../serialization/index.js";
import * as Corti from "../../../api/index.js";
import * as core from "../../../core/index.js";

export const AuthGetTokenRequestWithRefreshToken: core.serialization.Schema<
    AuthGetTokenRequestWithRefreshToken.Raw,
    AuthGetTokenRequestWithRefreshToken
> = core.serialization.object({
    clientId: core.serialization.property(
        "client_id",
        core.serialization.string(),
    ),
    clientSecret: core.serialization.property(
        "client_secret",
        core.serialization.string(),
    ),
    grantType: core.serialization.property(
        "grant_type",
        core.serialization.stringLiteral("refresh_token"),
    ),
    refreshToken: core.serialization.property(
        "refresh_token",
        core.serialization.string(),
    ),
});

export declare namespace AuthGetTokenRequestWithRefreshToken {
    export interface Raw extends serializers.AuthGetTokenRequest.Raw {
        grant_type: "refresh_token";
        refresh_token: string;
    }
}

export type AuthGetTokenRequestWithRefreshToken = {
    clientId: string;
    clientSecret: string;
    grantType: "refresh_token";
    refreshToken: string;
};
