import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.sections.list", () => {
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

    describe("should list guided sections with only required values", () => {
        it("should retrieve sections without parameters without errors or warnings", async () => {
            expect.assertions(2);

            const result = await cortiClient.documents.sections.list();

            expect(Array.isArray(result)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should list guided sections with all source enum values", () => {
        it('should filter sections by source "user" without errors or warnings', async () => {
            expect.assertions(2);

            const result = await cortiClient.documents.sections.list({ source: "user" });

            expect(Array.isArray(result)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should filter sections by source "corti" without errors or warnings', async () => {
            expect.assertions(2);

            const result = await cortiClient.documents.sections.list({ source: "corti" });

            expect(Array.isArray(result)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
