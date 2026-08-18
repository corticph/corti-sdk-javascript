import { withAnalytics, X_CORTI_ANALYTICS_HEADER, X_CORTI_ANALYTICS_QUERY } from "../../../src/custom/utils/analytics";
import { SDK_VERSION } from "../../../src/version";

describe("withAnalytics", () => {
    it("sets the payload on the given key and preserves other fields", () => {
        const merged = withAnalytics({ source: "web" }, X_CORTI_ANALYTICS_QUERY, { foo: "bar", count: 3 });
        expect(merged.foo).toBe("bar");
        expect(merged.count).toBe(3);
        expect(merged[X_CORTI_ANALYTICS_QUERY]).toBe(
            `{"source":"web","sdk_version":"${SDK_VERSION}","sdk_type":"corti-sdk-javascript"}`,
        );
    });

    it("omits record when not passed", () => {
        const merged = withAnalytics({ source: "web" }, X_CORTI_ANALYTICS_HEADER);
        expect(Object.keys(merged)).toEqual([X_CORTI_ANALYTICS_HEADER]);
    });

    it("handles undefined analytics", () => {
        const merged = withAnalytics(undefined, X_CORTI_ANALYTICS_QUERY, { foo: "bar" });
        expect(merged.foo).toBe("bar");
        expect(merged[X_CORTI_ANALYTICS_QUERY]).toBe(
            `{"sdk_version":"${SDK_VERSION}","sdk_type":"corti-sdk-javascript"}`,
        );
    });

    it("overwrites reserved keys from the caller", () => {
        const merged = withAnalytics({ sdk_version: "hack", source: "web" }, X_CORTI_ANALYTICS_QUERY);
        const parsed = JSON.parse(merged[X_CORTI_ANALYTICS_QUERY] as string);
        expect(parsed.sdk_version).toBe(SDK_VERSION);
        expect(parsed.sdk_type).toBe("corti-sdk-javascript");
        expect(parsed.source).toBe("web");
    });
});
