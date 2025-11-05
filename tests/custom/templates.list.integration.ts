import { CortiClient } from '../../src';
import type { MockInstance } from 'vitest';
import { 
  createTestCortiClient, 
  setupConsoleWarnSpy 
} from './testUtils';

describe('cortiClient.templates.list', () => {
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

  it.concurrent('should retrieve templates without parameters', async () => {
    expect.assertions(2);

    const result = await cortiClient.templates.list();

    expect(result.data.length).toBeGreaterThan(0);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  describe('language filtering (lang parameter)', () => {
    // FIXME Skipped because of https://linear.app/corti/issue/TGT-383/get-templates-endpoint-returns-inconsistent-results
    it.skip('should filter templates by single language (lang: "en")', async () => {
      expect.assertions(4);

      const unfilteredResult = await cortiClient.templates.list();
      
      const filteredResult = await cortiClient.templates.list({ lang: "en" });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(filteredResult.data.length).toBeGreaterThan(0);

      expect(JSON.stringify(unfilteredResult.data)).not.toBe(JSON.stringify(filteredResult.data));
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // FIXME Skipped because of https://linear.app/corti/issue/TGT-383/get-templates-endpoint-returns-inconsistent-results
    it.skip('should filter templates by multiple languages (lang: ["da", "en"])', async () => {
      expect.assertions(5);

      const unfilteredResult = await cortiClient.templates.list();
      const singleLangResult = await cortiClient.templates.list({ lang: "en" });
      const multiLangResult = await cortiClient.templates.list({ lang: ["da", "en"] });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(multiLangResult.data.length).toBeGreaterThan(0);

      expect(JSON.stringify(unfilteredResult.data)).not.toBe(JSON.stringify(multiLangResult.data));
      expect(JSON.stringify(singleLangResult.data)).not.toBe(JSON.stringify(multiLangResult.data));
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('organization filtering (org parameter)', () => {
    // FIXME Skipped because of https://linear.app/corti/issue/TGT-383/get-templates-endpoint-returns-inconsistent-results
    it.skip('should filter templates by single organization (org: "corti")', async () => {
      expect.assertions(3);

      const unfilteredResult = await cortiClient.templates.list();
      
      const filteredResult = await cortiClient.templates.list({ org: "corti" });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(filteredResult.data.length).toBeGreaterThan(0);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // FIXME Skipped because of https://linear.app/corti/issue/TGT-383/get-templates-endpoint-returns-inconsistent-results
    it.skip('should filter templates by multiple organizations (org: ["corti", "another-org"])', async () => {
      expect.assertions(3);

      const unfilteredResult = await cortiClient.templates.list();
      const multiOrgResult = await cortiClient.templates.list({ org: ["corti", "another-org"] });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(multiOrgResult.data.length).toBeGreaterThan(0);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it.concurrent('should return empty or filtered results for non-existent organization', async () => {
      expect.assertions(2);

      const filteredResult = await cortiClient.templates.list({ org: "nonexistent-org" });

      expect(filteredResult.data.length).toBeGreaterThanOrEqual(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('status filtering (status parameter)', () => {
    // FIXME Skipped because of https://linear.app/corti/issue/TGT-383/get-templates-endpoint-returns-inconsistent-results
    it.skip('should filter templates by single status (status: "published")', async () => {
      expect.assertions(4);

      const unfilteredResult = await cortiClient.templates.list();
      
      const filteredResult = await cortiClient.templates.list({ status: "published" });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(filteredResult.data.length).toBe(unfilteredResult.data.length);

      expect(JSON.stringify(unfilteredResult.data)).toBe(JSON.stringify(filteredResult.data));

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    // FIXME Skipped because of https://linear.app/corti/issue/TGT-383/get-templates-endpoint-returns-inconsistent-results
    it.skip('should filter templates by multiple statuses (status: ["published", "draft"])', async () => {
      expect.assertions(4);

      const unfilteredResult = await cortiClient.templates.list();
      const multiStatusResult = await cortiClient.templates.list({ status: ["published", "draft"] });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(multiStatusResult.data.length).toBeGreaterThanOrEqual(unfilteredResult.data.length);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it.concurrent('should return empty or filtered results for non-existent status', async () => {
      expect.assertions(2);

      const filteredResult = await cortiClient.templates.list({ status: "nonexistent-status" });

      expect(filteredResult.data.length).toBeGreaterThanOrEqual(0);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // FIXME Skipped because of https://linear.app/corti/issue/TGT-383/get-templates-endpoint-returns-inconsistent-results
  describe.skip('combined filtering (lang, org, and status parameters)', () => {
    it.concurrent('should filter templates using all parameters together', async () => {
      expect.assertions(4);

      const unfilteredResult = await cortiClient.templates.list();
      const combinedResult = await cortiClient.templates.list({
        lang: ["da", "en"], 
        org: ["corti", "another-org"],
        status: ["published", "draft"]
      });

      expect(unfilteredResult.data.length).toBeGreaterThan(0);
      expect(combinedResult.data.length).toBeGreaterThan(0);

      expect(JSON.stringify(unfilteredResult.data)).not.toBe(JSON.stringify(combinedResult.data));
      
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
}); 