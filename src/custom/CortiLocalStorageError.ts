/**
 * Error thrown when localStorage operations fail.
 * This can occur when:
 * - localStorage is disabled or unavailable
 * - Storage quota is exceeded
 * - Browser security policies prevent storage access
 */
export class CortiLocalStorageError extends Error {
    public readonly operation: 'set' | 'get' | 'remove';
    public readonly originalError?: unknown;

    constructor(operation: 'set' | 'get' | 'remove' = 'set', originalError?: unknown) {
        super(`LocalStorage ${operation} operation failed.`);
        this.name = "CortiLocalStorageError";
        this.operation = operation;
        this.originalError = originalError;
        Object.setPrototypeOf(this, CortiLocalStorageError.prototype);
    }
}

