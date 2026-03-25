export type ProxyOptions = {
    url: string;
    /** string[] passed as-is; Record<string,string> → [name, encodeURIComponent(value), ...] */
    protocols?: string[] | Record<string, string>;
    queryParameters?: Record<string, string>;
};

/**
 * Resolves proxy protocols to a string array for the WebSocket constructor.
 * - string[] is passed through unchanged (empty array → undefined).
 * - Record<string,string> is encoded as [name, encodeURIComponent(value), ...] pairs.
 */
export function resolveProxyProtocols(
    protocols?: string[] | Record<string, string>,
): string[] | undefined {
    if (!protocols) return undefined;
    if (Array.isArray(protocols)) return protocols.length ? protocols : undefined;
    const result = Object.entries(protocols).flatMap(([k, v]) => [k, encodeURIComponent(v)]);
    return result.length ? result : undefined;
}
