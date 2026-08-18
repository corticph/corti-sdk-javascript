import { CortiClient } from "../../../src";
import { SDK_VERSION } from "../../../src/version";

const { MockWebSocket } = vi.hoisted(() => {
    class MockWebSocket {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;
        static urls: string[] = [];

        readyState = MockWebSocket.CONNECTING;
        binaryType: BinaryType = "blob";

        constructor(url: string) {
            MockWebSocket.urls.push(url);
        }

        addEventListener(): void {}
        removeEventListener(): void {}
        close(): void {}
        send(): void {}
    }

    return { MockWebSocket };
});

vi.mock("ws", () => ({ WebSocket: MockWebSocket }));

const ENV = {
    base: "https://api.test.example/v2",
    wss: "wss://api.test.example/audio-bridge/v2",
    login: "https://auth.test.example/realms",
    agents: "https://api.test.example",
};

function jsonResponse(body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}

function parseAnalyticsHeader(headers: Headers | Record<string, string> | undefined): Record<string, unknown> {
    const value = headers instanceof Headers ? headers.get("x-corti-analytics") : headers?.["x-corti-analytics"];
    return JSON.parse(value ?? "{}");
}

describe("CortiClient analytics on outbound requests", () => {
    afterEach(() => {
        MockWebSocket.urls.length = 0;
    });

    it("merges client analytics, per-request overlay, reserved keys, and other headers on a REST call", async () => {
        const fetchFn = vi.fn(async () => jsonResponse({ languages: { en: {} } }));

        const client = new CortiClient({
            environment: ENV,
            tenantName: "test",
            auth: { accessToken: "fake-token" },
            analytics: { integration: "epic-hyperspace", workflow: "ambient-scribe" },
            headers: {
                "X-Trace": "client",
                "x-corti-analytics": JSON.stringify({ source: "ehr", workflow: "from-headers" }),
            },
            fetch: fetchFn,
            maxRetries: 0,
        });

        await client.languages.list(
            {},
            {
                headers: {
                    "X-Trace-Request": "request",
                    "x-corti-analytics": JSON.stringify({ workflow: "progress-note", document_type: "progress-note" }),
                },
                queryParams: { extra: "keep" },
            },
        );

        const [url, init] = fetchFn.mock.calls[0];
        expect(new URL(String(url)).searchParams.get("extra")).toBe("keep");
        const headers = init?.headers as Headers;
        expect(headers).toContainHeaders({
            "x-trace": "client",
            "x-trace-request": "request",
        });
        expect(parseAnalyticsHeader(headers)).toEqual({
            source: "ehr",
            integration: "epic-hyperspace",
            workflow: "progress-note",
            document_type: "progress-note",
            sdk_version: SDK_VERSION,
            sdk_type: "corti-sdk-javascript",
        });
    });

    it("sends reserved sdk keys on a REST call when no analytics is provided", async () => {
        const fetchFn = vi.fn(async () => jsonResponse({ languages: { en: {} } }));
        const client = new CortiClient({
            environment: ENV,
            tenantName: "test",
            auth: { accessToken: "fake-token" },
            fetch: fetchFn,
            maxRetries: 0,
        });

        await client.languages.list();

        expect(parseAnalyticsHeader(fetchFn.mock.calls[0][1]?.headers as Headers)).toEqual({
            sdk_version: SDK_VERSION,
            sdk_type: "corti-sdk-javascript",
        });
    });

    it("merges client analytics, per-connection overlay, and reserved keys on a WebSocket connect", async () => {
        const abort = new AbortController();
        const client = new CortiClient({
            environment: ENV,
            tenantName: "test",
            auth: { accessToken: "fake-token" },
            analytics: { integration: "epic-hyperspace", visit_type: "outpatient" },
            maxRetries: 0,
        });

        const socket = await client.stream.connect({
            id: "00000000-0000-0000-0000-000000000001",
            abortSignal: abort.signal,
            reconnectAttempts: 0,
            queryParams: {
                extra: "keep",
                "x-corti-analytics": JSON.stringify({ visit_type: "inpatient" }),
            },
        });

        try {
            await vi.waitFor(() => {
                expect(MockWebSocket.urls[0]).toBeDefined();
            });
            const params = new URL(MockWebSocket.urls[0]).searchParams;
            expect(params.get("extra")).toBe("keep");
            expect(JSON.parse(params.get("x-corti-analytics") ?? "{}")).toEqual({
                integration: "epic-hyperspace",
                visit_type: "inpatient",
                sdk_version: SDK_VERSION,
                sdk_type: "corti-sdk-javascript",
            });
        } finally {
            abort.abort();
            socket.close();
        }
    });

    it("sends reserved sdk keys on a WebSocket connect when no analytics is provided", async () => {
        const abort = new AbortController();
        const client = new CortiClient({
            environment: ENV,
            tenantName: "test",
            auth: { accessToken: "fake-token" },
            maxRetries: 0,
        });

        const socket = await client.stream.connect({
            id: "00000000-0000-0000-0000-000000000001",
            abortSignal: abort.signal,
            reconnectAttempts: 0,
        });

        try {
            await vi.waitFor(() => {
                expect(MockWebSocket.urls[0]).toBeDefined();
            });
            expect(JSON.parse(new URL(MockWebSocket.urls[0]).searchParams.get("x-corti-analytics") ?? "{}")).toEqual({
                sdk_version: SDK_VERSION,
                sdk_type: "corti-sdk-javascript",
            });
        } finally {
            abort.abort();
            socket.close();
        }
    });

    it("merges client analytics, per-connection overlay, and reserved keys on a transcribe connect", async () => {
        const abort = new AbortController();
        const client = new CortiClient({
            environment: ENV,
            tenantName: "test",
            auth: { accessToken: "fake-token" },
            analytics: { integration: "epic-hyperspace", visit_type: "outpatient" },
            maxRetries: 0,
        });

        const socket = await client.transcribe.connect({
            abortSignal: abort.signal,
            reconnectAttempts: 0,
            queryParams: {
                extra: "keep",
                "x-corti-analytics": JSON.stringify({ visit_type: "inpatient" }),
            },
        });

        try {
            await vi.waitFor(() => {
                expect(MockWebSocket.urls[0]).toBeDefined();
            });
            const params = new URL(MockWebSocket.urls[0]).searchParams;
            expect(params.get("extra")).toBe("keep");
            expect(JSON.parse(params.get("x-corti-analytics") ?? "{}")).toEqual({
                integration: "epic-hyperspace",
                visit_type: "inpatient",
                sdk_version: SDK_VERSION,
                sdk_type: "corti-sdk-javascript",
            });
        } finally {
            abort.abort();
            socket.close();
        }
    });

    it("sends reserved sdk keys on a transcribe connect when no analytics is provided", async () => {
        const abort = new AbortController();
        const client = new CortiClient({
            environment: ENV,
            tenantName: "test",
            auth: { accessToken: "fake-token" },
            maxRetries: 0,
        });

        const socket = await client.transcribe.connect({
            abortSignal: abort.signal,
            reconnectAttempts: 0,
        });

        try {
            await vi.waitFor(() => {
                expect(MockWebSocket.urls[0]).toBeDefined();
            });
            expect(JSON.parse(new URL(MockWebSocket.urls[0]).searchParams.get("x-corti-analytics") ?? "{}")).toEqual({
                sdk_version: SDK_VERSION,
                sdk_type: "corti-sdk-javascript",
            });
        } finally {
            abort.abort();
            socket.close();
        }
    });
});
