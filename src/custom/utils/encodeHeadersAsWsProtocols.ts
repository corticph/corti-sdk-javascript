/**
 * Utilities to encode client headers as WebSocket subprotocols (for proxy scenarios).
 * Format: [headerName1, encodeURIComponent(value1), headerName2, encodeURIComponent(value2), ...]
 */

import * as core from "../../core/index.js";
import { SDK_HEADER_NAMES } from "./sdkHeaderNames.js";

export type HeadersRecord = Record<string, string | core.Supplier<string | null | undefined> | null | undefined>;

/**
 * Resolves header values (including suppliers/functions) and returns a flat array
 * of [name, encodeURIComponent(value)] for each header, skipping undefined/empty values.
 * When filterSdkHeaders is true, SDK-added headers are excluded.
 */
export async function buildProtocolsFromHeaders(
    headers: HeadersRecord | undefined,
    filterSdkHeaders = false,
): Promise<string[]> {
    if (!headers || Object.keys(headers).length === 0) {
        return [];
    }
    const protocols: string[] = [];
    for (const [name, valueOrSupplier] of Object.entries(headers)) {
        if (filterSdkHeaders && SDK_HEADER_NAMES.has(name)) {
            continue;
        }
        const value = await core.Supplier.get(valueOrSupplier);
        if (value != null && value !== "") {
            protocols.push(name, encodeURIComponent(value));
        }
    }
    return protocols;
}

/** Options shape for getWsProtocols (encodeHeadersAsWsProtocols + headers). */
export type WsProtocolsOptions = {
    encodeHeadersAsWsProtocols?: boolean;
    headers?: HeadersRecord;
};

/** Proxy protocols as array (pass-through) or object (encoded like headers). */
export type ProxyProtocolsInput = string[] | HeadersRecord;

export type ProxyOptions = {
    url: string;
    /** string[] passed as-is; Record → encoded as [name, encodeURIComponent(value), ...] pairs. */
    protocols?: ProxyProtocolsInput;
    queryParameters?: Record<string, string>;
};

/**
 * Returns WebSocket protocols array for connect (header-derived + proxy protocols).
 * proxyProtocols: array is passed as-is; object is encoded like headers.
 */
export async function getWsProtocols(
    options: WsProtocolsOptions,
    proxyProtocols?: ProxyProtocolsInput,
): Promise<string[]> {
    const headerProtocols =
        options.encodeHeadersAsWsProtocols && options.headers
            ? await buildProtocolsFromHeaders(options.headers, true)
            : [];
    const resolvedProxy =
        proxyProtocols == null
            ? []
            : Array.isArray(proxyProtocols)
              ? proxyProtocols
              : await buildProtocolsFromHeaders(proxyProtocols, false);
    const combined = [...headerProtocols, ...resolvedProxy];
    return combined.length > 0 ? combined : [];
}
