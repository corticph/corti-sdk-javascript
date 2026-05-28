import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.languages.list", () => {
    let cortiClient: CortiClient;
    let consoleWarnSpy: ReturnType<typeof setupConsoleWarnSpy>;

    beforeAll(() => {
        cortiClient = createTestCortiClient();
    });

    beforeEach(() => {
        consoleWarnSpy = setupConsoleWarnSpy();
    });

    afterEach(() => {
        consoleWarnSpy.mockRestore();
    });

    describe("should list languages with minimal parameters", () => {
        it("should return languages list without filters and without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.languages.list();

            expect(result).toBeDefined();
            expect(result.languages).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should list languages with endpoint enum filters", () => {
        it("should return languages for streams endpoint without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.languages.list({ endpoint: "streams" });

            expect(result).toBeDefined();
            expect(result.languages).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return languages for transcribe endpoint without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.languages.list({ endpoint: "transcribe" });

            expect(result).toBeDefined();
            expect(result.languages).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return languages for transcripts endpoint without errors or warnings", async () => {
            expect.assertions(3);

            const result = await cortiClient.languages.list({ endpoint: "transcripts" });

            expect(result).toBeDefined();
            expect(result.languages).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
