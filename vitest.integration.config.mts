import { defineConfig } from "vitest/config";

const sharedIntegrationProject = {
    globals: true as const,
    environment: "node" as const,
    testTimeout: 120_000,
    hookTimeout: 120_000,
    passWithNoTests: true,
};

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: "integration",
                    ...sharedIntegrationProject,
                    include: ["tests/custom/**/*.integration.ts"],
                },
            },
            {
                test: {
                    name: "integration-empty-state",
                    ...sharedIntegrationProject,
                    include: ["tests/custom/empty-state.ts"],
                },
            },
        ],
    },
});
