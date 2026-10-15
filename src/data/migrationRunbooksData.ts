/**
 * Official Vendor Migration Runbooks & 9-Stage Lifecycle Guidance
 * Verified against official documentation from Microsoft, Broadcom/VMware, Google Cloud, and Nutanix.
 * 
 * Strict Vendor Fact vs. Zaboraa Recommendation Separation:
 * - Vendor facts are cited with official documentation URLs and verified constraints.
 * - Architectural recommendations, wave sequencing, and operational best practices are explicitly attributed.
 */

export interface RunbookCitation {
  vendor: 'Microsoft' | 'VMware / Broadcom' | 'Google Cloud' | 'Nutanix';
  documentTitle: string;
  sourceUrl: string;
  applicableVersions: string;
  verificationDate: string;
  verificationStatus: 'verified' | 'requires-verification';
}

export type MigrationLifecycleStage =
  | 'stage-1-discovery'
  | 'stage-2-prerequisites'
  | 'stage-3-network-prep'
  | 'stage-4-pilot-migration'
  | 'stage-5-workload-evacuation'
  | 'stage-6-cutover'
  | 'stage-7-validation'
  | 'stage-8-rollback-recovery'
  | 'stage-9-post-migration-closure';

export interface RunbookStep {
  stepNumber: number;
  title: string;
  lifecycleStage: MigrationLifecycleStage;
  stageName: string;
  actor: 'Cloud Migration Architect' | 'Network Engineer' | 'VMware Administrator' | 'Security Ops' | 'Database Administrator';
  description: string;
  commandOrAction?: {
    type: 'PowerCLI' | 'Bash/CLI' | 'REST-API' | 'Portal-UI' | 'NCLI';
    code: string;
    explanation: string;
  };
  prerequisites: string[];
  validationCheck: string;
  rollbackConsideration: string;
  isVendorDocumentedFact: boolean;
  citationRef: string;
  caveatsAndLimitations?: string[];
}

export interface PlatformMigrationRunbook {
  id: string;
  platformId: 'avs-gen1' | 'avs-gen2' | 'vmc-aws' | 'gcve' | 'nc2-azure';
  platformName: string;
  hyperscaler: 'azure' | 'aws' | 'gcp';
  migrationTooling: string;
  primaryProtocol: string;
  applicableScenario: string;
  targetArchitectureSummary: string;
  citations: RunbookCitation[];
  steps: RunbookStep[];
  platformSpecificConstraints: {
    minimumClusterNodes: number;
    maximumClusterNodes: number;
    supportedMtu: string;
    unsupportedWorkloads: string[];
    bandwidthRequirements: string;
    latencyThresholds: string;
  };
}

export const OFFICIAL_RUNBOOK_CITATIONS: Record<string, RunbookCitation> = {
  avsNetworking: {
    vendor: 'Microsoft',
    documentTitle: 'Azure VMware Solution Networking Prerequisites and Planning Checklist',
    sourceUrl: 'https://learn.microsoft.com/en-us/azure/azure-vmware/tutorial-network-checklist',
    applicableVersions: 'AVS Private Clouds GA, ExpressRoute FastPath, UltraPerformance Gateway',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  avsHcx: {
    vendor: 'Microsoft',
    documentTitle: 'Deploy and Configure VMware HCX for Azure VMware Solution',
    sourceUrl: 'https://learn.microsoft.com/en-us/azure/azure-vmware/tutorial-configure-vmware-hcx',
    applicableVersions: 'VMware HCX 4.8+, AVS Private Clouds',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  avsAv64: {
    vendor: 'Microsoft',
    documentTitle: 'Azure VMware Solution Generation 2 (AV64) Node Architecture & Direct vNet',
    sourceUrl: 'https://learn.microsoft.com/en-us/azure/azure-vmware/architecture-av64',
    applicableVersions: 'AVS AV64, Direct vNet Routing',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  vmcGettingStarted: {
    vendor: 'VMware / Broadcom',
    documentTitle: 'VMware Cloud on AWS Architecture and SDDC Deployment Guide',
    sourceUrl: 'https://docs.vmware.com/en/VMware-Cloud-on-AWS/services/com.vmware.vmc-aws.getting-started/',
    applicableVersions: 'VMC SDDC 1.24+, i4i.metal, Connected VPC ENI',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  vmcHcx: {
    vendor: 'VMware / Broadcom',
    documentTitle: 'VMware HCX User Guide: Cloud-to-Cloud & On-Premises to Cloud Migration',
    sourceUrl: 'https://docs.vmware.com/en/VMware-HCX/',
    applicableVersions: 'HCX 4.8 / 4.9 Enterprise, RAV, Bulk, MON',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  gcveQuickstart: {
    vendor: 'Google Cloud',
    documentTitle: 'Google Cloud VMware Engine Networking Prerequisites and Private Cloud Setup',
    sourceUrl: 'https://cloud.google.com/vmware-engine/docs/quickstart-networking-prerequisites',
    applicableVersions: 'GCVE ve1-standard-72, ve2-standard-128, Private Services Access',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  gcveHcx: {
    vendor: 'Google Cloud',
    documentTitle: 'Migrating Workloads to Google Cloud VMware Engine Using VMware HCX',
    sourceUrl: 'https://cloud.google.com/vmware-engine/docs/workloads/howto-migrate-vms-using-hcx',
    applicableVersions: 'GCVE HCX Enterprise, Cloud Interconnect, VPC Peering',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  nc2AzureArchitecture: {
    vendor: 'Nutanix',
    documentTitle: 'Nutanix Cloud Clusters (NC2) on Microsoft Azure Deployment Architecture Guide',
    sourceUrl: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Cloud-Clusters-Azure',
    applicableVersions: 'NC2 on Azure, AOS 6.8 LTS, AHV, Prism Central',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  nc2AzureMove: {
    vendor: 'Nutanix',
    documentTitle: 'Nutanix Move User Guide: Cross-Hypervisor VMware to Nutanix AHV Migration',
    sourceUrl: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Move',
    applicableVersions: 'Nutanix Move 5.3+, AHV VirtIO Automated Driver Injection',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  },
  nc2AzureFlow: {
    vendor: 'Nutanix',
    documentTitle: 'Nutanix Flow Virtual Networking and Azure Native VNet Subnet Delegation',
    sourceUrl: 'https://portal.nutanix.com/page/documents/details?targetId=Nutanix-Flow-Virtual-Networking',
    applicableVersions: 'Flow VPCs, Flow Microsegmentation, Azure Network Security Groups',
    verificationDate: '2026-10-14',
    verificationStatus: 'verified'
  }
};

export const PLATFORM_MIGRATION_RUNBOOKS: PlatformMigrationRunbook[] = [
  // ===========================================================================
  // 1. AZURE VMWARE SOLUTION (AVS) RUNBOOK
  // ===========================================================================
  {
    id: 'runbook-avs-hcx',
    platformId: 'avs-gen1',
    platformName: 'Azure VMware Solution (AVS)',
    hyperscaler: 'azure',
    migrationTooling: 'VMware HCX Enterprise (IX + NE + WO) with ExpressRoute FastPath',
    primaryProtocol: 'HCX IPsec (UDP 4500) over ExpressRoute Private Peering',
    applicableScenario: 'Enterprise data center evacuation to Microsoft Azure using AVS bare-metal SDDC nodes',
    targetArchitectureSummary: 'AVS Private Cloud running dedicated ESXi bare-metal hosts (AV36P / AV64) with NSX-T Tier-0 Gateway peered via ExpressRoute FastPath directly into Azure Virtual WAN hub.',
    citations: [
      OFFICIAL_RUNBOOK_CITATIONS.avsNetworking,
      OFFICIAL_RUNBOOK_CITATIONS.avsHcx,
      OFFICIAL_RUNBOOK_CITATIONS.avsAv64
    ],
    platformSpecificConstraints: {
      minimumClusterNodes: 3,
      maximumClusterNodes: 16,
      supportedMtu: '1500 (Underlay) / Up to 9000 (ExpressRoute Jumbo Frames with FastPath)',
      unsupportedWorkloads: [
        'Physical Raw Device Mappings (RDM-P) without conversion to VMDK',
        'Multi-Writer virtual disks without Clustered VMDK / WSFC certification',
        'Workloads requiring direct PCI-passthrough devices (hardware-bound)'
      ],
      bandwidthRequirements: 'Minimum 1 Gbps dedicated ExpressRoute; 10 Gbps+ recommended for parallel wave evacuation',
      latencyThresholds: '< 100 ms RTT for HCX Bulk / Cold migration; < 10 ms RTT recommended for live vMotion; <= 5 ms for stretched clusters'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Workload Discovery & Dependency Mapping',
        lifecycleStage: 'stage-1-discovery',
        stageName: '1. Discovery and Assessment',
        actor: 'Cloud Migration Architect',
        description: 'Execute deep inventory collection using RVTools and VMware Aria Operations for Networks. Classify VMs by tier, CPU/RAM utilization, shared storage, and active TCP communication pairs.',
        commandOrAction: {
          type: 'PowerCLI',
          code: 'Connect-VIServer -Server vcenter.corp.local; Get-VM | Select-Object Name, PowerState, NumCpu, MemoryGB, ProvisionedSpaceGB, UsedSpaceGB | Export-Csv -Path ./avs-discovery-inventory.csv',
          explanation: 'Extracts exact virtual hardware inventory for baseline sizing in Zaboraa calculator.'
        },
        prerequisites: [
          'Read-only or administrator credentials on source vCenter 7.0u3+ or 8.0+',
          'Aria Operations for Networks collector deployed to analyze network egress patterns'
        ],
        validationCheck: 'Verify that 100% of VMs planned for migration are inventoried and no unmapped IP ranges exist.',
        rollbackConsideration: 'Zero impact: Read-only inventory profiling stage.',
        isVendorDocumentedFact: true,
        citationRef: 'avsNetworking',
        caveatsAndLimitations: [
          'Zaboraa recommendation: Flag workloads with > 15% daily churn for custom staging bandwidth allocations.'
        ]
      },
      {
        stepNumber: 2,
        title: 'ExpressRoute Circuit & /22 Management Subnet Readiness',
        lifecycleStage: 'stage-2-prerequisites',
        stageName: '2. Prerequisites and Readiness',
        actor: 'Network Engineer',
        description: 'Provision a non-overlapping /22 CIDR block dedicated exclusively to AVS private cloud management. Establish ExpressRoute circuit and configure Global Reach peering between on-premises and AVS.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'az vmware private-cloud create -g rg-avs-prod -n avs-sddc-01 --cluster-size 3 --sku AV36P --network-block 10.240.0.0/22 --location westeurope',
          explanation: 'Provisions dedicated 3-node AVS SDDC with /22 management block.'
        },
        prerequisites: [
          'Azure Enterprise Agreement (EA) with AVS host quota approved in target region',
          '/22 CIDR block that does not overlap with any on-premises, hub, or spoke VNet CIDR'
        ],
        validationCheck: 'az vmware private-cloud show verifies status is Succeeded and vCenter web console is reachable over ExpressRoute.',
        rollbackConsideration: 'Delete private cloud resource if deployment parameters or CIDR assignment fails validation.',
        isVendorDocumentedFact: true,
        citationRef: 'avsNetworking',
        caveatsAndLimitations: [
          'Vendor constraint: /22 network block cannot be changed after private cloud creation.',
          'Subnets /23, /24, or smaller are unsupported for private cloud management.'
        ]
      },
      {
        stepNumber: 3,
        title: 'HCX Cloud Manager Activation & Service Mesh Interconnect',
        lifecycleStage: 'stage-3-network-prep',
        stageName: '3. Network and Security Preparation',
        actor: 'VMware Administrator',
        description: 'Deploy on-premises HCX Connector OVA. Pair with AVS HCX Cloud Manager. Define Compute Profiles and deploy Service Mesh containing Interconnect (IX) and Network Extension (NE) appliances.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'Navigate to AVS Portal > VMware HCX > Request HCX Keys > Pair On-Premises HCX Connector > Create Service Mesh',
          explanation: 'Initializes secure IPsec replication tunnels across ExpressRoute.'
        },
        prerequisites: [
          'TCP 443 open from on-prem HCX Connector to AVS HCX Cloud Manager',
          'UDP 4500 and UDP 500 open between on-prem IX/NE appliances and AVS IX/NE appliances',
          'Uplink network MTU verified (minimum 1500; 9000 jumbo recommended)'
        ],
        validationCheck: 'HCX Service Mesh health check reports all tunnels Green with status "UP" and 0 packet loss.',
        rollbackConsideration: 'Deprovision Service Mesh in HCX portal; source VMs remain unaffected.',
        isVendorDocumentedFact: true,
        citationRef: 'avsHcx',
        caveatsAndLimitations: [
          'Vendor limitation: Each HCX NE appliance supports up to 8 extended VLAN networks and up to ~4.5 Gbps line-rate throughput without WAN Optimization.'
        ]
      },
      {
        stepNumber: 4,
        title: 'L2 Subnet Extension with Mobility Optimized Networking (MON)',
        lifecycleStage: 'stage-3-network-prep',
        stageName: '3. Network and Security Preparation',
        actor: 'Network Engineer',
        description: 'Extend on-premises production VLANs to AVS NSX overlay segments. Enable Mobility Optimized Networking (MON) to ensure migrated VMs route through AVS Tier-1 locally instead of hairpinning back to on-premises.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'HCX Console > Network Extension > Extend Network > Select On-Prem VLAN > Gateway IP > Enable Mobility Optimized Networking (MON)',
          explanation: 'Extends broadcast domain while enabling local cloud default gateway breakout.'
        },
        prerequisites: [
          'Valid default gateway IP and subnet mask on source VLAN',
          'NSX Tier-1 Gateway deployed in AVS with route advertising enabled'
        ],
        validationCheck: 'Ping default gateway from on-premises; verify extension appliance responds and ARP resolves.',
        rollbackConsideration: 'Unextend network in HCX console; traffic instantly reverts to on-premises gateway.',
        isVendorDocumentedFact: true,
        citationRef: 'avsHcx',
        caveatsAndLimitations: [
          'Vendor requirement: MON requires HCX Enterprise license (included in AVS).',
          'Hairpinning warning: Without MON, all cloud egress trombones across ExpressRoute to on-prem gateway.'
        ]
      },
      {
        stepNumber: 5,
        title: 'Pilot Wave Migration (Wave 0 / Non-Production Canary)',
        lifecycleStage: 'stage-4-pilot-migration',
        stageName: '4. Pilot Migration',
        actor: 'Cloud Migration Architect',
        description: 'Execute pilot migration of 5-10 low-tier non-critical staging VMs. Validate disk seeding, delta sync timing, live cutover execution, and post-migration network connectivity.',
        commandOrAction: {
          type: 'PowerCLI',
          code: 'Start-HCXMigration -Type ReplicationAssistedvMotion -VM (Get-VM "test-canary-01") -TargetCompute (Get-HCXTargetCompute -Name "Cluster-1") -TargetDatastore (Get-HCXTargetDatastore -Name "vsanDatastore")',
          explanation: 'Initiates zero-downtime live replication migration for pilot canary.'
        },
        prerequisites: [
          'Service Mesh active; extended L2 network verified',
          'VMware Tools running and updated on canary VMs'
        ],
        validationCheck: 'Canary VM pings continuously during cutover; total ping drop does not exceed 1 packet (< 2 seconds).',
        rollbackConsideration: 'Reverse vMotion back to on-premises if network latency or application health fails.',
        isVendorDocumentedFact: true,
        citationRef: 'avsHcx'
      },
      {
        stepNumber: 6,
        title: 'Mass Workload Evacuation & Delta Synchronization',
        lifecycleStage: 'stage-5-workload-evacuation',
        stageName: '5. Workload Migration and Evacuation',
        actor: 'VMware Administrator',
        description: 'Initiate bulk migration waves. HCX initial seed copies 100% of VMDK data in background while workloads remain fully operational on-premises. Continuous delta synchronization captures runtime block changes.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'HCX Manager > Migration > Create Migration Group > Add VMs > Transfer Mode: Replication Assisted vMotion (RAV) > Seed Schedule: Immediate',
          explanation: 'Executes parallel CBT replication across configured HCX appliances.'
        },
        prerequisites: [
          'Pilot wave passed acceptance testing',
          'Bandwidth throttles configured if shared with production traffic'
        ],
        validationCheck: 'Monitor HCX dashboard until replication progress reaches 100% and state shows "Ready for Cutover".',
        rollbackConsideration: 'Cancel migration in HCX console; baseline on-premises VMs continue running without interruption.',
        isVendorDocumentedFact: true,
        citationRef: 'avsHcx',
        caveatsAndLimitations: [
          'Vendor constraint: Max 100 concurrent migrations per HCX manager; recommended 8-16 concurrent per IX appliance for optimal WAN throughput.'
        ]
      },
      {
        stepNumber: 7,
        title: 'Scheduled Maintenance Window Cutover',
        lifecycleStage: 'stage-6-cutover',
        stageName: '6. Cutover',
        actor: 'Cloud Migration Architect',
        description: 'Trigger final cutover within authorized maintenance window. HCX pauses source VM, flushes final dirty memory blocks, cuts over execution to AVS host, unbinds source vNIC, and updates ARP tables.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'HCX Migration Group > Actions > Force Cutover > Confirm Maintenance Window',
          explanation: 'Performs final delta sync and transfers execution to AVS.'
        },
        prerequisites: [
          'Stakeholder signoff on cutover window',
          'Database replication quiesced or prepared for final cutover'
        ],
        validationCheck: 'VM running on AVS cluster; verify CPU/memory telemetry, ping responses, and application port health.',
        rollbackConsideration: 'Source VM remains on disk in powered-off state; power back on source VM if target fails.',
        isVendorDocumentedFact: true,
        citationRef: 'avsHcx'
      },
      {
        stepNumber: 8,
        title: 'Post-Migration Functional & Performance Validation',
        lifecycleStage: 'stage-7-validation',
        stageName: '7. Functional and Performance Validation',
        actor: 'Database Administrator',
        description: 'Verify application database query latency, web application transactions, enterprise active directory authentication, and backup agent functionality.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'curl -Iv https://app.corp.local/healthz && pg_isready -h db-avs.corp.local -p 5432',
          explanation: 'Validates end-to-end HTTP response and database socket readiness.'
        },
        prerequisites: ['Cutover complete and VM online in AVS'],
        validationCheck: 'Application latency and error rates within standard operational SLAs (< 15 ms app-to-db).',
        rollbackConsideration: 'Initiate emergency reverse vMotion or failback if performance degradation exceeds threshold.',
        isVendorDocumentedFact: false,
        citationRef: 'avsNetworking',
        caveatsAndLimitations: [
          'Zaboraa recommendation: Execute post-migration load test before de-extending L2 VLAN.'
        ]
      },
      {
        stepNumber: 9,
        title: 'Network Gateway De-extension & Post-Migration Closure',
        lifecycleStage: 'stage-9-post-migration-closure',
        stageName: '9. Post-Migration Optimization and Closure',
        actor: 'Network Engineer',
        description: 'Once all workloads on a VLAN are cutover to AVS, migrate default gateway ownership to NSX Tier-1 in AVS. Unextend HCX L2 network to eliminate cross-WAN broadcast traffic. Decommission on-premises VMs.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'HCX Network Extension > Unextend Network > NSX Manager > Set Segment Gateway IP as authoritative default gateway',
          explanation: 'Permanently establishes AVS as native gateway and severs L2 bridging.'
        },
        prerequisites: [
          '100% of VMs on the extended VLAN verified in AVS',
          'Zero active MAC addresses remaining on on-premises VLAN segment'
        ],
        validationCheck: 'Verify traceroute from AVS VM exits through NSX Tier-0/Tier-1 without WAN traversal.',
        rollbackConsideration: 'Re-enable HCX extension if orphaned on-premises assets are discovered.',
        isVendorDocumentedFact: true,
        citationRef: 'avsHcx'
      }
    ]
  },

  // ===========================================================================
  // 2. VMWARE CLOUD ON AWS (VMC) RUNBOOK
  // ===========================================================================
  {
    id: 'runbook-vmc-aws',
    platformId: 'vmc-aws',
    platformName: 'VMware Cloud on AWS (VMC)',
    hyperscaler: 'aws',
    migrationTooling: 'VMware HCX Enterprise + AWS Direct Connect (DX) + Connected VPC ENI',
    primaryProtocol: 'HCX Multi-Site Interconnect over Direct Connect Private VIF / Transit VIF',
    applicableScenario: 'Enterprise migration of VMware workloads to AWS bare-metal SDDC (i4i.metal) with low-latency native AWS service access',
    targetArchitectureSummary: 'VMware Cloud on AWS SDDC linked via high-speed Cross-VPC Elastic Network Interfaces (ENI) directly into customer Connected VPC for zero-egress data transfer to S3, RDS, and Amazon FSx ONTAP.',
    citations: [
      OFFICIAL_RUNBOOK_CITATIONS.vmcGettingStarted,
      OFFICIAL_RUNBOOK_CITATIONS.vmcHcx
    ],
    platformSpecificConstraints: {
      minimumClusterNodes: 2, // 2-node cluster supported with i4i.metal for production SLA
      maximumClusterNodes: 16,
      supportedMtu: '1500 on WAN / Up to 8900 Jumbo Frames on Direct Connect & Connected VPC ENI',
      unsupportedWorkloads: [
        'Direct PCI passthrough hardware devices',
        'Physical tape libraries without VTL or AWS Storage Gateway replacement'
      ],
      bandwidthRequirements: 'Minimum 1 Gbps Direct Connect; 10 Gbps recommended for large datastores',
      latencyThresholds: '< 100 ms RTT for HCX Bulk; < 10 ms RTT for live vMotion'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'AWS Connected Account Linking & Connected VPC Setup',
        lifecycleStage: 'stage-2-prerequisites',
        stageName: '2. Prerequisites and Readiness',
        actor: 'Cloud Migration Architect',
        description: 'Link AWS Customer Account with VMware Cloud on AWS organisation. Select Connected VPC and dedicated subnet in the target Availability Zone to host cross-account ENIs.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'VMC Console > SDDC Deployment > Link AWS Account > Choose Connected VPC (vpc-012345678) > Select Subnet in AZ1',
          explanation: 'Establishes high-bandwidth (up to 25 Gbps) zero-egress cross-account ENI.'
        },
        prerequisites: [
          'AWS IAM role created with VMwareCloudOnAWS permissions',
          'Dedicated VPC with at least one private subnet in the target AZ'
        ],
        validationCheck: 'VMC console confirms Connected VPC status is "Active" and ENI is attached.',
        rollbackConsideration: 'Unlink AWS account before SDDC provisioning.',
        isVendorDocumentedFact: true,
        citationRef: 'vmcGettingStarted',
        caveatsAndLimitations: [
          'Vendor limitation: The Connected VPC and Availability Zone cannot be changed after SDDC creation.'
        ]
      },
      {
        stepNumber: 2,
        title: 'i4i.metal SDDC Deployment & AWS Direct Connect Peering',
        lifecycleStage: 'stage-2-prerequisites',
        stageName: '2. Prerequisites and Readiness',
        actor: 'Network Engineer',
        description: 'Deploy production SDDC with i4i.metal bare-metal hosts (Intel Ice Lake 8375C, 64 cores, 1024 GB RAM, 30 TB NVMe). Attach SDDC to AWS Transit Gateway (TGW) or Direct Connect Gateway (DXGW).',
        commandOrAction: {
          type: 'REST-API',
          code: 'POST https://vmc.vmware.com/vmc/api/orgs/{orgId}/sddcs with payload: { "name": "vmc-prod-sddc", "num_hosts": 3, "sddc_type": "1NODE_OR_MULTI", "provider": "AWS", "region": "eu-west-1", "storage_capacity": 30 }',
          explanation: 'Provisions dedicated bare-metal VMC SDDC.'
        },
        prerequisites: [
          'SDDC management CIDR (/20 recommended for multi-cluster scale; minimum /23)',
          'Direct Connect Private or Transit VIF active'
        ],
        validationCheck: 'vCenter and NSX Manager consoles accessible via Direct Connect private route.',
        rollbackConsideration: 'Delete SDDC resource through VMC API/console.',
        isVendorDocumentedFact: true,
        citationRef: 'vmcGettingStarted'
      },
      {
        stepNumber: 3,
        title: 'Deploy HCX Cloud Interconnect & L2 Network Extension',
        lifecycleStage: 'stage-3-network-prep',
        stageName: '3. Network and Security Preparation',
        actor: 'VMware Administrator',
        description: 'Activate HCX in VMC console, deploy on-premises HCX Connector, and create Service Mesh. Extend on-premises VLANs to VMC NSX segments with Mobility Optimized Networking (MON).',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'VMC Console > Add-ons > HCX > Deploy > Service Mesh > Extend On-Prem VLANs',
          explanation: 'Bridges on-premises L2 broadcast domains to AWS.'
        },
        prerequisites: ['Direct Connect MTU configured (8900 supported for optimal replication)'],
        validationCheck: 'HCX Service Mesh tunnels operational; L2 extension status shows Connected.',
        rollbackConsideration: 'Unextend network; delete Service Mesh.',
        isVendorDocumentedFact: true,
        citationRef: 'vmcHcx'
      },
      {
        stepNumber: 4,
        title: 'Workload Migration Waves with Replication-Assisted vMotion (RAV)',
        lifecycleStage: 'stage-5-workload-evacuation',
        stageName: '5. Workload Migration and Evacuation',
        actor: 'VMware Administrator',
        description: 'Execute grouped workload migrations. HCX seeds initial VMDK storage to i4i NVMe vSAN datastore while VM is running, then executes zero-downtime vMotion cutover.',
        commandOrAction: {
          type: 'PowerCLI',
          code: 'Start-HCXMigration -Type ReplicationAssistedvMotion -VM (Get-VM -Name "prod-app-*") -TargetCompute (Get-HCXTargetCompute -Name "Cluster-1") -TargetDatastore (Get-HCXTargetDatastore -Name "WorkloadDatastore")',
          explanation: 'Initiates zero-downtime live migration wave.'
        },
        prerequisites: ['Pilot wave verified in VMC environment'],
        validationCheck: 'VMs online in VMC vCenter; ping response continuous; zero application disruption.',
        rollbackConsideration: 'Live vMotion back to on-premises if unexpected latency occurs.',
        isVendorDocumentedFact: true,
        citationRef: 'vmcHcx'
      },
      {
        stepNumber: 5,
        title: 'Native AWS Service Integration & NSX Microsegmentation',
        lifecycleStage: 'stage-7-validation',
        stageName: '7. Functional and Performance Validation',
        actor: 'Security Ops',
        description: 'Validate low-latency traffic over Connected VPC ENI to native Amazon S3 endpoints, RDS PostgreSQL, and configure NSX Distributed Firewall (DFW) zero-trust microsegmentation policies.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'aws s3 ls s3://enterprise-data-lake-prod/ --endpoint-url https://s3.eu-west-1.amazonaws.com',
          explanation: 'Verifies zero-egress ENI path from VMC workload to S3.'
        },
        prerequisites: ['Workloads running in VMC'],
        validationCheck: 'Ping latency from VMC VM to Connected VPC EC2 instance < 1 ms.',
        rollbackConsideration: 'Revert DFW rules in NSX manager if rules block legitimate application traffic.',
        isVendorDocumentedFact: true,
        citationRef: 'vmcGettingStarted'
      }
    ]
  },

  // ===========================================================================
  // 3. GOOGLE CLOUD VMWARE ENGINE (GCVE) RUNBOOK
  // ===========================================================================
  {
    id: 'runbook-gcve',
    platformId: 'gcve',
    platformName: 'Google Cloud VMware Engine (GCVE)',
    hyperscaler: 'gcp',
    migrationTooling: 'VMware HCX Enterprise + Cloud Interconnect + Private Services Access (PSA)',
    primaryProtocol: 'HCX IPsec over Dedicated or Partner Cloud Interconnect with Cloud Router BGP',
    applicableScenario: 'Enterprise migration to Google Cloud bare-metal VMware Engine (ve1/ve2) with native Google BigQuery, Vertex AI, and Cloud Storage connectivity',
    targetArchitectureSummary: 'GCVE Private Cloud deployed with bare-metal ve1 (36 cores, 768 GB RAM) or ve2 (64 cores, 2048 GB RAM) nodes, peered via Private Services Access (PSA) to Google VPC without NAT.',
    citations: [
      OFFICIAL_RUNBOOK_CITATIONS.gcveQuickstart,
      OFFICIAL_RUNBOOK_CITATIONS.gcveHcx
    ],
    platformSpecificConstraints: {
      minimumClusterNodes: 3,
      maximumClusterNodes: 32,
      supportedMtu: '1500 (Standard Cloud Interconnect MTU)',
      unsupportedWorkloads: [
        'Direct hardware dongles or non-virtualized physical storage attachments'
      ],
      bandwidthRequirements: 'Minimum 1 Gbps Cloud Interconnect (10 Gbps Dedicated recommended for rapid migration)',
      latencyThresholds: '< 100 ms RTT for HCX Bulk; < 10 ms RTT for live vMotion'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Allocate /22 or /24 Management CIDR & Private Cloud Creation',
        lifecycleStage: 'stage-2-prerequisites',
        stageName: '2. Prerequisites and Readiness',
        actor: 'Cloud Migration Architect',
        description: 'Allocate dedicated management IP address range (e.g. 10.240.0.0/22). Provision GCVE private cloud with minimum 3 bare-metal nodes in target Google Cloud region.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'gcloud vmware private-clouds create gcve-prod-pc --location=europe-west3-a --cluster=cluster-1 --node-type=ve1-standard-72 --node-count=3 --management-range=10.240.0.0/22',
          explanation: 'Deploys GCVE private cloud with 3 ve1 bare-metal nodes.'
        },
        prerequisites: [
          'Google Cloud project with VMware Engine API enabled and node quota allocated',
          'Non-overlapping /22 or /24 CIDR block reserved'
        ],
        validationCheck: 'gcloud vmware private-clouds list shows state "ACTIVE".',
        rollbackConsideration: 'Delete private cloud resource before workload ingestion.',
        isVendorDocumentedFact: true,
        citationRef: 'gcveQuickstart'
      },
      {
        stepNumber: 2,
        title: 'VPC Peering via Private Services Access (PSA) & Cloud Interconnect',
        lifecycleStage: 'stage-3-network-prep',
        stageName: '3. Network and Security Preparation',
        actor: 'Network Engineer',
        description: 'Peer GCVE management network with Google Cloud VPC using Private Services Access. Configure Cloud Interconnect VLAN attachments (Interconnect Attachments) to exchange on-premises routes via Cloud Router BGP.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'gcloud compute networks peerings create gcve-peering --network=prod-vpc --peer-network=gcve-managed-vpc --auto-create-routes',
          explanation: 'Establishes bidirectional route exchange between GCP VPC and GCVE.'
        },
        prerequisites: [
          'Dedicated or Partner Cloud Interconnect active',
          'Cloud Router advertising on-prem subnets to GCVE'
        ],
        validationCheck: 'Ping GCVE vCenter IP (e.g. 10.240.0.10) from Google Cloud VM and from on-premises over Cloud Interconnect.',
        rollbackConsideration: 'Delete VPC peering; traffic returns to existing paths.',
        isVendorDocumentedFact: true,
        citationRef: 'gcveQuickstart'
      },
      {
        stepNumber: 3,
        title: 'HCX Service Mesh Deployment & Workload Replication',
        lifecycleStage: 'stage-5-workload-evacuation',
        stageName: '5. Workload Migration and Evacuation',
        actor: 'VMware Administrator',
        description: 'Deploy on-prem HCX Connector, pair with GCVE HCX Cloud Manager, configure Service Mesh, extend production VLANs, and execute bulk migration batches.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'GCVE Portal > Workloads > HCX > Service Mesh > Extended Networks > Execute Bulk Migration',
          explanation: 'Performs background data replication over Cloud Interconnect.'
        },
        prerequisites: ['Cloud Interconnect operational with MTU 1500'],
        validationCheck: 'HCX replication status reaches 100% synchronized state.',
        rollbackConsideration: 'Cancel migration in HCX console; source on-prem VM remains live.',
        isVendorDocumentedFact: true,
        citationRef: 'gcveHcx'
      },
      {
        stepNumber: 4,
        title: 'Google BigQuery & Vertex AI High-Throughput Peering Validation',
        lifecycleStage: 'stage-7-validation',
        stageName: '7. Functional and Performance Validation',
        actor: 'Database Administrator',
        description: 'Verify low-latency, zero-NAT throughput from migrated VMware VMs to Google Cloud native services including BigQuery storage API, Vertex AI endpoints, and Cloud Storage buckets.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'gcloud storage ls gs://enterprise-analytics-vault/',
          explanation: 'Tests direct Private Google Access from GCVE workload segment.'
        },
        prerequisites: ['Private Google Access enabled on VPC'],
        validationCheck: 'Sub-millisecond latency to Google Cloud native APIs within the same region.',
        rollbackConsideration: 'N/A: Performance benchmark step.',
        isVendorDocumentedFact: true,
        citationRef: 'gcveQuickstart'
      }
    ]
  },

  // ===========================================================================
  // 4. NUTANIX CLOUD CLUSTERS (NC2) ON AZURE RUNBOOK
  // ===========================================================================
  {
    id: 'runbook-nc2-azure',
    platformId: 'nc2-azure',
    platformName: 'Nutanix Cloud Clusters (NC2) on Microsoft Azure',
    hyperscaler: 'azure',
    migrationTooling: 'Nutanix Move 5.3+ (Agentless CBT Cross-Hypervisor) + ExpressRoute / VPN',
    primaryProtocol: 'Nutanix Move REST API & Data Plane over ExpressRoute / Azure VNet Native',
    applicableScenario: 'Enterprise modernization: Migrating VMware vSphere/ESXi or on-premises Nutanix AHV workloads to Nutanix AHV running on Microsoft Azure BareMetal nodes',
    targetArchitectureSummary: 'Nutanix NC2 on Azure deployed on dedicated Azure BareMetal nodes (AN36 / AN36P) running Nutanix AHV & AOS. Integrates natively with Azure Virtual Networks via subnet delegation; storage provided by Nutanix Distributed Storage Fabric (DSF) with RF2/RF3.',
    citations: [
      OFFICIAL_RUNBOOK_CITATIONS.nc2AzureArchitecture,
      OFFICIAL_RUNBOOK_CITATIONS.nc2AzureMove,
      OFFICIAL_RUNBOOK_CITATIONS.nc2AzureFlow
    ],
    platformSpecificConstraints: {
      minimumClusterNodes: 3, // Minimum 3 nodes for production RF2 cluster; 5 nodes for RF3
      maximumClusterNodes: 28, // Max nodes per single NC2 cluster on Azure
      supportedMtu: '1500 (Azure VNet Standard) / 9000 (Local cluster inter-node storage traffic)',
      unsupportedWorkloads: [
        'Physical RDM (RDM-P) without conversion to Nutanix Volume Groups (iSCSI)',
        'VMware Fault Tolerance (FT) lockstep VMs (must convert to Nutanix High Availability)',
        'Virtual appliances with hardcoded PCI vendor dependencies requiring VMware ESXi kernel modules'
      ],
      bandwidthRequirements: 'Minimum 1 Gbps ExpressRoute for small workloads; 10 Gbps recommended for multi-terabyte database estates',
      latencyThresholds: '< 150 ms RTT for Nutanix Move asynchronous seeding; <= 5 ms RTT for synchronous Metro Availability'
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Workload RVTools Extraction & AHV Compatibility Profiling',
        lifecycleStage: 'stage-1-discovery',
        stageName: '1. Discovery and Assessment',
        actor: 'Cloud Migration Architect',
        description: 'Execute RVTools inventory dump on VMware vCenter. Inspect guest operating systems, storage controllers (BusLogic, LSI, PVSCSI), vNIC types (E1000 vs VMXNET3), and disk attachment types (RDM vs VMDK) to identify VirtIO driver needs and controller conversions.',
        commandOrAction: {
          type: 'PowerCLI',
          code: 'Get-VM | Select-Object Name, @{N="OS";E={$_.Guest.OSFullName}}, @{N="Disks";E={$_.HardDisks.Count}}, @{N="RDM";E={$_.HardDisks | Where-Object {$_.DiskType -like "*Raw*"}}} | Export-Csv ./nc2-rvtools-profile.csv',
          explanation: 'Profiles inventory for automated Nutanix Move compatibility.'
        },
        prerequisites: [
          'Read-only credentials on source vCenter 6.5, 7.0, or 8.0',
          'Nutanix NC2 Assessment tool loaded with inventory data'
        ],
        validationCheck: 'Verify all in-scope VMs are categorized into: Direct Move Ready, VirtIO Driver Injection Required, or Architectural Intervention.',
        rollbackConsideration: 'Zero impact: Non-invasive discovery audit.',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureMove',
        caveatsAndLimitations: [
          'Vendor limitation: Physical RDMs (RDM-P) cannot be snapshot-replicated directly by Nutanix Move. Convert to virtual disk or attach as Nutanix Volume Group (iSCSI).'
        ]
      },
      {
        stepNumber: 2,
        title: 'Azure Subscription, Resource Provider & Quota Registration',
        lifecycleStage: 'stage-2-prerequisites',
        stageName: '2. Prerequisites and Readiness',
        actor: 'Cloud Migration Architect',
        description: 'Register the Microsoft.BareMetal and Microsoft.Network resource providers in the target Azure subscription. Verify Azure BareMetal AN36 or AN36P node quota allocation in target region.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'az provider register --namespace Microsoft.BareMetal && az provider register --namespace Microsoft.Network',
          explanation: 'Enables Azure subscription to provision bare-metal compute instances for Nutanix.'
        },
        prerequisites: [
          'Azure Enterprise Agreement (EA) with NC2 quota authorized by Microsoft and Nutanix',
          'Nutanix Cloud Clusters (NC2) console account with active entitlement'
        ],
        validationCheck: 'az provider show -n Microsoft.BareMetal --query "registrationState" returns "Registered".',
        rollbackConsideration: 'N/A: Subscription configuration only.',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureArchitecture'
      },
      {
        stepNumber: 3,
        title: 'Azure Virtual Network & Delegated Subnet Preparation',
        lifecycleStage: 'stage-3-network-prep',
        stageName: '3. Network and Security Preparation',
        actor: 'Network Engineer',
        description: 'Create target Azure Virtual Network (VNet). Allocate and delegate a dedicated /24 or /25 subnet exclusively to Nutanix BareMetal cluster nodes. Allocate separate workload subnets and PC/PE management subnets.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'az network vnet subnet create -g rg-nc2-prod --vnet-name vnet-nc2-prod -n snet-nc2-baremetal --address-prefixes 10.240.1.0/24 --delegations Microsoft.BareMetal/AzureBareMetalInstances',
          explanation: 'Delegates subnet to Microsoft.BareMetal for Nutanix AHV host interfaces.'
        },
        prerequisites: [
          'VNet address space allocated (non-overlapping with on-premises or hub VNets)',
          'ExpressRoute Gateway deployed in Hub VNet with peering to NC2 VNet'
        ],
        validationCheck: 'Subnet shows delegation status "Microsoft.BareMetal/AzureBareMetalInstances".',
        rollbackConsideration: 'Delete subnet if CIDR needs modification before cluster deployment.',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureArchitecture',
        caveatsAndLimitations: [
          'Vendor constraint: The cluster management subnet cannot be modified after cluster deployment.'
        ]
      },
      {
        stepNumber: 4,
        title: 'Deploy NC2 Cluster on Azure BareMetal via NC2 Console',
        lifecycleStage: 'stage-2-prerequisites',
        stageName: '2. Prerequisites and Readiness',
        actor: 'Cloud Migration Architect',
        description: 'Authenticate to NC2 Cloud Portal (cloud.nutanix.com). Provision 3+ node bare-metal cluster (AN36 / AN36P). Configure AOS LTS release, Prism Central deployment, and Distributed Storage Fabric (DSF) with Replication Factor 2 (RF2) or RF3.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'NC2 Portal > Clusters > Create Cluster > Azure Cloud > Region: westeurope > Node SKU: AN36 > Nodes: 3 > Subnet: snet-nc2-baremetal > AOS Version: 6.8 LTS > RF: RF2',
          explanation: 'Deploys AHV hypervisor and CVMs across physical Azure BareMetal hardware.'
        },
        prerequisites: [
          'Azure Service Principal with Contributor rights on target resource group',
          'BareMetal node quota available in chosen region'
        ],
        validationCheck: 'Prism Element and Prism Central report cluster state Healthy (All CVMs up, storage pool online).',
        rollbackConsideration: 'Terminate cluster in NC2 portal to stop bare-metal consumption.',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureArchitecture',
        caveatsAndLimitations: [
          'CVM resource overhead: Each node reserves 12 vCPUs and 32-64 GB RAM for the Nutanix Controller VM (CVM). Plan cluster sizing accordingly.'
        ]
      },
      {
        stepNumber: 5,
        title: 'Deploy Nutanix Move Appliance & Environment Pairing',
        lifecycleStage: 'stage-3-network-prep',
        stageName: '3. Network and Security Preparation',
        actor: 'VMware Administrator',
        description: 'Deploy the lightweight Nutanix Move appliance OVA on on-premises vSphere or in target NC2 Prism Central. Connect Move to source VMware vCenter and target NC2 Prism Central.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'Nutanix Move Web UI > Environments > Add Environment > Source: VMware vCenter (vcenter.corp.local) > Target: Nutanix NC2 Prism Central (10.240.2.10)',
          explanation: 'Establishes secure management session and discovers source/target inventory.'
        },
        prerequisites: [
          'TCP 443 open from Move appliance to source vCenter and target Prism Central',
          'Administrative service account on vCenter with Changed Block Tracking (CBT) privileges'
        ],
        validationCheck: 'Nutanix Move environments dashboard shows both vCenter and NC2 as "Connected".',
        rollbackConsideration: 'Delete Move VM appliance; no source or target state modified.',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureMove'
      },
      {
        stepNumber: 6,
        title: 'Create Migration Migration Plans & Automatic VirtIO Driver Prep',
        lifecycleStage: 'stage-5-workload-evacuation',
        stageName: '5. Workload Migration and Evacuation',
        actor: 'Cloud Migration Architect',
        description: 'Create migration plans in Nutanix Move grouped by wave. Configure target AHV storage container and target Azure VNet subnet. Nutanix Move automatically prepares target Windows/Linux VMs with AHV VirtIO drivers, converts BusLogic/LSI/PVSCSI to AHV VirtIO-SCSI, and seeds initial data via CBT without downtime.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'Nutanix Move > Migration Plans > Create Plan > Select VMs (Wave 1) > Target Network: Azure VNet Subnet > Automated Driver Injection: Enabled > Start Seeding',
          explanation: 'Initiates non-disruptive CBT disk replication directly to target Nutanix DSF storage.'
        },
        prerequisites: [
          'Pilot migration completed successfully',
          'Windows guest credentials provided to Move for automated VirtIO agent injection'
        ],
        validationCheck: 'Move replication status advances to "In-Sync" (Ready for Cutover).',
        rollbackConsideration: 'Cancel migration plan in Move; source VMs remain unaffected and target temporary disks are deleted.',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureMove',
        caveatsAndLimitations: [
          'Nutanix Move automated driver injection handles Windows 2008 R2 through Windows Server 2025 and enterprise Linux distributions (RHEL, CentOS, Ubuntu, SLES).',
          'Legacy custom kernels require manual verification of VirtIO kernel modules.'
        ]
      },
      {
        stepNumber: 7,
        title: 'Maintenance Window Execution & Scheduled Cutover',
        lifecycleStage: 'stage-6-cutover',
        stageName: '6. Cutover',
        actor: 'Cloud Migration Architect',
        description: 'Initiate scheduled cutover. Nutanix Move shuts down source VMware VM, takes final snapshot to capture last changed blocks, converts disk format to native AHV vDisk, injects VirtIO network/storage drivers, powers on VM on NC2 AHV, and removes VMware Tools.',
        commandOrAction: {
          type: 'Portal-UI',
          code: 'Nutanix Move > Migration Plans > Select Plan > Click "Cutover" > Confirm Cutover Window',
          explanation: 'Executes automated final delta transfer and boots VM on NC2 AHV.'
        },
        prerequisites: [
          'Replication status is "In-Sync"',
          'Application maintenance window active'
        ],
        validationCheck: 'VM powers on in Prism Central; Prism console confirms VM is running with AHV VirtIO drivers and IP assigned.',
        rollbackConsideration: 'If cutover validation fails, power off target VM in Prism, and power on original source VM in vCenter (source disks remain unmodified).',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureMove',
        caveatsAndLimitations: [
          'Cutover downtime duration: Typically 5-15 minutes per VM batch, governed solely by final dirty page transfer and OS boot time.'
        ]
      },
      {
        stepNumber: 8,
        title: 'Application & DNS Cutover Validation',
        lifecycleStage: 'stage-7-validation',
        stageName: '7. Functional and Performance Validation',
        actor: 'Database Administrator',
        description: 'Validate database transactions, application query latency, file share accessibility, and Active Directory authentication on NC2. Update DNS records if target subnet IP addresses were customized during Move plan.',
        commandOrAction: {
          type: 'Bash/CLI',
          code: 'nslookup app-prod.corp.local && curl -fsSL -o /dev/null -w "%{http_code}" https://app-prod.corp.local/healthz',
          explanation: 'Verifies DNS resolution and application HTTP response.'
        },
        prerequisites: ['Cutover complete; VM booted on AHV'],
        validationCheck: 'Application health checks return HTTP 200; database replication synchronized.',
        rollbackConsideration: 'Source VM remains preserved on vCenter; initiate rollback if critical SLA breached.',
        isVendorDocumentedFact: false,
        citationRef: 'nc2AzureArchitecture'
      },
      {
        stepNumber: 9,
        title: 'Configure Nutanix Disaster Recovery / Leap & Source Decommission',
        lifecycleStage: 'stage-9-post-migration-closure',
        stageName: '9. Post-Migration Optimization and Closure',
        actor: 'Cloud Migration Architect',
        description: 'Configure Nutanix Protection Policies and Recovery Plans in Prism Central / Nutanix Leap for ongoing disaster recovery. Set up Azure Blob snapshot tiering. Decommission on-premises source VMs.',
        commandOrAction: {
          type: 'NCLI',
          code: 'ncli protection-domain create name="NC2-Tier0-Apps" && ncli protection-domain add-vm name="NC2-Tier0-Apps" vm-names="prod-db-01,prod-app-01"',
          explanation: 'Enables asynchronous NearSync or synchronous protection policy.'
        },
        prerequisites: [
          'Post-migration validation signed off by application owners',
          'Target backup policy active'
        ],
        validationCheck: 'Prism Central shows Protection Policy Active with verified recovery snapshot schedule.',
        rollbackConsideration: 'N/A: Final steady-state closure.',
        isVendorDocumentedFact: true,
        citationRef: 'nc2AzureFlow'
      }
    ]
  }
];

/**
 * Helper to fetch a runbook by platform identifier
 */
export function getRunbookForPlatform(platformId: string): PlatformMigrationRunbook {
  if (platformId === 'nc2-azure') {
    return PLATFORM_MIGRATION_RUNBOOKS.find(r => r.platformId === 'nc2-azure') || PLATFORM_MIGRATION_RUNBOOKS[0];
  }
  if (platformId === 'vmc-aws') {
    return PLATFORM_MIGRATION_RUNBOOKS.find(r => r.platformId === 'vmc-aws') || PLATFORM_MIGRATION_RUNBOOKS[0];
  }
  if (platformId === 'gcve') {
    return PLATFORM_MIGRATION_RUNBOOKS.find(r => r.platformId === 'gcve') || PLATFORM_MIGRATION_RUNBOOKS[0];
  }
  return PLATFORM_MIGRATION_RUNBOOKS.find(r => r.platformId === 'avs-gen1') || PLATFORM_MIGRATION_RUNBOOKS[0];
}
