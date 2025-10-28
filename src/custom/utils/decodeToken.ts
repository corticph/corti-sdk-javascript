/**
 * Decodes a JWT token and extracts environment and tenant details from its issuer URL.
 *
 * This function assumes the JWT token follows the standard header.payload.signature format.
 * It decodes the payload from base64 URL format, parses it as JSON, and then uses a regex
 * to extract the `environment` and `tenant` from the issuer URL (iss field) if it matches the pattern:
 * https://keycloak.{environment}.corti.app/realms/{tenant}.
 *
 * @param token - A JSON Web Token (JWT) string.
 * @returns An object containing:
 *  - `environment`: The extracted environment from the issuer URL.
 *  - `tenant`: The extracted tenant from the issuer URL.
 *  - `accessToken`: The original token string.
 * If the issuer URL doesn't match the expected format, the function returns the full decoded token details.
 *
 * @throws Will throw an error if:
 *  - The token format is invalid.
 *  - The base64 decoding or URI decoding fails.
 *  - The JSON payload is invalid.
 *  - The token payload does not contain an issuer (iss) field.
 */
export function decodeToken(token: string) {
    // Validate the token structure (should contain at least header and payload parts)
    const parts = token.split('.');
    if (parts.length < 2) {
        throw new Error('Invalid token format');
    }

    // Retrieve the payload (second part) of the JWT token
    const base64Url = parts[1];

    // Replace URL-safe characters to match standard base64 encoding
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode the base64 string into a JSON string
    let jsonPayload: string;
    try {
        jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        );
    } catch (error) {
        throw new Error('Failed to decode token payload');
    }

    // Parse the JSON string to obtain token details
    let tokenDetails: { iss: string; [key: string]: unknown };
    try {
        tokenDetails = JSON.parse(jsonPayload);
    } catch (error) {
        throw new Error('Invalid JSON payload in token');
    }

    // Extract the issuer URL from the token details
    const issuerUrl: string = tokenDetails.iss;
    if (!issuerUrl) {
        throw new Error('Token payload does not contain an issuer (iss) field');
    }

    // Regex to extract environment and tenant from issuer URL:
    // Expected format: https://keycloak.{environment}.corti.app/realms/{tenant}
    // Note: Unnecessary escapes in character classes have been removed.
    const regex =
        /^https:\/\/(keycloak|auth)\.([^.]+)\.corti\.app\/realms\/([^/]+)/;
    const match = issuerUrl.match(regex);

    // If the issuer URL matches the expected pattern, return the extracted values along with the token
    if (match) {
        const expiresAt = tokenDetails.exp && typeof tokenDetails.exp === 'number'
            ? tokenDetails.exp
            : undefined;

        return {
            environment: match[2],
            tenantName: match[3],
            accessToken: token,
            expiresAt,
        };
    }
}
