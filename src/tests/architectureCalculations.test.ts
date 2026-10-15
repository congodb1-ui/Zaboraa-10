import { describe, it, expect } from 'vitest';
import {
  calculateClusterCapacity,
  calculateTotalInfrastructureCapacity,
  evaluateFailureScenario,
  calculateCompoundWorkloadGrowth,
  calculateReplicationBandwidthMbps,
  convertStorageUnits,
  ClusterNodeClass,
  DEFAULT_ENGINEERING_ASSUMPTIONS
} from '../utils/architectureCalculator';

import {
  ipToInteger,
  integerToIp,
  getReservedAddressCount,
  parseAndValidateCidr,
  checkSubnetOverlap,
  validateSddcPlatformCidr
} from '../utils/cidrUtils';

import {
  calculateUsableStorage,
  convertStorageUnit,
  ENTERPRISE_STORAGE_POLICIES
} from '../utils/storageCalculator';

import {
  TARGET_NODE_SKU_CATALOGUE,
  STORAGE_ATTACHMENT_CATALOGUE,
  DR_ENGINE_CATALOGUE
} from '../data/cloudCompatibilityCatalogue';

describe('Architecture & Capacity Calculation Engine', () => {
  const standardNode: ClusterNodeClass = {
    id: 'cluster-prod-1',
    name: 'Production vSphere Cluster',
    hostCount: 8,
    sockets: 2,
    coresPerSocket: 32, // 64 physical cores per host
    hyperthreading: true,
    ramPerHostGB: 768,
    rawStoragePerHostTB: 19.2
  };

  it('calculates exact physical cores without false thread inflation', () => {
    const cap = calculateClusterCapacity(standardNode);
    expect(cap.physicalCores).toBe(512); // 8 * 2 * 32
  });

  it('calculates logical threads separately', () => {
    const cap = calculateClusterCapacity(standardNode);
    expect(cap.logicalProcessors).toBe(1024); // 512 * 2
  });

  it('calculates gross installed RAM', () => {
    const cap = calculateClusterCapacity(standardNode);
    expect(cap.totalRamGB).toBe(6144); // 8 * 768
  });

  it('deducts baseline hypervisor RAM overhead (8%) when Aria is excluded', () => {
    const cap = calculateClusterCapacity(standardNode, {
      ...DEFAULT_ENGINEERING_ASSUMPTIONS,
      ariaOperationsIncluded: false,
      ariaAutomationIncluded: false
    });
    const expectedUsable = 6144 * (1 - 0.08);
    expect(cap.usableRamGB).toBeCloseTo(expectedUsable, 1);
  });

  it('reserves additional RAM and CPU when Aria Operations and Automation are included', () => {
    const capWithAria = calculateClusterCapacity(standardNode, {
      ...DEFAULT_ENGINEERING_ASSUMPTIONS,
      ariaOperationsIncluded: true,
      ariaAutomationIncluded: true
    });
    const capWithoutAria = calculateClusterCapacity(standardNode, {
      ...DEFAULT_ENGINEERING_ASSUMPTIONS,
      ariaOperationsIncluded: false,
      ariaAutomationIncluded: false
    });
    // With Aria (+6% RAM overhead), usable RAM should be lower
    expect(capWithAria.usableRamGB).toBeLessThan(capWithoutAria.usableRamGB);
    expect(capWithAria.maxRecommendedWorkloadVcpu).toBeLessThan(capWithoutAria.maxRecommendedWorkloadVcpu);
  });

  it('deducts dedicated Nutanix CVM compute and memory before workload allocation', () => {
    const nutanixNode: ClusterNodeClass = {
      id: 'cluster-nutanix-1',
      name: 'Nutanix AHV Cluster',
      hostCount: 4,
      sockets: 2,
      coresPerSocket: 24, // 48 cores per host
      hyperthreading: true,
      ramPerHostGB: 768,
      rawStoragePerHostTB: 15.3
    };

    const cap = calculateClusterCapacity(nutanixNode, {
      ...DEFAULT_ENGINEERING_ASSUMPTIONS,
      isNutanixPlatform: true,
      nutanixCvmVcpuPerHost: 12,
      nutanixCvmRamPerHostGB: 32
    });

    // 4 hosts * 32 GB CVM = 128 GB CVM overhead
    expect(cap.cvmOverheadRamGB).toBe(128);
    // 4 hosts * 12 vCPU CVM = 48 vCPU CVM overhead
    expect(cap.cvmOverheadVcpus).toBe(48);
    expect(cap.usableRamGB).toBeLessThan(4 * 768);
  });

  it('aggregates heterogeneous multi-cluster sizing independently', () => {
    const denseCompute: ClusterNodeClass = {
      id: 'cluster-c',
      name: 'Compute',
      hostCount: 4,
      sockets: 2,
      coresPerSocket: 48,
      hyperthreading: true,
      ramPerHostGB: 1024,
      rawStoragePerHostTB: 7.68
    };
    const storageDense: ClusterNodeClass = {
      id: 'cluster-s',
      name: 'Storage',
      hostCount: 6,
      sockets: 2,
      coresPerSocket: 24,
      hyperthreading: true,
      ramPerHostGB: 512,
      rawStoragePerHostTB: 30.0
    };

    const total = calculateTotalInfrastructureCapacity([denseCompute, storageDense]);
    expect(total.totalHosts).toBe(10);
    // 4*2*48 + 6*2*24 = 384 + 288 = 672
    expect(total.totalPhysicalCores).toBe(672);
    // 4*1024 + 6*512 = 4096 + 3072 = 7168
    expect(total.totalRamGB).toBe(7168);
  });

  it('evaluates N+1 failure scenarios and computes surviving capacity accurately', () => {
    const cluster: ClusterNodeClass = {
      id: 'c1',
      name: 'Primary Production',
      hostCount: 6,
      sockets: 2,
      coresPerSocket: 32,
      hyperthreading: true,
      ramPerHostGB: 512,
      rawStoragePerHostTB: 20
    };

    const failureResult = evaluateFailureScenario([cluster], {
      name: '1-Host Loss',
      failedHostsPerCluster: { c1: 1 }
    });

    expect(failureResult.totalSurvivingHosts).toBe(5);
    expect(failureResult.clusterHeadrooms[0].survivingHosts).toBe(5);
    expect(failureResult.isAllViable).toBe(true);
  });
});

describe('Storage Sizing & Parity Calculations', () => {
  it('correctly calculates RAID-1 usable storage (50% efficiency)', () => {
    const result = calculateUsableStorage(100, 'raid1_ftt1', 0.20, 1.0);
    // 100 * (1 - 0.20) / 2.0 = 40 TB usable
    expect(result.usableCapacityTB).toBe(40);
  });

  it('correctly calculates RAID-5 usable storage (~75% efficiency)', () => {
    const result = calculateUsableStorage(100, 'raid5_ftt1', 0.20, 1.0);
    // 100 * (1 - 0.20) / 1.33333333 = 60 TB usable
    expect(Math.round(result.usableCapacityTB)).toBe(60);
  });

  it('correctly calculates RAID-6 usable storage (~66.7% efficiency)', () => {
    const result = calculateUsableStorage(100, 'raid6_ftt2', 0.20, 1.0);
    // 100 * (1 - 0.20) / 1.50 = 53.33 TB usable
    expect(result.usableCapacityTB).toBeCloseTo(53.33, 1);
  });

  it('converts decimal TB to binary TiB accurately', () => {
    const binaryTib = convertStorageUnit(100, 'TB', 'TiB');
    // 100 TB = 100 * 10^12 / 2^40 = 90.949 TiB
    expect(binaryTib).toBeCloseTo(90.95, 2);
  });
});

describe('CIDR & Subnet Validation Engine', () => {
  it('converts IPv4 strings to 32-bit integers and back', () => {
    const intVal = ipToInteger('192.168.1.1');
    expect(integerToIp(intVal)).toBe('192.168.1.1');
  });

  it('deducts cloud-specific reserved IP counts correctly', () => {
    expect(getReservedAddressCount('azure')).toBe(5);
    expect(getReservedAddressCount('aws')).toBe(5);
    expect(getReservedAddressCount('gcp')).toBe(4);
    expect(getReservedAddressCount('on-prem')).toBe(2);
  });

  it('parses valid /22 CIDR and calculates usable addresses', () => {
    const parsed = parseAndValidateCidr('10.240.0.0/22', 'azure');
    expect(parsed.isValid).toBe(true);
    expect(parsed.totalAddresses).toBe(1024);
    expect(parsed.usableAddresses).toBe(1019); // 1024 - 5
  });

  it('detects subnet collisions and overlaps', () => {
    const overlap = checkSubnetOverlap('10.0.0.0/16', '10.0.1.0/24');
    expect(overlap.hasOverlap).toBe(true);

    const nonOverlap = checkSubnetOverlap('10.0.0.0/24', '10.0.1.0/24');
    expect(nonOverlap.hasOverlap).toBe(false);
  });

  it('enforces platform-specific SDDC CIDR constraints', () => {
    // AVS requires exact /22
    expect(validateSddcPlatformCidr('10.240.0.0/22', 'AVS', 3).isValid).toBe(true);
    expect(validateSddcPlatformCidr('10.240.0.0/24', 'AVS', 3).isValid).toBe(false);

    // GCVE requires at least /22 for small clusters
    expect(validateSddcPlatformCidr('10.100.0.0/22', 'GCVE', 4).isValid).toBe(true);
  });
});

describe('Cloud Platform Compatibility & Nutanix NC2 Integration', () => {
  it('includes Nutanix NC2 on Azure bare-metal SKUs', () => {
    const nc2Skus = TARGET_NODE_SKU_CATALOGUE.filter((s) => s.platform === 'nc2-azure');
    expect(nc2Skus.length).toBeGreaterThanOrEqual(2);
    expect(nc2Skus.some((s) => s.sku === 'AN36P')).toBe(true);
    expect(nc2Skus.some((s) => s.sku === 'AN36')).toBe(true);
  });

  it('properly validates decoupled storage attachments per platform', () => {
    const anf = STORAGE_ATTACHMENT_CATALOGUE.find((s) => s.id === 'azure-anf');
    expect(anf?.supportedTargetPlatforms.includes('avs-gen2')).toBe(true);
    expect(anf?.supportedTargetPlatforms.includes('vmc-aws')).toBe(false);

    const fsx = STORAGE_ATTACHMENT_CATALOGUE.find((s) => s.id === 'aws-fsx-ontap');
    expect(fsx?.supportedTargetPlatforms.includes('vmc-aws')).toBe(true);
    expect(fsx?.supportedTargetPlatforms.includes('avs-gen2')).toBe(false);
  });

  it('properly validates DR engine support per hypervisor source and target', () => {
    const srm = DR_ENGINE_CATALOGUE.find((d) => d.id === 'vmware-srm');
    expect(srm?.supportedSources.includes('vmware')).toBe(true);
    expect(srm?.supportedSources.includes('nutanix')).toBe(false);

    const nutanixDr = DR_ENGINE_CATALOGUE.find((d) => d.id === 'nutanix-protection-domains');
    expect(nutanixDr?.supportedSources.includes('nutanix')).toBe(true);
    expect(nutanixDr?.supportedTargets.includes('nc2-azure')).toBe(true);
  });
});
