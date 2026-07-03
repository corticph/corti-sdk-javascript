import type { CortiClient } from "../../src";
import { createTestCortiClient, setupConsoleWarnSpy } from "./testUtils";

describe("cortiClient.documents.templates.list", () => {
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

    describe("should list guided templates with only required values", () => {
        it("should retrieve templates without parameters without errors or warnings", async () => {
            const result = await cortiClient.documents.templates.list();

            expect(Array.isArray(result)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it("should return GuidedTemplateListItem without publishedVersion while get returns full template", async () => {
            const listed = await cortiClient.documents.templates.list({ source: "corti", published: true });

            expect(listed.length).toBeGreaterThan(0);

            const item = listed[0];
            expect(item).not.toHaveProperty("publishedVersion");

            const full = await cortiClient.documents.templates.get(item.id);
            expect(full.publishedVersion).toBeDefined();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should list guided templates with all source enum values", () => {
        it('should filter templates by source "user" without errors or warnings', async () => {
            const result = await cortiClient.documents.templates.list({ source: "user" });

            expect(Array.isArray(result)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should filter templates by source "corti" without errors or warnings', async () => {
            const result = await cortiClient.documents.templates.list({ source: "corti" });

            expect(Array.isArray(result)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });

    describe("should list guided templates with optional query parameters", () => {
        it("should filter templates using published and label without errors or warnings", async () => {
            const result = await cortiClient.documents.templates.list({
                published: true,
                label: ["integration-test:true"],
                lang: ["en"],
            });

            expect(Array.isArray(result)).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});
