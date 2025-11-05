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
                    testTimeout: 120000, // 2 minute TTL
                    maxConcurrency: 1, // Run tests one by one (no concurrent execution)
                    pool: "forks",
                    poolOptions: {
                        forks: {
                            singleFork: true, // Ensures all tests run in a single process
                        },
                    },
                },
            },
        ],
        passWithNoTests: true,
    },
});
