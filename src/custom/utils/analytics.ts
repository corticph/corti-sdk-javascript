import { SDK_VERSION } from "../../version.js";

export const X_CORTI_ANALYTICS_HEADER = "X-Corti-Analytics";

export const X_CORTI_ANALYTICS_QUERY = "x-corti-analytics";

/**
 * Keys that the SDK controls and that callers cannot override.
 */
export const RESERVED_ANALYTICS_KEYS: readonly string[] = ["sdk_version", "sdk_type"];

/**
 * Builds the analytics payload that is sent to the Corti API.
 *
 * The SDK always sets `sdk_version` and `sdk_type`; any caller-provided fields
 * are preserved, except for the reserved keys, which are always owned by the SDK.
 */
export function buildAnalyticsPayload(analytics?: Record<string, unknown>): Record<string, unknown> {
    const extra: Record<string, unknown> = {};
    if (analytics != null) {
        for (const [key, value] of Object.entries(analytics)) {
            if (!RESERVED_ANALYTICS_KEYS.includes(key)) {
                extra[key] = value;
            }
        }
    }
    return {
        sdk_version: SDK_VERSION,
        sdk_type: "javascript",
        ...extra,
    };
}

/** JSON value for the X-Corti-Analytics header sent on HTTP requests. */
export function analyticsHeaderValue(analytics?: Record<string, unknown>): string {
    return JSON.stringify(buildAnalyticsPayload(analytics));
}

/**
 * Reads the `analytics` field from normalized client options.
 *
 * The field is intentionally not part of the generated `BaseClientOptions` type, so it is
 * accessed through a cast here.
 */
export function getAnalyticsFromOptions(options: unknown): Record<string, unknown> | undefined {
    return (options as { analytics?: Record<string, unknown> } | null | undefined)?.analytics;
}

/**
 * Query parameters carrying analytics for WebSocket handshakes, which cannot set
 * custom headers. Exposed as a single x-corti-analytics parameter with a JSON value.
 */
export function analyticsQueryParams(analytics?: Record<string, unknown>): Record<string, string> {
    return { [X_CORTI_ANALYTICS_QUERY]: analyticsHeaderValue(analytics) };
}

/**
 * Merges caller-provided query parameters with analytics, ensuring the
 * `x-corti-analytics` key is always owned by the SDK and cannot be overwritten
 * by the caller.
 */
export function mergeAnalyticsQueryParams(
    userParams: Record<string, unknown> | undefined,
    analytics: Record<string, unknown> | undefined,
): Record<string, unknown> {
    return { ...(userParams ?? {}), ...analyticsQueryParams(analytics) };
}

/**
 * Merges caller-provided headers with the `X-Corti-Analytics` header, ensuring
 * the analytics header is always owned by the SDK and cannot be overwritten
 * by the caller.
 */
export function mergeAnalyticsHeaders(
    userHeaders: Record<string, unknown> | undefined,
    analytics: Record<string, unknown> | undefined,
): Record<string, unknown> {
    return { ...(userHeaders ?? {}), [X_CORTI_ANALYTICS_HEADER]: analyticsHeaderValue(analytics) };
}
