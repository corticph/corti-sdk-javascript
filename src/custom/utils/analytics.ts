import { SDK_VERSION } from "../../version.js";

export const X_CORTI_ANALYTICS_HEADER = "X-Corti-Analytics";
export const X_CORTI_ANALYTICS_QUERY = "x-corti-analytics";

export function withAnalytics(
    analytics: Record<string, unknown> | undefined,
    key: string,
    record?: Record<string, unknown>,
): Record<string, unknown> {
    return {
        ...record,
        [key]: JSON.stringify({
            ...analytics,
            sdk_version: SDK_VERSION,
            sdk_type: "corti-sdk-javascript",
        }),
    };
}
