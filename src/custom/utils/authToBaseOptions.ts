import type { CortiClient as BaseCortiClient } from "../../Client.js";

export type AuthForBaseOptions =
    | { clientId: string; clientSecret: string }
    | { accessToken: string }
    | { clientId: string; username: string; password: string };

export type OptionsRest = Omit<BaseCortiClient.Options, "clientId" | "clientSecret" | "token">;

export function authToBaseOptions(
    auth: AuthForBaseOptions,
    rest: OptionsRest,
): BaseCortiClient.Options {
    if ("username" in auth && "password" in auth) {
        return {
            ...rest,
            clientId: auth.clientId,
            username: auth.username,
            password: auth.password,
        };
    }

    if ("clientId" in auth && "clientSecret" in auth) {
        return { ...rest, clientId: auth.clientId, clientSecret: auth.clientSecret };
    }

    return { ...rest, token: auth.accessToken };
}
