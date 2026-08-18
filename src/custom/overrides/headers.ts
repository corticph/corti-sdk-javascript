import { mergeHeadersOriginal } from "../../core/headers.js";
import { withAnalytics, X_CORTI_ANALYTICS_HEADER } from "../utils/analytics.js";

const ANALYTICS_KEY = X_CORTI_ANALYTICS_HEADER.toLowerCase();

function parseAnalyticsHeader(value: unknown): Record<string, unknown> | undefined {
    let parsed = value;

    if (typeof parsed === "string") {
        try {
            parsed = JSON.parse(parsed);
        } catch {
            return undefined;
        }
    }

    if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
    }

    return undefined;
}

export function mergeHeaders(...headersArray: (Record<string, unknown> | null | undefined)[]): Record<string, unknown> {
    const rest: Record<string, unknown>[] = [];
    let analytics: Record<string, unknown> | undefined;

    for (const headers of headersArray) {
        if (!headers) {
            continue;
        }

        const cleaned: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(headers)) {
            if (key.toLowerCase() !== ANALYTICS_KEY) {
                cleaned[key] = value;
                continue;
            }

            const parsed = parseAnalyticsHeader(value);

            if (parsed) {
                Object.assign(analytics ??= {}, parsed);
            }
        }

        rest.push(cleaned);
    }

    return mergeHeadersOriginal(
        ...rest,
        analytics ? withAnalytics(analytics, X_CORTI_ANALYTICS_HEADER) : undefined,
    );
}
