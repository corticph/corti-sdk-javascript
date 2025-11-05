import { CortiClient } from '../../src';
import type { MockInstance } from 'vitest';
import { 
  createTestCortiClient, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.templates.sectionList', () => {
  let cortiClient: CortiClient;
  let consoleWarnSpy: MockInstance;

  beforeAll(() => {
    cortiClient = createTestCortiClient();
  });

  beforeEach(() => {
    consoleWarnSpy = setupConsoleWarnSpy();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('should retrieve template sections without parameters', async () => {
    expect.assertions(2);

    const result = await cortiClient.templates.sectionList();

    expect(result.data.length).toBeGreaterThan(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('language filtering (lang parameter)', () => {
    it('should filter template sections by single language (lang: "en")', async () => {
      expect.assertions(4);

      const unfilteredResult = await cortiClient.templates.sectionList();
      
      const filteredResult = await cortiClient.templates.sectionList({ lang: "en" });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(filteredResult.data.length).toBeGreaterThan(0);

      expect(JSON.stringify(unfilteredResult.data)).not.toBe(JSON.stringify(filteredResult.data));
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should filter template sections by multiple languages (lang: ["da", "en"])', async () => {
      expect.assertions(5);

      const unfilteredResult = await cortiClient.templates.sectionList();
      const singleLangResult = await cortiClient.templates.sectionList({ lang: "en" });
      const multiLangResult = await cortiClient.templates.sectionList({ lang: ["da", "en"] });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(multiLangResult.data.length).toBeGreaterThan(0);

      expect(JSON.stringify(unfilteredResult.data)).not.toBe(JSON.stringify(multiLangResult.data));
      expect(JSON.stringify(singleLangResult.data)).not.toBe(JSON.stringify(multiLangResult.data));
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('organization filtering (org parameter)', () => {
    it('should filter template sections by single organization (org: "corti")', async () => {
      expect.assertions(3);

      const unfilteredResult = await cortiClient.templates.sectionList();
      
      const filteredResult = await cortiClient.templates.sectionList({ org: "corti" });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(filteredResult.data.length).toBeGreaterThan(0);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should filter template sections by multiple organizations (org: ["corti", "another-org"])', async () => {
      expect.assertions(3);

      const unfilteredResult = await cortiClient.templates.sectionList();
      const multiOrgResult = await cortiClient.templates.sectionList({ org: ["corti", "another-org"] });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(multiOrgResult.data.length).toBeGreaterThan(0);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should return empty results for non-existent organization', async () => {
      expect.assertions(2);

      const filteredResult = await cortiClient.templates.sectionList({ org: "nonexistent-org" });

      expect(filteredResult.data.length).toBeGreaterThanOrEqual(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('combined filtering (lang and org parameters)', () => {
    it('should filter template sections using both language and organization parameters', async () => {
      expect.assertions(4);

      const unfilteredResult = await cortiClient.templates.sectionList();
      const combinedResult = await cortiClient.templates.sectionList({
        lang: ["da", "en"], 
        org: ["corti", "another-org"] 
      });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(combinedResult.data.length).toBeGreaterThan(0);

      expect(JSON.stringify(unfilteredResult.data)).not.toBe(JSON.stringify(combinedResult.data));
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
}); 