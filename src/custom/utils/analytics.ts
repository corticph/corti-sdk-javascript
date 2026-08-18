import { SDK_VERSION } from "../../version.js";

export const X_CORTI_ANALYTICS = "x-corti-analytics";

export function parseAnalytics(value: unknown): Record<string, unknown> | undefined {
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

export function withAnalytics(
    analytics: Record<string, unknown> | undefined,
    record?: Record<string, unknown>,
): Record<string, unknown> {
    const overlay = record ? parseAnalytics(record[X_CORTI_ANALYTICS]) : {};

    return {
        ...record,
        [X_CORTI_ANALYTICS]: JSON.stringify({
            ...analytics,
            ...overlay,
            sdk_version: SDK_VERSION,
            sdk_type: "corti-sdk-javascript",
        }),
    };
}
