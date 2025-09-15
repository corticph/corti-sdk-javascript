/**
 * RefreshBearerProvider used as a replacement of OAuthTokenProvider, in case when accessToken from outside of library was used instead of Client credentials.
 */

import * as core from "../core/index.js";
import * as api from "../api/index.js";

type RefreshAccessTokenFunction = (refreshToken?: string) => Promise<api.GetTokenResponse> | api.GetTokenResponse;

export type BearerOptions = Partial<Omit<api.GetTokenResponse, 'accessToken'>> & ({
    refreshAccessToken?: RefreshAccessTokenFunction;
    accessToken: core.Supplier<string>;
} | {
    refreshAccessToken: RefreshAccessTokenFunction;
    accessToken?: core.Supplier<string>;
});

export class RefreshBearerProvider {
    private readonly BUFFER_IN_MINUTES = 2;

    private _accessToken: core.Supplier<string>;
    private _refreshToken: string | undefined;

    private _refreshAccessToken: RefreshAccessTokenFunction | undefined;

    private _expiresAt: Date;
    private _refreshExpiresAt: Date;

    constructor({
        accessToken,
        refreshAccessToken,
        refreshToken,
        refreshExpiresIn,
        expiresIn,
    }: BearerOptions) {
        this._expiresAt = this.getExpiresAt(expiresIn, this.BUFFER_IN_MINUTES);
        this._refreshExpiresAt = this.getExpiresAt(refreshExpiresIn, 0);

        this._accessToken = accessToken || 'no_token';
        this._refreshToken = refreshToken;

        this._refreshAccessToken = refreshAccessToken;
    }

    public async getToken(): Promise<string> {
        if (this._accessToken && this._expiresAt > new Date()) {
            return core.Supplier.get(this._accessToken);
        }

        return this.refresh();
    }

    private async refresh(): Promise<string> {
        if (!this._refreshAccessToken || this._refreshToken && this._refreshExpiresAt < new Date()) {
            return core.Supplier.get(this._accessToken);
        }

        const tokenResponse = await this._refreshAccessToken(this._refreshToken);

        this._accessToken = tokenResponse.accessToken;
        this._expiresAt = this.getExpiresAt(tokenResponse.expiresIn, this.BUFFER_IN_MINUTES);

        this._refreshToken = tokenResponse.refreshToken;
        this._refreshExpiresAt = this.getExpiresAt(tokenResponse.refreshExpiresIn, 0);

        return this._accessToken;
    }

    private getExpiresAt(expiresInSeconds: number = 0, bufferInMinutes: number = this.BUFFER_IN_MINUTES): Date {
        const now = new Date();

        return new Date(now.getTime() + expiresInSeconds * 1000 - bufferInMinutes * 60 * 1000);
    }
}
