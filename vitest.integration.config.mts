import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        name: "integration",
        environment: "node",
        include: ["tests/custom/**/*.integration.ts"],
        testTimeout: 120000,
        fileParallelism: false,
        sequence: { concurrent: false },
        passWithNoTests: true,
    },
});
