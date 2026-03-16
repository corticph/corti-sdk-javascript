import { CortiError } from "../../errors/index.js";

export const CODE_VERIFIER_KEY = "corti_pkce_code_verifier" as const;

export const requireLocalStorage = (): Storage => {
    if (typeof window === "undefined" || !window.localStorage) {
        throw new CortiError({
            message: "LocalStorage operation failed: storage is not available in this environment.",
        });
    }
    return window.localStorage;
};

export const setLocalStorageItem = (key: string, value: string): void => {
    const storage = requireLocalStorage();
    try {
        storage.setItem(key, value);
    } catch (_error) {
        throw new CortiError({
            message: "LocalStorage set operation failed.",
        });
    }
};

export const getLocalStorageItem = (key: string): string | null => {
    const storage = requireLocalStorage();
    try {
        return storage.getItem(key);
    } catch (_error) {
        throw new CortiError({
            message: "LocalStorage get operation failed.",
        });
    }
};
