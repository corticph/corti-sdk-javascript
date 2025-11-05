import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    globals: true,
                    name: "unit",
                    environment: "node",
                    root: "./tests",
                    include: ["**/*.test.{js,ts,jsx,tsx}"],
                    exclude: ["wire/**"],
                },
            },
            {
                test: {
                    globals: true,
                    name: "wire",
                    environment: "node",
                    root: "./tests/wire",
                    setupFiles: ["../mock-server/setup.ts"],
                },
            },
            {
                test: {
                    globals: true,
                    name: "integration",
                    environment: "node",
                    root: "./tests",
                    include: ["**/*.integration.ts"],
                    testTimeout: 120000, // 2 minute TTL,
                    fileParallelism: false,
                    maxConcurrency: 1,
                },
            },
        ],
        passWithNoTests: true,
    },
});
