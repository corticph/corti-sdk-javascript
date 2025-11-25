/**
 * RefreshBearerProvider used as a replacement of OAuthTokenProvider, in case when accessToken from outside of library was used instead of Client credentials.
 */

import * as core from "../core/index.js";
import * as api from "../api/index.js";
import { decodeToken } from "./utils/decodeToken.js";

export type ExpectedTokenResponse = Omit<api.GetTokenResponse, "tokenType" | "expiresIn"> & {
    tokenType?: string;
    expiresIn?: number;
};
type RefreshAccessTokenFunction = (refreshToken?: string) => Promise<ExpectedTokenResponse> | ExpectedTokenResponse;

export type BearerOptions = Partial<Omit<api.GetTokenResponse, "accessToken">> &
    (
        | {
              refreshAccessToken?: RefreshAccessTokenFunction;
              accessToken: string;
          }
        | {
              refreshAccessToken: RefreshAccessTokenFunction;
              accessToken?: string;
          }
    );

export class RefreshBearerProvider {
    private readonly BUFFER_IN_MINUTES = 2;

    private _accessToken: string;
    private _refreshToken: string | undefined;

    private _refreshAccessToken: RefreshAccessTokenFunction | undefined;

    private _expiresAt: Date;
    private _refreshExpiresAt: Date;
    private _initialTokenResponse: Promise<ExpectedTokenResponse> | undefined;

    constructor({
        accessToken,
        refreshAccessToken,
        refreshToken,
        refreshExpiresIn,
        expiresIn,
        initialTokenResponse,
    }: BearerOptions & {
        initialTokenResponse?: Promise<ExpectedTokenResponse>;
    }) {
        this._accessToken = accessToken || "no_token";
        this._refreshToken = refreshToken;
        this._initialTokenResponse = initialTokenResponse;

        this._expiresAt = this.getExpiresAt(expiresIn, this._accessToken, this.BUFFER_IN_MINUTES);
        this._refreshExpiresAt = this.getExpiresAt(refreshExpiresIn, this._refreshToken, 0);

        this._refreshAccessToken = refreshAccessToken;
    }

    public async getToken(): Promise<string> {
        if (this._accessToken && this._accessToken !== "no_token" && this._expiresAt > new Date()) {
            return core.Supplier.get(this._accessToken);
        }

        if (this._initialTokenResponse) {
            const tokenResponse = await this._initialTokenResponse;
            this._initialTokenResponse = undefined;

            this._accessToken = tokenResponse.accessToken;
            this._expiresAt = this.getExpiresAt(
                tokenResponse.expiresIn,
                tokenResponse.accessToken,
                this.BUFFER_IN_MINUTES,
            );

            this._refreshToken = tokenResponse.refreshToken;
            this._refreshExpiresAt = this.getExpiresAt(tokenResponse.refreshExpiresIn, this._refreshToken, 0);

            return this.getToken();
        }

        return this.refresh();
    }

    private async refresh(): Promise<string> {
        if (!this._refreshAccessToken || (this._refreshToken && this._refreshExpiresAt < new Date())) {
            return core.Supplier.get(this._accessToken);
        }

        const tokenResponse = await this._refreshAccessToken(this._refreshToken);

        this._accessToken = tokenResponse.accessToken;
        this._expiresAt = this.getExpiresAt(tokenResponse.expiresIn, tokenResponse.accessToken, this.BUFFER_IN_MINUTES);

        this._refreshToken = tokenResponse.refreshToken;
        this._refreshExpiresAt = this.getExpiresAt(tokenResponse.refreshExpiresIn, this._refreshToken, 0);

        return this._accessToken;
    }

    private getExpiresAt(
        expiresIn: number | undefined,
        token: string | undefined,
        bufferInMinutes: number = this.BUFFER_IN_MINUTES,
    ): Date {
        if (typeof expiresIn === "number") {
            const now = new Date();

            return new Date(now.getTime() + expiresIn * 1000 - bufferInMinutes * 60 * 1000);
        }

        return this.parseTokenExpiry(token, bufferInMinutes) || this.getExpiresAt(0, token, bufferInMinutes);
    }

    private parseTokenExpiry(token: string | undefined, bufferInMinutes: number): Date | undefined {
        if (!token || token === "no_token") {
            return;
        }

        try {
            const decoded = decodeToken(token);

            if (decoded && typeof decoded.expiresAt === "number") {
                const ms = decoded.expiresAt * 1000 - bufferInMinutes * 60 * 1000;

                return new Date(ms);
            }
        } catch {}
    }
}
