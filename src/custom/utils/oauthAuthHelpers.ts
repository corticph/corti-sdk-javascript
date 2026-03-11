/** Shared by OAuthAuthProvider and OAuthRopcAuthProvider (avoids circular dependency). */
export const BUFFER_IN_MINUTES = 2 as const;

export const CLIENT_ID_PARAM = "clientId" as const;
export const USERNAME_PARAM = "username" as const;
export const PASSWORD_PARAM = "password" as const;
export const CLIENT_ID_REQUIRED_ERROR_MESSAGE: string = `${CLIENT_ID_PARAM} is required`;
export const USERNAME_REQUIRED_ERROR_MESSAGE: string = `${USERNAME_PARAM} is required`;
export const PASSWORD_REQUIRED_ERROR_MESSAGE: string = `${PASSWORD_PARAM} is required`;

export function getExpiresAt(expiresInSeconds: number, bufferInMinutes: number): Date {
    const now = new Date();
    return new Date(now.getTime() + expiresInSeconds * 1000 - bufferInMinutes * 60 * 1000);
}
