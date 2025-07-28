/** @type {import('jest').Config} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    displayName: "integration",
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    roots: ["<rootDir>/tests/custom", "<rootDir>/src"],
    testMatch: ["**/*.integration.ts"],
    setupFilesAfterEnv: [],
    testTimeout: 60000, // 1 minute TTL
    maxWorkers: 1, // Run tests one by one (no concurrent execution)
    workerThreads: false,
    passWithNoTests: true,
}; 