import * as serializers from "../../../serialization/index.js";
import * as core from "../../../core/index.js";

export const AuthGetTokenRequestWithAuthorizationCode: core.serialization.Schema<
    AuthGetTokenRequestWithAuthorizationCode.Raw,
    AuthGetTokenRequestWithAuthorizationCode
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
        core.serialization.stringLiteral("authorization_code"),
    ),
    code: core.serialization.property("code", core.serialization.string()),
    redirectUri: core.serialization.property(
        "redirect_uri",
        core.serialization.string(),
    ),
});

export declare namespace AuthGetTokenRequestWithAuthorizationCode {
    export interface Raw extends serializers.AuthGetTokenRequest.Raw {
        grant_type: "authorization_code";
        code: string;
        redirect_uri: string;
    }
}

export type AuthGetTokenRequestWithAuthorizationCode = {
    clientId: string;
    clientSecret: string;
    grantType: "authorization_code";
    code: string;
    redirectUri: string;
};
