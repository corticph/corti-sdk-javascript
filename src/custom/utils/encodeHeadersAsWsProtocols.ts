/**
 * Patch: utilities to encode client headers as WebSocket subprotocols (for proxy scenarios).
 * Format: [headerName1, encodeURIComponent(value1), headerName2, encodeURIComponent(value2), ...]
 */

import * as core from "../../core/index.js";
import type { CortiClient } from "../CortiClient.js";

/**
 * Patch: resolves header values (including suppliers/functions) and returns a flat array
 * of [name, encodeURIComponent(value)] for each header, skipping undefined/empty values.
 */
export async function buildProtocolsFromHeaders(
    headers: CortiClient.HeadersRecord | undefined
): Promise<string[]> {
    if (!headers || Object.keys(headers).length === 0) {
        return [];
    }
    const protocols: string[] = [];
    for (const [name, valueOrSupplier] of Object.entries(headers)) {
        const value = await core.Supplier.get(valueOrSupplier);
        if (value != null && value !== "") {
            protocols.push(name, encodeURIComponent(value));
        }
    }
    return protocols;
}

/** Patch: options shape for getWsProtocols (encodeHeadersAsWsProtocols + headers). */
export type WsProtocolsOptions = {
    encodeHeadersAsWsProtocols?: boolean;
    headers?: CortiClient.HeadersRecord;
};

/** Patch: proxy protocols as array (pass-through) or object (encoded like headers). */
export type ProxyProtocolsInput = string[] | CortiClient.HeadersRecord;

/**
 * Patch: returns WebSocket protocols array for connect (header-derived + proxy protocols).
 * proxyProtocols: array is passed as-is; object is encoded like headers (name, encodeURIComponent(value), ...).
 */
export async function getWsProtocols(
    options: WsProtocolsOptions,
    proxyProtocols?: ProxyProtocolsInput
): Promise<string[]> {
    const headerProtocols =
        options.encodeHeadersAsWsProtocols && options.headers
            ? await buildProtocolsFromHeaders(options.headers)
            : [];
    const resolvedProxy =
        proxyProtocols == null
            ? []
            : Array.isArray(proxyProtocols)
              ? proxyProtocols
              : await buildProtocolsFromHeaders(proxyProtocols);
    const combined = [...headerProtocols, ...resolvedProxy];
    return combined.length > 0 ? combined : [];
}
