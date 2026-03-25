import { CustomProxyStream } from "./proxy/CustomProxyStream.js";
import { CustomProxyTranscribe } from "./proxy/CustomProxyTranscribe.js";

/**
 * Lightweight WebSocket-only client for proxy scenarios.
 * No environment, tenantName, or auth required — supply the proxy URL at connect() time.
 *
 * @example
 * const socket = await CortiWebSocketProxyClient.stream.connect({
 *     proxy: { url: "wss://my-proxy/stream" },
 * });
 */
export class CortiWebSocketProxyClient {
    public static readonly stream: CustomProxyStream = new CustomProxyStream();
    public static readonly transcribe: CustomProxyTranscribe = new CustomProxyTranscribe();
}
