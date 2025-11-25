import { CortiSDKError, CortiSDKErrorCodes } from "../CortiSDKError.js";

export const LOCAL_STORAGE_ERROR_CODE = "local_storage_error" as const;

export const requireLocalStorage = (): Storage => {
    if (typeof window === "undefined" || !window.localStorage) {
        throw new CortiSDKError("LocalStorage operation failed: storage is not available in this environment.", {
            code: CortiSDKErrorCodes.LOCAL_STORAGE_ERROR,
        });
    }

    return window.localStorage;
};

export const setLocalStorageItem = (key: string, value: string): void => {
    const storage = requireLocalStorage();

    try {
        storage.setItem(key, value);
    } catch (error) {
        throw new CortiSDKError("LocalStorage set operation failed.", {
            code: CortiSDKErrorCodes.LOCAL_STORAGE_ERROR,
            cause: error,
        });
    }
};

export const getLocalStorageItem = (key: string): string | null => {
    const storage = requireLocalStorage();

    try {
        return storage.getItem(key);
    } catch (error) {
        throw new CortiSDKError("LocalStorage get operation failed.", {
            code: CortiSDKErrorCodes.LOCAL_STORAGE_ERROR,
            cause: error,
        });
    }
};
