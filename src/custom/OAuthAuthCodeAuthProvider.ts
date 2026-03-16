import type * as Corti from "../api/index.js";
import type { OAuthAuthProvider } from "../auth/OAuthAuthProvider.js";
import type { BaseClientOptions } from "../BaseClient.js";
import * as core from "../core/index.js";
import * as errors from "../errors/index.js";
import { CortiAuth } from "./CortiAuth.js";
import {
    BUFFER_IN_MINUTES,
    CLIENT_ID_PARAM,
    CLIENT_ID_REQUIRED_ERROR_MESSAGE,
    CLIENT_SECRET_PARAM,
    CLIENT_SECRET_REQUIRED_ERROR_MESSAGE,
    CODE_PARAM,
    CODE_REQUIRED_ERROR_MESSAGE,
    getExpiresAt,
    REDIRECT_URI_PARAM,
    REDIRECT_URI_REQUIRED_ERROR_MESSAGE,
} from "./utils/oauthAuthHelpers.js";

export class OAuthAuthCodeAuthProvider implements core.AuthProvider {
    private readonly options: BaseClientOptions & OAuthAuthProvider.AuthCodeCredentials;
    private readonly authClient: CortiAuth;
    private accessToken: string | undefined;
    private expiresAt: Date;
    private refreshPromise: Promise<string> | undefined;
    private storedRefreshToken: string | undefined;
    private refreshExpiresAt: Date | undefined;

    constructor(options: BaseClientOptions & OAuthAuthProvider.AuthCodeCredentials) {
        this.options = options;
        this.authClient = new CortiAuth(options);
        this.expiresAt = new Date();
    }

    public static canCreate(
        options?: Partial<OAuthAuthProvider.AuthCodeCredentials & BaseClientOptions>,
    ): options is BaseClientOptions & OAuthAuthProvider.AuthCodeCredentials {
        return (
            options?.[CLIENT_ID_PARAM] != null &&
            options?.[CLIENT_SECRET_PARAM] != null &&
            options?.[CODE_PARAM] != null &&
            options?.[REDIRECT_URI_PARAM] != null
        );
    }

    private async clientIdSupplier({
        endpointMetadata,
    }: {
        endpointMetadata?: core.EndpointMetadata;
    } = {}): Promise<string> {
        const supplier = this.options[CLIENT_ID_PARAM];
        if (supplier == null) {
            throw new errors.CortiError({ message: CLIENT_ID_REQUIRED_ERROR_MESSAGE });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
    }

    private async clientSecretSupplier({
        endpointMetadata,
    }: {
        endpointMetadata?: core.EndpointMetadata;
    } = {}): Promise<string> {
        const supplier = this.options[CLIENT_SECRET_PARAM];
        if (supplier == null) {
            throw new errors.CortiError({ message: CLIENT_SECRET_REQUIRED_ERROR_MESSAGE });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
    }

    private async codeSupplier({
        endpointMetadata,
    }: {
        endpointMetadata?: core.EndpointMetadata;
    } = {}): Promise<string> {
        const supplier = this.options[CODE_PARAM];
        if (supplier == null) {
            throw new errors.CortiError({ message: CODE_REQUIRED_ERROR_MESSAGE });
        }
        return core.EndpointSupplier.get(supplier, { endpointMetadata });
    }

    private async redirectUriSupplier({
        endpointMetadata,
    }: {
        endpointMetadata?: core.EndpointMetadata;
    } = {}): Promise<string> {
        const supplier = this.options[REDIRECT_URI_PARAM];
        if (supplier == null) {
            throw new errors.CortiError({ message: REDIRECT_URI_REQUIRED_ERROR_MESSAGE });
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
                const clientSecret = await this.clientSecretSupplier({ endpointMetadata });

                let tokenResponse: Corti.AuthTokenResponse;

                if (
                    clientId &&
                    this.storedRefreshToken &&
                    this.refreshExpiresAt &&
                    this.refreshExpiresAt > new Date()
                ) {
                    tokenResponse = await this.authClient.refreshToken({
                        clientId,
                        refreshToken: this.storedRefreshToken,
                        clientSecret,
                    });
                } else {
                    const code = await this.codeSupplier({ endpointMetadata });
                    const redirectUri = await this.redirectUriSupplier({ endpointMetadata });
                    tokenResponse = await this.authClient.getCodeFlowToken({
                        clientId,
                        clientSecret,
                        code,
                        redirectUri,
                    });
                }

                this.accessToken = tokenResponse.accessToken;
                this.expiresAt = getExpiresAt(tokenResponse.expiresIn, BUFFER_IN_MINUTES);
                if (tokenResponse.refreshToken) {
                    this.storedRefreshToken = tokenResponse.refreshToken;
                    this.refreshExpiresAt = tokenResponse.refreshExpiresIn
                        ? getExpiresAt(tokenResponse.refreshExpiresIn, BUFFER_IN_MINUTES)
                        : undefined;
                }
                return this.accessToken;
            } finally {
                this.refreshPromise = undefined;
            }
        })();
        return this.refreshPromise;
    }
}
