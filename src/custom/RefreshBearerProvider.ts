/**
 * RefreshBearerProvider used as a replacement of OAuthTokenProvider, in case when accessToken from outside of library was used instead of Client credentials.
 */

import * as core from "../core/index.js";
import * as api from "../api/index.js";
import { decodeToken } from "./utils/decodeToken.js";

type ExpectedTokenResponse = Omit<api.GetTokenResponse, 'tokenType'> & { tokenType?: string };
type RefreshAccessTokenFunction = (refreshToken?: string) => Promise<ExpectedTokenResponse> | ExpectedTokenResponse;

export type BearerOptions = Partial<Omit<api.GetTokenResponse, 'accessToken'>> & ({
    refreshAccessToken?: RefreshAccessTokenFunction;
    accessToken: string;
} | {
    refreshAccessToken: RefreshAccessTokenFunction;
    accessToken?: string;
});

export class RefreshBearerProvider {
    private readonly BUFFER_IN_MINUTES = 2;

    private _accessToken: string;
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
        this._accessToken = accessToken || 'no_token';
        this._refreshToken = refreshToken;

        this._expiresAt = typeof expiresIn === "number"
            ? this.getExpiresAt(expiresIn, this.BUFFER_IN_MINUTES)
            : this.parseTokenExpiry(this._accessToken, this.BUFFER_IN_MINUTES) || this.getExpiresAt(0, this.BUFFER_IN_MINUTES);

        this._refreshExpiresAt = typeof refreshExpiresIn === "number"
            ? this.getExpiresAt(refreshExpiresIn, 0)
            : (this._refreshToken && this.parseTokenExpiry(this._refreshToken, 0)) || this.getExpiresAt(0, 0);

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
        this._expiresAt = typeof tokenResponse.expiresIn === "number"
            ? this.getExpiresAt(tokenResponse.expiresIn, this.BUFFER_IN_MINUTES)
            : this.parseTokenExpiry(tokenResponse.accessToken, this.BUFFER_IN_MINUTES) || this.getExpiresAt(0, this.BUFFER_IN_MINUTES);

        this._refreshToken = tokenResponse.refreshToken;
        this._refreshExpiresAt = typeof tokenResponse.refreshExpiresIn === "number"
            ? this.getExpiresAt(tokenResponse.refreshExpiresIn, 0)
            : this.parseTokenExpiry(this._refreshToken, 0) || this.getExpiresAt(0, 0);

        return this._accessToken;
    }

    private getExpiresAt(expiresInSeconds: number = 0, bufferInMinutes: number = this.BUFFER_IN_MINUTES): Date {
        const now = new Date();

        return new Date(now.getTime() + expiresInSeconds * 1000 - bufferInMinutes * 60 * 1000);
    }

    private parseTokenExpiry(token: string | undefined, bufferInMinutes: number): Date | undefined {
        if (!token || token === 'no_token') {
            return;
        }

        try {
            const decoded = decodeToken(token);

            if (decoded && typeof decoded.expiresAt === 'number') {
                const ms = decoded.expiresAt * 1000 - bufferInMinutes * 60 * 1000;

                return new Date(ms);
            }
        } catch {}
    }
}
