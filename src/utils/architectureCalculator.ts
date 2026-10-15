/**
 * Architecture & Capacity Calculation Engine
 * Pure, deterministic TypeScript utilities for enterprise cloud infrastructure sizing.
 * Distinguishes physical cores from logical threads, implements heterogeneous cluster sizing,
 * multi-domain failure scenario analysis, explicit storage efficiency, and replication bandwidth.
 */

export interface ClusterNodeClass {
  id: string;
  name: string;
  hostCount: number;
  sockets: number;
  coresPerSocket: number;
  hyperthreading: boolean;
  ramPerHostGB: number;
  rawStoragePerHostTB: number;
}

export interface EngineeringAssumptions {
  /** Target maximum vCPU to physical core ratio (e.g. 2.5 for general, 1.5 for mission-critical DB) */
  maxOversubscriptionRatio: number;
  /** Percentage of RAM reserved for hypervisor, agents, and system daemons (e.g. 0.08 for 8%) */
  hypervisorRamOverheadPct: number;
  /** Percentage of CPU capacity reserved for hypervisor/ESXi/system daemons (e.g. 0.10 for 10%) */
  hypervisorCpuReservationPct: number;
  /** Storage protection factor: RAID-1 / Nutanix RF2 = 2.0, RAID-5 = 1.33, RAID-6 / Nutanix RF3 = 1.50 to 3.0 */
  storageProtectionFactor: number;
  /** Slack space reserved to prevent storage lockup during rebuilds/snapshots (e.g. 0.20 for 20%) */
  storageSlackSpacePct: number;
  /** Deduplication & compression efficiency factor (default 1.0 = unassumed; >1.0 only with proven workload data) */
  storageEfficiencyRatio: number;
  /** Whether VMware Aria Operations analytics management plane is included in host capacity reservation */
  ariaOperationsIncluded?: boolean;
  /** Whether VMware Aria Automation orchestration & catalog pods are included in host capacity reservation */
  ariaAutomationIncluded?: boolean;
  /** Whether cluster runs Nutanix AHV / AOS (accounting for dedicated Controller VM reservations) */
  isNutanixPlatform?: boolean;
  /** Dedicated vCPUs reserved per node for Nutanix Controller VM (CVM, typically 12 vCPUs) */
  nutanixCvmVcpuPerHost?: number;
  /** Dedicated RAM (GB) reserved per node for Nutanix Controller VM (CVM, typically 32-64 GB) */
  nutanixCvmRamPerHostGB?: number;
}

export const DEFAULT_ENGINEERING_ASSUMPTIONS: EngineeringAssumptions = {
  maxOversubscriptionRatio: 2.5,
  hypervisorRamOverheadPct: 0.08,
  hypervisorCpuReservationPct: 0.10,
  storageProtectionFactor: 1.33, // RAID-5 default
  storageSlackSpacePct: 0.20,
  storageEfficiencyRatio: 1.0, // Unassumed baseline
  ariaOperationsIncluded: true,
  ariaAutomationIncluded: true,
  isNutanixPlatform: false,
  nutanixCvmVcpuPerHost: 12,
  nutanixCvmRamPerHostGB: 32
};

export interface PlatformConstraintValidation {
  isCompliant: boolean;
  warnings: string[];
  errors: string[];
}

export interface DrSlaValidationResult {
  isSupported: boolean;
  warnings: string[];
  requiresSynchronousLink: boolean;
  latencyConstraintMs?: number;
  minimumSafeBandwidthMbps: number;
}

export interface ClusterCapacityResult {
  clusterId: string;
  clusterName: string;
  hostCount: number;
  physicalCores: number;
  logicalProcessors: number;
  totalRamGB: number;
  usableRamGB: number;
  rawStorageTB: number;
  usableStorageTB: number;
  maxRecommendedWorkloadVcpu: number;
  cvmOverheadVcpus?: number;
  cvmOverheadRamGB?: number;
}

export interface TotalCapacityResult {
  totalHosts: number;
  totalPhysicalCores: number;
  totalLogicalProcessors: number;
  totalRamGB: number;
  totalUsableRamGB: number;
  totalRawStorageTB: number;
  totalUsableStorageTB: number;
  maxRecommendedWorkloadVcpu: number;
  clusterBreakdowns: ClusterCapacityResult[];
}

export interface FailureScenarioConfig {
  name: string;
  /** Map of clusterId to count of failed hosts in that failure domain */
  failedHostsPerCluster: Record<string, number>;
}

export interface SurvivingCapacityHeadroom {
  clusterId: string;
  clusterName: string;
  survivingHosts: number;
  survivingPhysicalCores: number;
  survivingUsableRamGB: number;
  survivingUsableStorageTB: number;
  workloadVcpuCapacity: number;
  isViable: boolean;
  shortfallReasons: string[];
}

export interface FailureScenarioResult {
  scenarioName: string;
  totalSurvivingHosts: number;
  totalSurvivingCores: number;
  totalSurvivingUsableRamGB: number;
  totalSurvivingUsableStorageTB: number;
  isAllViable: boolean;
  clusterHeadrooms: SurvivingCapacityHeadroom[];
}

/**
 * Computes deterministic cluster capacity metrics for a single host class / cluster.
 */
export function calculateClusterCapacity(
  cluster: ClusterNodeClass,
  assumptions: EngineeringAssumptions = DEFAULT_ENGINEERING_ASSUMPTIONS
): ClusterCapacityResult {
  if (cluster.hostCount <= 0) {
    return {
      clusterId: cluster.id,
      clusterName: cluster.name,
      hostCount: 0,
      physicalCores: 0,
      logicalProcessors: 0,
      totalRamGB: 0,
      usableRamGB: 0,
      rawStorageTB: 0,
      usableStorageTB: 0,
      maxRecommendedWorkloadVcpu: 0
    };
  }

  const physicalCores = cluster.hostCount * cluster.sockets * cluster.coresPerSocket;
  const logicalProcessors = cluster.hyperthreading ? physicalCores * 2 : physicalCores;
  const totalRamGB = cluster.hostCount * cluster.ramPerHostGB;

  // Overhead calculation based on platform architecture
  let cvmOverheadVcpus = 0;
  let cvmOverheadRamGB = 0;
  let usableRamGB = 0;
  let maxRecommendedWorkloadVcpu = 0;

  if (assumptions.isNutanixPlatform) {
    // Dedicated Nutanix Controller VM (CVM) reservation per bare-metal node
    const cvmRamPerHost = assumptions.nutanixCvmRamPerHostGB ?? 32;
    const cvmVcpuPerHost = assumptions.nutanixCvmVcpuPerHost ?? 12;
    cvmOverheadRamGB = cluster.hostCount * cvmRamPerHost;
    cvmOverheadVcpus = cluster.hostCount * cvmVcpuPerHost;

    // Remaining RAM available for customer guest workloads
    const ramAfterCvm = Math.max(0, totalRamGB - cvmOverheadRamGB);
    usableRamGB = Math.max(0, ramAfterCvm * (1 - assumptions.hypervisorRamOverheadPct));

    // Remaining compute available for customer guest workloads
    const effectivePhysicalCores = physicalCores * (1 - assumptions.hypervisorCpuReservationPct);
    const rawWorkloadVcpu = Math.floor(effectivePhysicalCores * assumptions.maxOversubscriptionRatio);
    maxRecommendedWorkloadVcpu = Math.max(0, rawWorkloadVcpu - cvmOverheadVcpus);
  } else {
    // Standard VMware vSphere hypervisor & Aria management stack calculation
    const ariaRamAdd = (assumptions.ariaOperationsIncluded ? 0.03 : 0) + (assumptions.ariaAutomationIncluded ? 0.03 : 0);
    const effectiveRamOverhead = Math.min(0.40, assumptions.hypervisorRamOverheadPct + ariaRamAdd);
    usableRamGB = Math.max(0, totalRamGB * (1 - effectiveRamOverhead));

    const ariaCpuAdd = (assumptions.ariaOperationsIncluded ? 0.02 : 0) + (assumptions.ariaAutomationIncluded ? 0.02 : 0);
    const effectiveCpuReservation = Math.min(0.40, assumptions.hypervisorCpuReservationPct + ariaCpuAdd);
    const effectivePhysicalCores = physicalCores * (1 - effectiveCpuReservation);
    maxRecommendedWorkloadVcpu = Math.floor(effectivePhysicalCores * assumptions.maxOversubscriptionRatio);
  }

  const rawStorageTB = cluster.hostCount * cluster.rawStoragePerHostTB;

  // Usable storage calculation: Raw * (1 - slack) * efficiency / protectionFactor
  const usableStorageTB = Math.max(
    0,
    (rawStorageTB * (1 - assumptions.storageSlackSpacePct) * assumptions.storageEfficiencyRatio) /
      assumptions.storageProtectionFactor
  );

  return {
    clusterId: cluster.id,
    clusterName: cluster.name,
    hostCount: cluster.hostCount,
    physicalCores,
    logicalProcessors,
    totalRamGB,
    usableRamGB: Number(usableRamGB.toFixed(1)),
    rawStorageTB,
    usableStorageTB: Number(usableStorageTB.toFixed(1)),
    maxRecommendedWorkloadVcpu,
    cvmOverheadVcpus: assumptions.isNutanixPlatform ? cvmOverheadVcpus : undefined,
    cvmOverheadRamGB: assumptions.isNutanixPlatform ? cvmOverheadRamGB : undefined
  };
}

/**
 * Calculates aggregate capacity across multiple heterogeneous or homogeneous clusters.
 */
export function calculateTotalInfrastructureCapacity(
  clusters: ClusterNodeClass[],
  assumptions: EngineeringAssumptions = DEFAULT_ENGINEERING_ASSUMPTIONS
): TotalCapacityResult {
  const clusterBreakdowns = clusters.map(c => calculateClusterCapacity(c, assumptions));

  return {
    totalHosts: clusterBreakdowns.reduce((acc, c) => acc + c.hostCount, 0),
    totalPhysicalCores: clusterBreakdowns.reduce((acc, c) => acc + c.physicalCores, 0),
    totalLogicalProcessors: clusterBreakdowns.reduce((acc, c) => acc + c.logicalProcessors, 0),
    totalRamGB: clusterBreakdowns.reduce((acc, c) => acc + c.totalRamGB, 0),
    totalUsableRamGB: Number(
      clusterBreakdowns.reduce((acc, c) => acc + c.usableRamGB, 0).toFixed(1)
    ),
    totalRawStorageTB: clusterBreakdowns.reduce((acc, c) => acc + c.rawStorageTB, 0),
    totalUsableStorageTB: Number(
      clusterBreakdowns.reduce((acc, c) => acc + c.usableStorageTB, 0).toFixed(1)
    ),
    maxRecommendedWorkloadVcpu: clusterBreakdowns.reduce(
      (acc, c) => acc + c.maxRecommendedWorkloadVcpu,
      0
    ),
    clusterBreakdowns
  };
}

/**
 * Validates surviving capacity during an explicit failure scenario (e.g. N+1 host failure, rack failure).
 */
export function evaluateFailureScenario(
  clusters: ClusterNodeClass[],
  scenario: FailureScenarioConfig,
  workloadDemandPerCluster: Record<string, { vcpu: number; ramGB: number; storageTB: number }>,
  assumptions: EngineeringAssumptions = DEFAULT_ENGINEERING_ASSUMPTIONS
): FailureScenarioResult {
  const clusterHeadrooms: SurvivingCapacityHeadroom[] = [];

  for (const cluster of clusters) {
    const failedCount = scenario.failedHostsPerCluster[cluster.id] ?? 0;
    const survivingHosts = Math.max(0, cluster.hostCount - failedCount);

    const survivingCluster: ClusterNodeClass = {
      ...cluster,
      hostCount: survivingHosts
    };

    const capacity = calculateClusterCapacity(survivingCluster, assumptions);
    const demand = workloadDemandPerCluster[cluster.id] ?? { vcpu: 0, ramGB: 0, storageTB: 0 };

    const shortfalls: string[] = [];
    if (demand.vcpu > capacity.maxRecommendedWorkloadVcpu) {
      shortfalls.push(
        `vCPU deficit: Required ${demand.vcpu} vCPUs exceeds surviving capacity of ${capacity.maxRecommendedWorkloadVcpu} vCPUs (ratio ${assumptions.maxOversubscriptionRatio}:1)`
      );
    }
    if (demand.ramGB > capacity.usableRamGB) {
      shortfalls.push(
        `RAM deficit: Required ${demand.ramGB} GB RAM exceeds surviving usable RAM of ${capacity.usableRamGB} GB`
      );
    }
    if (demand.storageTB > capacity.usableStorageTB) {
      shortfalls.push(
        `Storage deficit: Required ${demand.storageTB} TB exceeds surviving usable storage of ${capacity.usableStorageTB} TB`
      );
    }

    clusterHeadrooms.push({
      clusterId: cluster.id,
      clusterName: cluster.name,
      survivingHosts,
      survivingPhysicalCores: capacity.physicalCores,
      survivingUsableRamGB: capacity.usableRamGB,
      survivingUsableStorageTB: capacity.usableStorageTB,
      workloadVcpuCapacity: capacity.maxRecommendedWorkloadVcpu,
      isViable: shortfalls.length === 0,
      shortfallReasons: shortfalls
    });
  }

  const isAllViable = clusterHeadrooms.every(c => c.isViable);
  const totalSurvivingHosts = clusterHeadrooms.reduce((acc, c) => acc + c.survivingHosts, 0);
  const totalSurvivingCores = clusterHeadrooms.reduce((acc, c) => acc + c.survivingPhysicalCores, 0);
  const totalSurvivingUsableRamGB = Number(
    clusterHeadrooms.reduce((acc, c) => acc + c.survivingUsableRamGB, 0).toFixed(1)
  );
  const totalSurvivingUsableStorageTB = Number(
    clusterHeadrooms.reduce((acc, c) => acc + c.survivingUsableStorageTB, 0).toFixed(1)
  );

  return {
    scenarioName: scenario.name,
    totalSurvivingHosts,
    totalSurvivingCores,
    totalSurvivingUsableRamGB,
    totalSurvivingUsableStorageTB,
    isAllViable,
    clusterHeadrooms
  };
}

/**
 * Calculates compound demand forecast: Future = Current * (1 + annualGrowthRate)^years
 */
export function calculateCompoundWorkloadGrowth(
  currentDemand: number,
  annualGrowthRatePct: number,
  planningHorizonYears: number
): number {
  if (currentDemand <= 0) return 0;
  if (planningHorizonYears <= 0) return currentDemand;
  const rate = Math.max(0, annualGrowthRatePct / 100);
  const future = currentDemand * Math.pow(1 + rate, planningHorizonYears);
  return Math.round(future * 10) / 10;
}

/**
 * Continuous replication bandwidth estimate in Mbps.
 * Throughput (Mbps) = (changedDataGB * 8 * 1024) / (intervalMinutes * 60)
 */
export function calculateReplicationBandwidthMbps(
  changedDataGB: number,
  intervalMinutes: number,
  networkOverheadMultiplier: number = 1.25
): number {
  if (changedDataGB <= 0 || intervalMinutes <= 0) return 0;
  const totalBits = changedDataGB * 8 * 1024; // Megabits
  const totalSeconds = intervalMinutes * 60;
  const rawThroughputMbps = totalBits / totalSeconds;
  return Math.round(rawThroughputMbps * networkOverheadMultiplier * 10) / 10;
}

/**
 * Storage unit converter between decimal TB (10^12 bytes) and binary TiB (2^40 bytes)
 */
export function convertStorageUnits(
  value: number,
  from: 'TB' | 'TiB',
  to: 'TB' | 'TiB'
): number {
  if (value <= 0) return 0;
  if (from === to) return value;
  const BYTES_PER_TB = 1_000_000_000_000;
  const BYTES_PER_TIB = 1_099_511_627_776;

  if (from === 'TB' && to === 'TiB') {
    return Number(((value * BYTES_PER_TB) / BYTES_PER_TIB).toFixed(2));
  } else {
    return Number(((value * BYTES_PER_TIB) / BYTES_PER_TB).toFixed(2));
  }
}

/**
 * Validates hardware platform constraints, minimum/maximum nodes, and operational margins.
 */
export function validateClusterConstraints(params: {
  platform: 'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure' | string;
  nodeCount: number;
  replicationFactor?: 'RF2' | 'RF3';
  storageSlackPct?: number;
  oversubscriptionRatio?: number;
}): PlatformConstraintValidation {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Minimum and Maximum node limits per platform verified against vendor documentation
  if (params.platform === 'avs-gen1' || params.platform === 'avs-gen2') {
    if (params.nodeCount < 3) {
      errors.push('Azure VMware Solution (AVS) requires a minimum of 3 nodes per cluster for Microsoft production SLA.');
    }
    if (params.nodeCount > 16) {
      warnings.push('AVS standard cluster limit is 16 nodes per cluster (up to 96 nodes across multiple clusters in private cloud).');
    }
  } else if (params.platform === 'vmc-aws') {
    if (params.nodeCount < 2) {
      errors.push('VMware Cloud on AWS requires minimum 2 nodes for production cluster SLA with i4i.metal.');
    }
    if (params.nodeCount > 16) {
      warnings.push('VMC on AWS cluster limit is 16 hosts per cluster.');
    }
  } else if (params.platform === 'gcve') {
    if (params.nodeCount < 3) {
      errors.push('Google Cloud VMware Engine requires minimum 3 nodes per cluster for standard production SLA.');
    }
    if (params.nodeCount > 32) {
      warnings.push('GCVE cluster limit is 32 nodes per cluster.');
    }
  } else if (params.platform === 'nc2-azure') {
    const isRf3 = params.replicationFactor === 'RF3';
    const minNodes = isRf3 ? 5 : 3;
    if (params.nodeCount < minNodes) {
      errors.push(
        `Nutanix NC2 on Azure with ${isRf3 ? 'RF3 (3-copy mirror)' : 'RF2 (2-copy mirror)'} requires minimum ${minNodes} physical bare-metal nodes.`
      );
    }
    if (params.nodeCount > 28) {
      warnings.push('Nutanix NC2 on Azure supports up to 28 bare-metal nodes per cluster in a single Azure availability zone.');
    }
  }

  // Sizing & operational headroom checks
  if (params.storageSlackPct !== undefined && params.storageSlackPct < 0.20) {
    warnings.push('Storage slack space is below the recommended 20-25% threshold. vSAN / DSF rebuilds and snapshot storms risk cluster storage lockup.');
  }
  if (params.oversubscriptionRatio !== undefined && params.oversubscriptionRatio > 3.0) {
    warnings.push('vCPU:pCore oversubscription exceeds 3:1. High CPU contention may cause latency spikes on mission-critical database workloads.');
  }

  return {
    isCompliant: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Validates user-requested RTO and RPO against certified platform capabilities and network limits.
 * Distinguishes user-entered targets from vendor-supported architectural realities.
 */
export function validateDisasterRecoverySla(params: {
  platform: string;
  engine: string;
  requestedRpoMinutes: number;
  requestedRtoMinutes: number;
  dailyChurnGB: number;
  availableWanMbps: number;
  estimatedLatencyRttMs?: number;
}): DrSlaValidationResult {
  const warnings: string[] = [];
  let isSupported = true;
  let requiresSynchronousLink = false;
  let latencyConstraintMs: number | undefined = undefined;

  // 1. Synchronous RPO (0 minutes)
  if (params.requestedRpoMinutes === 0) {
    requiresSynchronousLink = true;
    latencyConstraintMs = 5;
    const isSyncEngine = params.engine.includes('Metro') || params.engine.includes('Stretched');
    if (!isSyncEngine) {
      isSupported = false;
      warnings.push(
        `Engine "${params.engine}" does not support 0-minute synchronous RPO. Synchronous zero-loss replication requires Nutanix Metro Availability or VMware Stretched Cluster.`
      );
    }
    if (params.estimatedLatencyRttMs && params.estimatedLatencyRttMs > 5) {
      warnings.push(
        `Estimated round-trip latency (${params.estimatedLatencyRttMs} ms) exceeds the 5 ms RTT threshold required for synchronous zero-RPO storage commits. System will degrade to asynchronous replication.`
      );
    }
  }

  // 2. Sub-5-minute RPO checks
  if (params.requestedRpoMinutes > 0 && params.requestedRpoMinutes < 5) {
    if (params.engine.includes('SRM') || params.engine.includes('vSphere Replication')) {
      warnings.push(
        'VMware vSphere Replication natively supports a minimum RPO of 5 minutes. Sub-5-minute RPO requires Continuous Data Protection (Zerto) or Storage Array-based replication (SRA).'
      );
    }
  }

  // 3. Backup snapshot engines (e.g. Veeam)
  if (params.engine.includes('Veeam') && params.requestedRpoMinutes < 15) {
    warnings.push(
      'Snapshot-based backup replication (Veeam) typically operates at 15-60+ minute RPO due to VM snapshot creation, storage quiescing, and snapshot consolidation overhead.'
    );
  }

  // 4. Bandwidth calculation vs available WAN
  const effectiveIntervalMin = Math.max(1, params.requestedRpoMinutes);
  const minimumSafeBandwidthMbps = calculateReplicationBandwidthMbps(params.dailyChurnGB, effectiveIntervalMin * 6, 1.25);
  if (params.availableWanMbps > 0 && minimumSafeBandwidthMbps > params.availableWanMbps) {
    warnings.push(
      `Required continuous replication bandwidth (~${minimumSafeBandwidthMbps.toFixed(0)} Mbps) exceeds available WAN link (${params.availableWanMbps} Mbps). RPO SLA cannot be guaranteed under continuous write load.`
    );
  }

  return {
    isSupported,
    warnings,
    requiresSynchronousLink,
    latencyConstraintMs,
    minimumSafeBandwidthMbps
  };
}
