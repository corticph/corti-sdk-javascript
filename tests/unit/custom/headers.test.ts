import { mergeHeaders, mergeOnlyDefinedHeaders } from "../../../src/core/headers";
import { SDK_VERSION } from "../../../src/version";

describe("mergeHeaders", () => {
    it("last-write-wins for ordinary headers and lowercases keys", () => {
        const merged = mergeHeaders({ "X-Foo": "a", "X-Bar": "keep" }, { "x-foo": "b" });
        expect(merged).toEqual({ "x-foo": "b", "x-bar": "keep" });
    });

    it("null deletes an existing header", () => {
        const merged = mergeHeaders({ "X-Foo": "a" }, { "x-foo": null });
        expect(merged).toEqual({});
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
