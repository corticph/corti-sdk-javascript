import { mergeHeaders, mergeOnlyDefinedHeaders } from "../../../src/core/headers";
import { X_CORTI_ANALYTICS } from "../../../src/custom/utils/analytics";
import { SDK_VERSION } from "../../../src/version";

const DEFAULT_ANALYTICS = {
    sdk_version: SDK_VERSION,
    sdk_type: "corti-sdk-javascript",
};

describe("mergeHeaders", () => {
    it("last-write-wins for ordinary headers and lowercases keys", () => {
        const merged = mergeHeaders({ "X-Foo": "a", "X-Bar": "keep" }, { "x-foo": "b" });
        expect(merged["x-foo"]).toBe("b");
        expect(merged["x-bar"]).toBe("keep");
        expect(JSON.parse(merged[X_CORTI_ANALYTICS] as string)).toEqual(DEFAULT_ANALYTICS);
    });

    it("null deletes an existing header", () => {
        const merged = mergeHeaders({ "X-Foo": "a" }, { "x-foo": null });
        expect(merged["x-foo"]).toBeUndefined();
        expect(JSON.parse(merged[X_CORTI_ANALYTICS] as string)).toEqual(DEFAULT_ANALYTICS);
    });

    it("always sets reserved sdk keys when no analytics is provided", () => {
        const merged = mergeHeaders({ "X-Foo": "a" });
        expect(JSON.parse(merged[X_CORTI_ANALYTICS] as string)).toEqual(DEFAULT_ANALYTICS);
    });

    it("deep-merges x-corti-analytics JSON payloads regardless of case", () => {
        const merged = mergeHeaders(
            { "X-Corti-Analytics": JSON.stringify({ source: "web", env: "dev" }) },
            { "x-corti-analytics": JSON.stringify({ env: "prod", req: "abc" }) },
        );
        const payload = JSON.parse(merged["x-corti-analytics"] as string);
        expect(payload.source).toBe("web");
        expect(payload.env).toBe("prod");
        expect(payload.req).toBe("abc");
        expect(payload.sdk_version).toBe(SDK_VERSION);
        expect(payload.sdk_type).toBe("corti-sdk-javascript");
    });

    it("strips reserved keys from every analytics layer", () => {
        const merged = mergeHeaders(
            { "x-corti-analytics": JSON.stringify({ sdk_version: "hack", source: "a" }) },
            { "X-CORTI-ANALYTICS": JSON.stringify({ sdk_type: "other", source: "b" }) },
        );
        const payload = JSON.parse(merged["x-corti-analytics"] as string);
        expect(payload.sdk_version).toBe(SDK_VERSION);
        expect(payload.sdk_type).toBe("corti-sdk-javascript");
        expect(payload.source).toBe("b");
    });

    it("serializes a single analytics object and applies reserved keys", () => {
        const merged = mergeHeaders({ "X-Corti-Analytics": { source: "web" } });
        const payload = JSON.parse(merged["x-corti-analytics"] as string);
        expect(payload.source).toBe("web");
        expect(payload.sdk_version).toBe(SDK_VERSION);
        expect(payload.sdk_type).toBe("corti-sdk-javascript");
    });

    it("deep-merges analytics objects with JSON strings", () => {
        const merged = mergeHeaders(
            { "X-Corti-Analytics": { source: "web", env: "dev" } },
            { "x-corti-analytics": JSON.stringify({ env: "prod", req: "abc" }) },
        );
        const payload = JSON.parse(merged["x-corti-analytics"] as string);
        expect(payload.source).toBe("web");
        expect(payload.env).toBe("prod");
        expect(payload.req).toBe("abc");
        expect(payload.sdk_version).toBe(SDK_VERSION);
    });

    it("does not change mergeOnlyDefinedHeaders last-write-wins", () => {
        const merged = mergeOnlyDefinedHeaders(
            { "x-corti-analytics": JSON.stringify({ source: "a" }) },
            { "x-corti-analytics": JSON.stringify({ source: "b" }) },
        );
        expect(merged["x-corti-analytics"]).toBe(JSON.stringify({ source: "b" }));
    });
});
