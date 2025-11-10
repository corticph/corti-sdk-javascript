import * as core from "../../../core/index.js";

import { AuthGetTokenRequestWithAuthorizationCode } from "./AuthGetTokenRequestWithAuthorizationCode.js";
import { AuthGetTokenRequestWithRefreshToken } from "./AuthGetTokenWithRefreshToken.js";
import { AuthGetTokenRequestWithClientCredentials } from "./AuthGetTokenWithClientCredentials.js";

export const AuthGetTokenRequestCustom: core.serialization.Schema<
    AuthGetTokenRequestCustom.Raw,
    AuthGetTokenRequestCustom
> = core.serialization.undiscriminatedUnion([
    AuthGetTokenRequestWithClientCredentials,
    AuthGetTokenRequestWithAuthorizationCode,
    AuthGetTokenRequestWithRefreshToken,
]);

export declare namespace AuthGetTokenRequestCustom {
    export type Raw =
        | AuthGetTokenRequestWithAuthorizationCode.Raw
        | AuthGetTokenRequestWithRefreshToken.Raw
        | AuthGetTokenRequestWithClientCredentials.Raw;
}

export type AuthGetTokenRequestCustom =
    | AuthGetTokenRequestWithClientCredentials
    | AuthGetTokenRequestWithAuthorizationCode
    | AuthGetTokenRequestWithRefreshToken;
