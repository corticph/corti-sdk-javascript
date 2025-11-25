export interface CortiSDKErrorOptions {
    code: CortiSDKErrorCodes;
    cause?: unknown;
}

export enum CortiSDKErrorCodes {
    LOCAL_STORAGE_ERROR = "local_storage_error",
}

export class CortiSDKError extends Error {
    public readonly code: CortiSDKErrorCodes;
    public readonly cause?: unknown;

    constructor(
        message = "An unexpected error occurred in the Corti SDK.",
        options: CortiSDKErrorOptions = { code: CortiSDKErrorCodes.LOCAL_STORAGE_ERROR },
    ) {
        super(message);
        this.name = "CortiSDKError";
        this.code = options.code;
        if ("cause" in options) {
            this.cause = options.cause;
        }
        Object.setPrototypeOf(this, CortiSDKError.prototype);
    }
}
