import { withAnalytics, X_CORTI_ANALYTICS } from "../../../src/custom/utils/analytics";
import { SDK_VERSION } from "../../../src/version";

describe("withAnalytics", () => {
    it("sets the payload and preserves other fields", () => {
        const merged = withAnalytics({ source: "web" }, { foo: "bar", count: 3 });
        expect(merged.foo).toBe("bar");
        expect(merged.count).toBe(3);
        expect(merged[X_CORTI_ANALYTICS]).toBe(
            `{"source":"web","sdk_version":"${SDK_VERSION}","sdk_type":"corti-sdk-javascript"}`,
        );
    });

    it("omits record when not passed", () => {
        const merged = withAnalytics({ source: "web" });
        expect(Object.keys(merged)).toEqual([X_CORTI_ANALYTICS]);
    });

    it("handles undefined analytics", () => {
        const merged = withAnalytics(undefined, { foo: "bar" });
        expect(merged.foo).toBe("bar");
        expect(merged[X_CORTI_ANALYTICS]).toBe(`{"sdk_version":"${SDK_VERSION}","sdk_type":"corti-sdk-javascript"}`);
    });

    it("overwrites reserved keys from the caller", () => {
        const merged = withAnalytics({ sdk_version: "hack", source: "web" });
        const parsed = JSON.parse(merged[X_CORTI_ANALYTICS] as string);
        expect(parsed.sdk_version).toBe(SDK_VERSION);
        expect(parsed.sdk_type).toBe("corti-sdk-javascript");
        expect(parsed.source).toBe("web");
    });

    it("merges an existing analytics value on the record, later keys win", () => {
        const merged = withAnalytics(
            { integration: "epic", visit_type: "outpatient" },
            {
                foo: "bar",
                [X_CORTI_ANALYTICS]: JSON.stringify({ visit_type: "inpatient" }),
            },
        );
        const parsed = JSON.parse(merged[X_CORTI_ANALYTICS] as string);
        expect(merged.foo).toBe("bar");
        expect(parsed.integration).toBe("epic");
        expect(parsed.visit_type).toBe("inpatient");
        expect(parsed.sdk_version).toBe(SDK_VERSION);
    });
});
