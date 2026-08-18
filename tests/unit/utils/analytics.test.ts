import {
    analyticsHeaderValue,
    analyticsQueryParams,
    buildAnalyticsPayload,
    mergeAnalyticsQueryParams,
    mergeUserAnalytics,
    parseCallerAnalyticsValue,
    resolveAnalytics,
    withAnalyticsFetch,
    X_CORTI_ANALYTICS_HEADER,
    X_CORTI_ANALYTICS_QUERY,
} from "../../../src/custom/utils/analytics";
import { SDK_VERSION } from "../../../src/version";

describe("analytics", () => {
    describe("buildAnalyticsPayload", () => {
        it("sets sdk_version and sdk_type by default", () => {
            const payload = buildAnalyticsPayload();
            expect(payload).toEqual({
                sdk_version: SDK_VERSION,
                sdk_type: "corti-sdk-javascript",
            });
        });

        it("preserves caller-provided fields", () => {
            const payload = buildAnalyticsPayload({ source: "web", foo: "bar" });
            expect(payload.sdk_version).toBe(SDK_VERSION);
            expect(payload.sdk_type).toBe("corti-sdk-javascript");
            expect(payload.source).toBe("web");
            expect(payload.foo).toBe("bar");
        });

        it("ignores reserved keys provided by the caller", () => {
            const payload = buildAnalyticsPayload({ sdk_version: "hack", sdk_type: "other", source: "web" });
            expect(payload.sdk_version).toBe(SDK_VERSION);
            expect(payload.sdk_type).toBe("corti-sdk-javascript");
            expect(payload.source).toBe("web");
        });
    });

    describe("analyticsHeaderValue", () => {
        it("serializes the payload to JSON", () => {
            expect(analyticsHeaderValue({ source: "web" })).toBe(
                `{"sdk_version":"${SDK_VERSION}","sdk_type":"corti-sdk-javascript","source":"web"}`,
            );
        });
    });

    describe("analyticsQueryParams", () => {
        it("returns a single x-corti-analytics query parameter with a JSON value", () => {
            expect(analyticsQueryParams({ source: "web" })).toEqual({
                [X_CORTI_ANALYTICS_QUERY]: `{"sdk_version":"${SDK_VERSION}","sdk_type":"corti-sdk-javascript","source":"web"}`,
            });
        });
    });

    describe("resolveAnalytics", () => {
        it("returns reserved keys only with no layers", () => {
            const payload = resolveAnalytics();
            expect(payload).toEqual({
                sdk_version: SDK_VERSION,
                sdk_type: "corti-sdk-javascript",
            });
        });

        it("merges layers left-to-right; later layers win", () => {
            const payload = resolveAnalytics({ source: "web", env: "dev" }, { env: "prod", feature: "intake" });
            expect(payload.source).toBe("web");
            expect(payload.env).toBe("prod");
            expect(payload.feature).toBe("intake");
        });

        it("strips reserved keys from every layer", () => {
            const payload = resolveAnalytics({ sdk_version: "hack1", source: "a" }, { sdk_type: "hack2", source: "b" });
            expect(payload.sdk_version).toBe(SDK_VERSION);
            expect(payload.sdk_type).toBe("corti-sdk-javascript");
            expect(payload.source).toBe("b");
        });

        it("skips undefined layers", () => {
            const payload = resolveAnalytics(undefined, { source: "web" }, undefined);
            expect(payload.source).toBe("web");
        });

        it("always sets sdk_version and sdk_type", () => {
            const payload = resolveAnalytics({ source: "web" });
            expect(payload.sdk_version).toBe(SDK_VERSION);
            expect(payload.sdk_type).toBe("corti-sdk-javascript");
        });
    });

    describe("mergeUserAnalytics", () => {
        it("merges layers and strips reserved keys", () => {
            const merged = mergeUserAnalytics({ source: "a", sdk_version: "hack" }, { source: "b", extra: 1 });
            expect(merged.source).toBe("b");
            expect(merged.extra).toBe(1);
            expect(merged.sdk_version).toBeUndefined();
        });

        it("skips undefined layers", () => {
            const merged = mergeUserAnalytics(undefined, { source: "web" });
            expect(merged.source).toBe("web");
        });
    });

    describe("parseCallerAnalyticsValue", () => {
        it("parses valid JSON object", () => {
            expect(parseCallerAnalyticsValue(JSON.stringify({ a: 1 }))).toEqual({ a: 1 });
        });

        it("returns empty for invalid JSON", () => {
            expect(parseCallerAnalyticsValue("not-json")).toEqual({});
        });

        it("returns empty for non-string", () => {
            expect(parseCallerAnalyticsValue(42)).toEqual({});
            expect(parseCallerAnalyticsValue(null)).toEqual({});
            expect(parseCallerAnalyticsValue(undefined)).toEqual({});
        });

        it("returns empty for arrays and primitives", () => {
            expect(parseCallerAnalyticsValue(JSON.stringify([1, 2]))).toEqual({});
            expect(parseCallerAnalyticsValue(JSON.stringify("hello"))).toEqual({});
        });
    });

    describe("mergeAnalyticsQueryParams", () => {
        it("merges user params with analytics, preserving user keys", () => {
            const merged = mergeAnalyticsQueryParams({ foo: "bar", count: 3 }, { source: "web" });
            expect(merged.foo).toBe("bar");
            expect(merged.count).toBe(3);
            expect(merged[X_CORTI_ANALYTICS_QUERY]).toContain('"source":"web"');
        });

        it("folds caller-supplied x-corti-analytics value as base layer, SDK wins", () => {
            const callerJson = JSON.stringify({ custom: "preserved", sdk_version: "hack" });
            const merged = mergeAnalyticsQueryParams(
                { [X_CORTI_ANALYTICS_QUERY]: callerJson, other: "kept" },
                { source: "web" },
            );
            expect(merged.other).toBe("kept");
            const parsed = JSON.parse(merged[X_CORTI_ANALYTICS_QUERY] as string);
            expect(parsed.sdk_version).toBe(SDK_VERSION);
            expect(parsed.source).toBe("web");
            expect(parsed.custom).toBe("preserved");
            expect(parsed.sdk_type).toBe("corti-sdk-javascript");
        });

        it("ignores invalid JSON in caller-supplied x-corti-analytics", () => {
            const merged = mergeAnalyticsQueryParams(
                { [X_CORTI_ANALYTICS_QUERY]: "not-json", other: "kept" },
                { source: "web" },
            );
            expect(merged.other).toBe("kept");
            const parsed = JSON.parse(merged[X_CORTI_ANALYTICS_QUERY] as string);
            expect(parsed.sdk_version).toBe(SDK_VERSION);
            expect(parsed.source).toBe("web");
        });

        it("handles undefined user params", () => {
            const merged = mergeAnalyticsQueryParams(undefined, { source: "web" });
            expect(Object.keys(merged)).toEqual([X_CORTI_ANALYTICS_QUERY]);
        });

        it("handles undefined analytics", () => {
            const merged = mergeAnalyticsQueryParams({ foo: "bar" }, undefined);
            expect(merged.foo).toBe("bar");
            expect(merged[X_CORTI_ANALYTICS_QUERY]).toBeDefined();
        });
    });

    describe("withAnalyticsFetch", () => {
        it("does not add a header when none is present (CORS: auth requests)", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, { source: "client" });

            const init: RequestInit = { method: "GET", headers: new Headers() };
            await wrapped("https://example.com", init);

            const headers = init.headers as Headers;
            expect(headers.get("x-corti-analytics")).toBeNull();
        });

        it("merges per-request caller fields with client-level, per-request wins", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, { source: "client", env: "dev" });

            const init: RequestInit = {
                method: "GET",
                headers: new Headers({ "x-corti-analytics": JSON.stringify({ env: "prod", req: "abc" }) }),
            };
            await wrapped("https://example.com", init);

            const headers = init.headers as Headers;
            const payload = JSON.parse(headers.get("x-corti-analytics") as string);
            expect(payload.source).toBe("client");
            expect(payload.env).toBe("prod");
            expect(payload.req).toBe("abc");
            expect(payload.sdk_version).toBe(SDK_VERSION);
        });

        it("strips reserved keys from caller header", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, undefined);

            const init: RequestInit = {
                method: "GET",
                headers: new Headers({
                    "x-corti-analytics": JSON.stringify({ sdk_version: "hack", source: "web" }),
                }),
            };
            await wrapped("https://example.com", init);

            const headers = init.headers as Headers;
            const payload = JSON.parse(headers.get("x-corti-analytics") as string);
            expect(payload.sdk_version).toBe(SDK_VERSION);
            expect(payload.source).toBe("web");
        });

        it("invalid JSON in header falls back to client-level + reserved", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, { source: "client" });

            const init: RequestInit = {
                method: "GET",
                headers: new Headers({ "x-corti-analytics": "not-json" }),
            };
            await wrapped("https://example.com", init);

            const headers = init.headers as Headers;
            const payload = JSON.parse(headers.get("x-corti-analytics") as string);
            expect(payload.source).toBe("client");
            expect(payload.sdk_version).toBe(SDK_VERSION);
        });

        it("is idempotent — re-running on its own output produces the same value", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, { source: "client" });

            const init: RequestInit = {
                method: "GET",
                headers: new Headers({ "x-corti-analytics": JSON.stringify({ req: "abc" }) }),
            };
            await wrapped("https://example.com", init);
            const firstValue = (init.headers as Headers).get("x-corti-analytics");

            await wrapped("https://example.com", init);
            const secondValue = (init.headers as Headers).get("x-corti-analytics");

            expect(firstValue).toBe(secondValue);
        });

        it("works with plain object headers (case-insensitive)", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, { source: "client" });

            const init: RequestInit = {
                method: "GET",
                headers: { "X-Corti-Analytics": JSON.stringify({ req: "abc" }) },
            };
            await wrapped("https://example.com", init);

            const headers = init.headers as Record<string, string>;
            const payload = JSON.parse(headers["X-Corti-Analytics"]);
            expect(payload.source).toBe("client");
            expect(payload.req).toBe("abc");
            expect(payload.sdk_version).toBe(SDK_VERSION);
        });

        it("passes init through otherwise untouched", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, undefined);

            const abortController = new AbortController();
            const init: RequestInit = {
                method: "POST",
                headers: new Headers({ "Content-Type": "application/json" }),
                body: '{"hello":"world"}',
                signal: abortController.signal,
                credentials: "include",
            };
            await wrapped("https://example.com", init);

            expect(userFetch).toHaveBeenCalledWith("https://example.com", init);
            expect((init.headers as Headers).get("content-type")).toBe("application/json");
            expect(init.body).toBe('{"hello":"world"}');
            expect(init.signal).toBe(abortController.signal);
            expect(init.credentials).toBe("include");
        });

        it("resolves fetch at call time, not wrap time", async () => {
            const wrapped = withAnalyticsFetch(undefined, { source: "client" });

            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            global.fetch = userFetch as unknown as typeof fetch;

            await wrapped("https://example.com", { method: "GET", headers: new Headers() });

            expect(userFetch).toHaveBeenCalledTimes(1);
            delete global.fetch;
        });

        it("does not throw when headers is absent", async () => {
            const userFetch = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
            const wrapped = withAnalyticsFetch(userFetch, { source: "client" });

            await expect(wrapped("https://example.com", { method: "GET" })).resolves.toBeDefined();
            expect(userFetch).toHaveBeenCalledTimes(1);
        });
    });

    it("uses the expected header/query names", () => {
        expect(X_CORTI_ANALYTICS_HEADER).toBe("X-Corti-Analytics");
        expect(X_CORTI_ANALYTICS_QUERY).toBe("x-corti-analytics");
    });
});
