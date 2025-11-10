import * as serializers from "../../../serialization/index.js";
import * as Corti from "../../../api/index.js";
import * as core from "../../../core/index.js";

export const CortiClientCustom: core.serialization.Schema<CortiClientCustom.Raw, Corti.AuthGetTokenRequest> =
    core.serialization.object({
        clientId: core.serialization.property("client_id", core.serialization.string()),
        clientSecret: core.serialization.property("client_secret", core.serialization.string()),
    });

export declare namespace CortiClientCustom {
    export interface Raw extends serializers.AuthGetTokenRequest.Raw {
        grantType?: "client_credentials" | "authorization_code" | "refresh_token";
        code?: string;
        redirectUri?: string;
        refreshToken?: string;
    }
}
