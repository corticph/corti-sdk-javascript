export type DecodedToken = {
    environment: string;
    tenantName: string;
    accessToken: string;
    expiresAt: number | undefined;
} | null;

export function decodeToken(token: string): DecodedToken {
    const parts = token ? token.split(".") : "";
    if (parts.length < 2) {
        return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    let jsonPayload: string;
    try {
        jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
                .join(""),
        );
    } catch {
        return null;
    }

    let tokenDetails: { iss: string; [key: string]: unknown };
    try {
        tokenDetails = JSON.parse(jsonPayload);
    } catch {
        return null;
    }

    const issuerUrl: string = tokenDetails.iss;
    if (!issuerUrl) {
        return null;
    }

    const regex = /^https:\/\/(keycloak|auth)\.([^.]+)\.corti\.app\/realms\/([^/]+)/;
    const match = issuerUrl.match(regex);

    if (match) {
        const expiresAt = tokenDetails.exp && typeof tokenDetails.exp === "number" ? tokenDetails.exp : undefined;
        return {
            environment: match[2],
            tenantName: match[3],
            accessToken: token,
            expiresAt,
        };
    }

    return null;
}
