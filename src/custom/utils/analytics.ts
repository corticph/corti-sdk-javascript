import { SDK_VERSION } from "../../version.js";

export const X_CORTI_ANALYTICS_HEADER = "X-Corti-Analytics";

export const X_CORTI_ANALYTICS_QUERY = "x-corti-analytics";

/**
 * Keys that the SDK controls and that callers cannot override.
 */
export const RESERVED_ANALYTICS_KEYS: readonly string[] = ["sdk_version", "sdk_type"];

/**
 * Strips reserved keys from a single layer and returns the remaining fields.
 */
function stripReserved(layer: Record<string, unknown>): Record<string, unknown> {
    const extra: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(layer)) {
        if (!RESERVED_ANALYTICS_KEYS.includes(key)) {
            extra[key] = value;
        }
    }
    return extra;
}

/**
 * Merges analytics layers left-to-right and returns only the user-owned fields
 * (reserved keys stripped from every layer). Used to store the caller-supplied
 * base on the client so that the fetch wrapper and WS path preserve caller header
 * fields without letting reserved keys leak in.
 */
export function mergeUserAnalytics(...layers: (Record<string, unknown> | undefined)[]): Record<string, unknown> {
    const merged: Record<string, unknown> = {};
    for (const layer of layers) {
        if (layer != null) {
            Object.assign(merged, stripReserved(layer));
        }
    }
    return merged;
}

/**
 * Merges analytics layers left-to-right; later layers win.
 * Reserved keys are stripped from every layer and always set by the SDK.
 */
export function resolveAnalytics(...layers: (Record<string, unknown> | undefined)[]): Record<string, unknown> {
    return {
        sdk_version: SDK_VERSION,
        sdk_type: "corti-sdk-javascript",
        ...mergeUserAnalytics(...layers),
    };
}

/**
 * Builds the analytics payload that is sent to the Corti API.
 *
 * The SDK always sets `sdk_version` and `sdk_type`; any caller-provided fields
 * are preserved, except for the reserved keys, which are always owned by the SDK.
 */
export function buildAnalyticsPayload(analytics?: Record<string, unknown>): Record<string, unknown> {
    const extra = stripReserved(analytics ?? {});
    return {
        sdk_version: SDK_VERSION,
        sdk_type: "corti-sdk-javascript",
        ...extra,
    };
}

/** JSON value for the X-Corti-Analytics header sent on HTTP requests. */
export function analyticsHeaderValue(analytics?: Record<string, unknown>): string {
    try {
        return JSON.stringify(buildAnalyticsPayload(analytics));
    } catch {
        return JSON.stringify(buildAnalyticsPayload());
    }
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
 * Parses a caller-supplied `x-corti-analytics` value (JSON string) into a base layer.
 * Invalid JSON is silently ignored — the caller's other query params are still preserved.
 */
export function parseCallerAnalyticsValue(value: unknown): Record<string, unknown> {
    if (typeof value !== "string") return {};
    try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
            return parsed as Record<string, unknown>;
        }
    } catch {
        // Invalid JSON — ignore the caller value, keep the SDK payload.
    }
    return {};
}

/**
 * Extracts a caller-supplied `X-Corti-Analytics` header (case-insensitive lookup),
 * parses its JSON value into a base layer, and returns both the parsed fields and
 * the remaining headers with the analytics key removed.
 */
export function extractCallerAnalyticsFromHeaders(headers: Record<string, unknown> | undefined): {
    callerAnalyticsFields: Record<string, unknown>;
    restHeaders: Record<string, unknown>;
} {
    if (headers == null) return { callerAnalyticsFields: {}, restHeaders: {} };
    const analyticsKey = Object.keys(headers).find((k) => k.toLowerCase() === X_CORTI_ANALYTICS_HEADER.toLowerCase());
    const callerAnalyticsValue = analyticsKey ? headers[analyticsKey] : undefined;
    const callerAnalyticsFields = parseCallerAnalyticsValue(callerAnalyticsValue);
    const restHeaders = { ...headers };
    if (analyticsKey) delete restHeaders[analyticsKey];
    return { callerAnalyticsFields, restHeaders };
}

/**
 * Lifts `x-corti-analytics` from a connect-args `headers` field into a resolved
 * analytics payload for the WS query string. Returns the merged analytics and
 * the remaining headers (analytics key stripped), mutating `rest` in place so
 * downstream code sees only the non-analytics headers.
 */
export function liftConnectAnalytics(
    clientOptions: unknown,
    rest: { headers?: Record<string, unknown> },
): Record<string, unknown> {
    const { callerAnalyticsFields, restHeaders } = extractCallerAnalyticsFromHeaders(rest.headers);
    const analytics = resolveAnalytics(getAnalyticsFromOptions(clientOptions), callerAnalyticsFields);
    if (Object.keys(restHeaders).length === 0) {
        delete rest.headers;
    } else {
        rest.headers = restHeaders as Record<string, string>;
    }
    return analytics;
}

/**
 * Merges caller-provided query parameters with analytics, ensuring the
 * `x-corti-analytics` key is always owned by the SDK and cannot be overwritten
 * by the caller. A caller-supplied `x-corti-analytics` value is parsed and its
 * non-reserved fields are folded in as a base layer (SDK reserved keys always win).
 */
export function mergeAnalyticsQueryParams(
    userParams: Record<string, unknown> | undefined,
    analytics: Record<string, unknown> | undefined,
): Record<string, unknown> {
    const callerAnalytics = parseCallerAnalyticsValue(userParams?.[X_CORTI_ANALYTICS_QUERY]);
    const merged = { ...callerAnalytics, ...analytics };
    const { [X_CORTI_ANALYTICS_QUERY]: _dropped, ...rest } = userParams ?? {};
    return { ...rest, ...analyticsQueryParams(merged) };
}

/**
 * Reads the `x-corti-analytics` header value from a Headers-like object or plain
 * record (case-insensitive). Returns `null` when the header is absent.
 */
function readAnalyticsHeader(headers: unknown): string | null {
    if (headers == null) return null;
    // Duck-type Headers instances (may be a polyfill from core/fetcher/Headers.ts,
    // not globalThis.Headers — mixing the two constructors can throw).
    if (typeof (headers as Headers).get === "function") {
        return (headers as Headers).get(X_CORTI_ANALYTICS_HEADER);
    }
    // Plain object / entry array fallback (case-insensitive lookup).
    if (typeof headers === "object") {
        const record = headers as Record<string, unknown>;
        const foundKey = Object.keys(record).find((k) => k.toLowerCase() === X_CORTI_ANALYTICS_HEADER.toLowerCase());
        const val = foundKey ? record[foundKey] : undefined;
        return typeof val === "string" ? val : null;
    }
    return null;
}

/**
 * Sets the `x-corti-analytics` header on a Headers-like object or plain record
 * (case-insensitive — overwrites any existing mixed-case variant).
 */
function setAnalyticsHeader(headers: unknown, value: string): void {
    if (headers == null) return;
    if (typeof (headers as Headers).set === "function") {
        (headers as Headers).set(X_CORTI_ANALYTICS_HEADER, value);
        return;
    }
    if (typeof headers === "object") {
        const lowerKey = X_CORTI_ANALYTICS_HEADER.toLowerCase();
        const record = headers as Record<string, unknown>;
        const foundKey = Object.keys(record).find((k) => k.toLowerCase() === lowerKey);
        if (foundKey) delete record[foundKey];
        record[X_CORTI_ANALYTICS_HEADER] = value;
    }
}

/**
 * Wraps a fetch implementation so that every outgoing request carrying an `x-corti-analytics`
 * header has a well-formed payload: the caller's value is parsed, reserved keys are stripped,
 * and the SDK's reserved keys are re-applied.
 *
 * Only **rewrites** an existing header — never adds one. This preserves the CORS bypass on
 * auth/token requests (`stripFernNormalizedHeaders` removes it there).
 *
 * Idempotent: `requestWithRetries` reuses the same headers object, so the wrapper re-parses
 * its own output on retries. `resolveAnalytics` produces the same value because reserved
 * keys are stripped before being re-added.
 *
 * Fetch is resolved at call time (`userFetch ?? globalThis.fetch`) to pick up late polyfills.
 */
export function withAnalyticsFetch(
    userFetch: typeof fetch | undefined,
    clientAnalytics: Record<string, unknown> | undefined,
): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        if (init?.headers != null) {
            const callerValue = readAnalyticsHeader(init.headers);
            // Only rewrite when the header is already present — never add a new one.
            // Auth/token requests strip it via stripFernNormalizedHeaders for CORS bypass.
            if (callerValue != null) {
                const callerFields = parseCallerAnalyticsValue(callerValue);
                const merged = resolveAnalytics(clientAnalytics, callerFields);
                setAnalyticsHeader(init.headers, analyticsHeaderValue(merged));
            }
        }
        const fetchFn = userFetch ?? globalThis.fetch;
        return fetchFn(input, init);
    };
}
