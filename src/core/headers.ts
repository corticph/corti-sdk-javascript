/** Patch: X-Corti-Analytics - renamed generated merge; public mergeHeaders is the custom wrap */
export function mergeHeadersOriginal(
    ...headersArray: (Record<string, unknown> | null | undefined)[]
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of headersArray
        .filter((headers) => headers != null)
        .flatMap((headers) => Object.entries(headers))) {
        const insensitiveKey = key.toLowerCase();
        if (value != null) {
            result[insensitiveKey] = value;
        } else if (insensitiveKey in result) {
            delete result[insensitiveKey];
        }
    }

    return result;
}

export function mergeOnlyDefinedHeaders(
    ...headersArray: (Record<string, unknown> | null | undefined)[]
): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of headersArray
        .filter((headers) => headers != null)
        .flatMap((headers) => Object.entries(headers))) {
        const insensitiveKey = key.toLowerCase();
        if (value != null) {
            result[insensitiveKey] = value;
        }
    }

    return result;
}

/** Patch: X-Corti-Analytics - public mergeHeaders is the custom wrap that reuses mergeHeadersOriginal */
export { mergeHeaders } from "../custom/overrides/headers.js";
