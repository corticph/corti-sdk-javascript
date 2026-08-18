import { mergeHeadersOriginal } from "../../core/headers.js";
import { parseAnalytics, withAnalytics, X_CORTI_ANALYTICS } from "../utils/analytics.js";

export function mergeHeaders(...headersArray: (Record<string, unknown> | null | undefined)[]): Record<string, unknown> {
    const rest: Record<string, unknown>[] = [];
    let analytics: Record<string, unknown> | undefined;

    for (const headers of headersArray) {
        if (!headers) {
            continue;
        }

        const cleaned: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(headers)) {
            if (key.toLowerCase() !== X_CORTI_ANALYTICS) {
                cleaned[key] = value;
                continue;
            }

            const parsed = parseAnalytics(value);

            if (parsed) {
                Object.assign((analytics ??= {}), parsed);
            }
        }

        rest.push(cleaned);
    }

    return mergeHeadersOriginal(...rest, analytics ? withAnalytics(analytics) : undefined);
}
