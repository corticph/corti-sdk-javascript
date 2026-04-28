import type { BaseClientOptions } from "../../BaseClient.js";
import { SDK_HEADER_NAMES } from "./sdkHeaderNames.js";

type Headers = BaseClientOptions["headers"];
type HeaderValue = NonNullable<Headers>[string];

function normalizeHeaderKeys(headers: Headers): Record<string, HeaderValue> {
    const result: Record<string, HeaderValue> = {};

    if (headers == null) {
        return result;
    }

    for (const [key, value] of Object.entries(headers)) {
        const insensitiveKey = key.toLowerCase();
        if (value != null) {
            result[insensitiveKey] = value;
        } else if (insensitiveKey in result) {
            delete result[insensitiveKey];
        }
    }

    return result;
}

export function stripFernNormalizedHeaders(headers: Headers): Record<string, HeaderValue> {
    const normalized = normalizeHeaderKeys(headers);

    for (const headerName of SDK_HEADER_NAMES) {
        delete normalized[headerName.toLowerCase()];
    }

    return normalized;
}
