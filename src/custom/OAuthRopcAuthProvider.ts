import type { BaseClientOptions } from "../BaseClient.js";
import type { OAuthAuthProvider } from "../auth/OAuthAuthProvider.js";
import {
    BUFFER_IN_MINUTES,
    CLIENT_ID_PARAM,
    CLIENT_ID_REQUIRED_ERROR_MESSAGE,
    getExpiresAt,
    PASSWORD_PARAM,
    PASSWORD_REQUIRED_ERROR_MESSAGE,
    USERNAME_PARAM,
    USERNAME_REQUIRED_ERROR_MESSAGE,
} from "./utils/oauthAuthHelpers.js";
import * as core from "../core/index.js";
import * as errors from "../errors/index.js";
import { CortiAuth } from "./CortiAuth.js";

export class OAuthRopcAuthProvider implements core.AuthProvider {
    private readonly options: BaseClientOptions & OAuthAuthProvider.RopcCredentials;
    private readonly authClient: CortiAuth;
    private accessToken: string | undefined;
    private expiresAt: Date;
    private refreshPromise: Promise<string> | undefined;

    constructor(options: BaseClientOptions & OAuthAuthProvider.RopcCredentials) {
        this.options = options;
        this.authClient = new CortiAuth(options);
        this.expiresAt = new Date();
    }

    public static canCreate(
        options?: Partial<OAuthAuthProvider.RopcCredentials & BaseClientOptions>,
    ): options is BaseClientOptions & OAuthAuthProvider.RopcCredentials {
        return (
            options?.[CLIENT_ID_PARAM] != null &&
            options?.[USERNAME_PARAM] != null &&
            options?.[PASSWORD_PARAM] != null
        );
    }

    private async clientIdSupplier({
        endpointMetadata,
    }: { endpointMetadata?: core.EndpointMetadata } = {}): Promise<string> {
        const supplier = this.options[CLIENT_ID_PARAM];
        if (supplier == null) {
            throw new errors.CortiError({ message: CLIENT_ID_REQUIRED_ERROR_MESSAGE });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
    }

    private async usernameSupplier({
        endpointMetadata,
    }: { endpointMetadata?: core.EndpointMetadata } = {}): Promise<string> {
        const supplier = this.options[USERNAME_PARAM];
        if (supplier == null) {
            throw new errors.CortiError({ message: USERNAME_REQUIRED_ERROR_MESSAGE });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
    }

    private async passwordSupplier({
        endpointMetadata,
    }: { endpointMetadata?: core.EndpointMetadata } = {}): Promise<string> {
        const supplier = this.options[PASSWORD_PARAM];
        if (supplier == null) {
            throw new errors.CortiError({ message: PASSWORD_REQUIRED_ERROR_MESSAGE });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
    }

    public async getAuthRequest({
        endpointMetadata,
    }: {
        endpointMetadata?: core.EndpointMetadata;
    } = {}): Promise<core.AuthRequest> {
        const token = await this.getToken({ endpointMetadata });

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }

    private async getToken({ endpointMetadata }: { endpointMetadata?: core.EndpointMetadata } = {}): Promise<string> {
        if (this.accessToken && this.expiresAt > new Date()) {
            return this.accessToken;
        }
        if (this.refreshPromise != null) {
            return this.refreshPromise;
        }
        return this.refresh({ endpointMetadata });
    }

    private async refresh({ endpointMetadata }: { endpointMetadata?: core.EndpointMetadata } = {}): Promise<string> {
        this.refreshPromise = (async () => {
            try {
                const clientId = await this.clientIdSupplier({ endpointMetadata });
                const username = await this.usernameSupplier({ endpointMetadata });
                const password = await this.passwordSupplier({ endpointMetadata });
                const tokenResponse = await this.authClient.getRopcFlowToken({
                    clientId,
                    username,
                    password,
                });

                this.accessToken = tokenResponse.accessToken;
                this.expiresAt = getExpiresAt(tokenResponse.expiresIn, BUFFER_IN_MINUTES);
                return this.accessToken;
            } finally {
                this.refreshPromise = undefined;
            }
        })();
        return this.refreshPromise;
    }
}
