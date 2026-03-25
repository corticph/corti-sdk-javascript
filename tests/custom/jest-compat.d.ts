import type { MockInstance } from "vitest";

declare namespace jest {
    type SpyInstance = MockInstance;
}
