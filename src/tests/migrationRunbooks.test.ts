import { describe, it, expect } from 'vitest';
import {
  PLATFORM_MIGRATION_RUNBOOKS,
  getRunbookForPlatform,
  OFFICIAL_RUNBOOK_CITATIONS
} from '../data/migrationRunbooksData';

describe('Official Vendor Migration Runbooks & 9-Stage Lifecycle Guidance', () => {
  it('covers all target platform variants', () => {
    expect(PLATFORM_MIGRATION_RUNBOOKS.length).toBeGreaterThanOrEqual(4);
    const platformIds = PLATFORM_MIGRATION_RUNBOOKS.map((r) => r.platformId);
    expect(platformIds).toContain('avs-gen1');
    expect(platformIds).toContain('vmc-aws');
    expect(platformIds).toContain('gcve');
    expect(platformIds).toContain('nc2-azure');
  });

  it('includes Nutanix NC2 on Azure with verified official citations', () => {
    const nc2Runbook = getRunbookForPlatform('nc2-azure');
    expect(nc2Runbook.platformName).toContain('Nutanix Cloud Clusters (NC2) on Microsoft Azure');
    expect(nc2Runbook.citations.length).toBeGreaterThanOrEqual(1);

    const nutanixCitations = nc2Runbook.citations.filter((c) => c.vendor === 'Nutanix');
    expect(nutanixCitations.length).toBeGreaterThan(0);
    expect(nutanixCitations[0].sourceUrl).toMatch(/^https:\/\/portal\.nutanix\.com/);
    expect(nutanixCitations[0].verificationStatus).toBe('verified');
  });

  it('provides structured multi-stage migration steps for each platform runbook', () => {
    for (const runbook of PLATFORM_MIGRATION_RUNBOOKS) {
      expect(runbook.steps.length).toBeGreaterThanOrEqual(8);
      const stages = runbook.steps.map((s) => s.lifecycleStage);
      expect(stages).toContain('stage-1-discovery');
      expect(stages).toContain('stage-2-prerequisites');
      expect(stages).toContain('stage-3-network-prep');
      expect(stages).toContain('stage-6-cutover');
      expect(stages).toContain('stage-7-validation');
      expect(stages).toContain('stage-9-post-migration-closure');
    }
  });

  it('strictly specifies rollback procedures and vendor documentation for each step', () => {
    for (const runbook of PLATFORM_MIGRATION_RUNBOOKS) {
      const vendorFacts = runbook.steps.filter((s) => s.isVendorDocumentedFact);
      expect(vendorFacts.length).toBeGreaterThan(0);

      // Every step must have a defined rollback or recovery procedure
      for (const step of runbook.steps) {
        expect(step.rollbackConsideration).toBeDefined();
        expect(step.rollbackConsideration.length).toBeGreaterThan(0);
      }
    }
  });

  it('cites official verified documentation URLs and dates for all vendors', () => {
    const citations = Object.values(OFFICIAL_RUNBOOK_CITATIONS);
    expect(citations.length).toBeGreaterThanOrEqual(6);

    for (const citation of citations) {
      expect(citation.sourceUrl).toMatch(/^https:\/\//);
      expect(citation.verificationDate).toBeDefined();
      expect(citation.documentTitle.length).toBeGreaterThan(5);
      expect(['Microsoft', 'VMware / Broadcom', 'Google Cloud', 'Nutanix']).toContain(citation.vendor);
    }
  });
});
