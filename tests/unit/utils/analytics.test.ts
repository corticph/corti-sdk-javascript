import {
    analyticsHeaderValue,
    analyticsQueryParams,
    buildAnalyticsPayload,
    mergeAnalyticsHeaders,
    mergeAnalyticsQueryParams,
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
                sdk_type: "javascript",
            });
        });

        it("preserves caller-provided fields", () => {
            const payload = buildAnalyticsPayload({ source: "web", foo: "bar" });
            expect(payload.sdk_version).toBe(SDK_VERSION);
            expect(payload.sdk_type).toBe("javascript");
            expect(payload.source).toBe("web");
            expect(payload.foo).toBe("bar");
        });

        it("ignores reserved keys provided by the caller", () => {
            const payload = buildAnalyticsPayload({ sdk_version: "hack", sdk_type: "other", source: "web" });
            expect(payload.sdk_version).toBe(SDK_VERSION);
            expect(payload.sdk_type).toBe("javascript");
            expect(payload.source).toBe("web");
        });
    });

    describe("analyticsHeaderValue", () => {
        it("serializes the payload to JSON", () => {
            expect(analyticsHeaderValue({ source: "web" })).toBe(
                `{"sdk_version":"${SDK_VERSION}","sdk_type":"javascript","source":"web"}`,
            );
        });
    });

    describe("analyticsQueryParams", () => {
        it("returns a single x-corti-analytics query parameter with a JSON value", () => {
            expect(analyticsQueryParams({ source: "web" })).toEqual({
                [X_CORTI_ANALYTICS_QUERY]: `{"sdk_version":"${SDK_VERSION}","sdk_type":"javascript","source":"web"}`,
            });
        });
    });

    describe("mergeAnalyticsQueryParams", () => {
        it("merges user params with analytics, preserving user keys", () => {
            const merged = mergeAnalyticsQueryParams({ foo: "bar", count: 3 }, { source: "web" });
            expect(merged.foo).toBe("bar");
            expect(merged.count).toBe(3);
            expect(merged[X_CORTI_ANALYTICS_QUERY]).toContain('"source":"web"');
        });

        it("analytics overwrites user-provided x-corti-analytics key", () => {
            const evil = JSON.stringify({ sdk_version: "hack", evil: true });
            const merged = mergeAnalyticsQueryParams(
                { [X_CORTI_ANALYTICS_QUERY]: evil, custom: "preserved" },
                { source: "web" },
            );
            expect(merged.custom).toBe("preserved");
            const parsed = JSON.parse(merged[X_CORTI_ANALYTICS_QUERY] as string);
            expect(parsed.sdk_version).toBe(SDK_VERSION);
            expect(parsed.source).toBe("web");
            expect(parsed.evil).toBeUndefined();
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

    describe("mergeAnalyticsHeaders", () => {
        it("merges user headers with analytics header, preserving user keys", () => {
            const merged = mergeAnalyticsHeaders({ "X-Custom": "yes" }, { source: "web" });
            expect(merged["X-Custom"]).toBe("yes");
            expect(merged[X_CORTI_ANALYTICS_HEADER]).toContain('"source":"web"');
        });

        it("analytics overwrites user-provided X-Corti-Analytics header", () => {
            const evil = JSON.stringify({ sdk_version: "hack", evil: true });
            const merged = mergeAnalyticsHeaders(
                { [X_CORTI_ANALYTICS_HEADER]: evil, "X-Custom": "preserved" },
                { source: "web" },
            );
            expect(merged["X-Custom"]).toBe("preserved");
            const parsed = JSON.parse(merged[X_CORTI_ANALYTICS_HEADER] as string);
            expect(parsed.sdk_version).toBe(SDK_VERSION);
            expect(parsed.source).toBe("web");
            expect(parsed.evil).toBeUndefined();
        });

        it("handles undefined user headers", () => {
            const merged = mergeAnalyticsHeaders(undefined, { source: "web" });
            expect(Object.keys(merged)).toEqual([X_CORTI_ANALYTICS_HEADER]);
        });
    });

    it("uses the expected header/query names", () => {
        expect(X_CORTI_ANALYTICS_HEADER).toBe("X-Corti-Analytics");
        expect(X_CORTI_ANALYTICS_QUERY).toBe("x-corti-analytics");
    });
});
