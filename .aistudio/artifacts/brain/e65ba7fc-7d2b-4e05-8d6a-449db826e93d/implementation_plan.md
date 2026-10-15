# Zaboraa Enterprise Cloud Architecture Redesign, Dual-Theme Scoping & Migration Intelligence Plan (Revision 2)

A comprehensive roadmap to properly scope the enterprise light-theme system under `.light-high-contrast` in `src/index.css` (enabling seamless switching between authentic Dark Mode and clean Enterprise Slate Light Mode), refine the 4-step cloud architecture wizard with dual-location Aria sizing controls, integrate Nutanix NC2 on Azure with official vendor-documented 9-stage runbooks, and validate all capacity, DR, and datapath logic via an automated Vitest test suite—while strictly protecting the Gemini image generation pipeline and authentication security.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and design parameters govern this revised implementation plan:

- **Confirmed Decision 1 (Dual-Theme Scoping Architecture)**: Properly scope all enterprise light theme CSS rules in `src/index.css` under the `.light-high-contrast` root class (e.g. `.light-high-contrast body`, `.light-high-contrast .bg-slate-950`). This guarantees that:
  1. When dark mode is active (`.dark` on `<html>`), light-theme overrides do not apply, rendering true, high-contrast dark mode with glowing topology paths.
  2. When light mode is active (`.light-high-contrast` on `<html>`), the clean enterprise slate palette takes effect with crisp white cards (`#FFFFFF`), neutral slate borders (`#E2E8F0`), deep charcoal text (`#0F172A`), and royal blue accents (`#2563EB`).
  3. The floating toggle button in `App.tsx` and `CustomizationContext.tsx` seamlessly swaps between authentic dark and light modes without visual conflicts.
- **Confirmed Decision 2 (Aria Operations & Automation Sizing Controls)**: Dual-location explicit controls. Aria inclusion checkboxes are rendered directly in the **Step 1 Cluster Sizing Card** for immediate visibility during host sizing, and mirrored inside the **Global Engineering Assumptions Drawer** for fine-grained hypervisor capacity tuning.
- **Confirmed Decision 3 (Technical Validation & Runbooks)**: Full automated Vitest test suite verifying cluster math, heterogeneous host classes, failure scenarios, CIDR bitwise checks, storage parity, DR bandwidth SLAs, and verified vendor citations across all 4 target platforms: Azure VMware Solution (AVS Gen 1 & Gen 2), VMware Cloud on AWS (VMC), Google Cloud VMware Engine (GCVE), and Nutanix Cloud Clusters on Azure (NC2).
- **Critical Invariant (Image Generation Pipeline Protection)**: `api/generate-blueprint.js`, the Gemini image model `gemini-3.1-flash-image`, `GEMINI_API_KEY` handling, and Vertex AI request configurations will remain untouched and preserved with zero modifications.

---

## 1. Overview & Core Concept

### What It Does
Zaboraa is an enterprise-grade cloud architecture and migration intelligence workbench for infrastructure architects, CIOs, and cloud engineers. It provides:
1. **Interactive Dual-Theme Mode**: Authentic dark mode for high-contrast topology immersion and clean enterprise light mode for executive presentations and daylight engineering sessions.
2. **Interactive 4-Step Architecture Wizard**: Translates enterprise on-premises vSphere or Nutanix AHV estates into sized, validated target cloud topologies (AVS, VMC, GCVE, and NC2 on Azure).
3. **Deterministic Engineering Calculators**: Accurately dimensions physical cores vs. logical threads, hypervisor RAM and CPU reservations, Aria suite management overhead, storage parity (RAID-1, RAID-5, RAID-6, Nutanix RF2/RF3/EC-X), and replication throughput for disaster recovery.
4. **9-Stage Migration Runbooks**: Delivers actionable, step-by-step migration procedures with vendor facts, verification dates, official URLs, PowerCLI/CLI automation scripts, and rollback strategies.
5. **Dual Blueprint Engine**: Generates deterministic 4K vector blueprints and AI-synthesized 3D isometric cloud diagrams for executive briefings and migration approval dossiers.

---

## 2. User Experience & Visual Design

### Scoped Dual-Theme System (`.dark` and `.light-high-contrast`)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [HTML Root: class="dark"]                                                       │
│ Canvas: #020617 (Slate 950) | Cards: #0F172A (Slate 900) | Text: #F8FAFC        │
│ Accents: Neon Cyan (#06B6D4) & Emerald (#10B981) glowing paths                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ [HTML Root: class="light-high-contrast"]                                        │
│ 60% Dominant Neutral Canvas:   #F8FAFC (Cool off-white, light slate)            │
│ 30% Structural Surfaces:       #FFFFFF (Cards, Drawers, Modals) + #E2E8F0       │
│ 10% High-Intent Accent:        #2563EB (Royal Blue) for CTAs & Active Tabs      │
│ Semantic Status:               #16A34A (Ready), #D97706 (Warning), #DC2626      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- **Top Bar Contract**: Single-row, 3-zone layout with brand wordmark in `Plus Jakarta Sans`, 4–5 single-line nav links (`whitespace-nowrap shrink-0`), and 1 primary action button.
- **Zero-Pill Discipline**: Metadata rendered as clean, unboxed text separated by typographic middots (`·`). Interactive controls use segmented tabs with subtle elevation, avoiding pill badge sandwiches.
- **Typography**: `Plus Jakarta Sans` for headers and UI controls, paired with `JetBrains Mono` with `tabular-nums` for all IP addresses, CIDR blocks, host counts, RAM/storage metrics, and SLA timers.
- **Layout Math**: 1440px baseline container width, outer padding $\ge$ inner gap ($24\text{px} \ge 16\text{px}$), single-level elevation, and smooth transitions ($\le 200\text{ms}$).

---

## 3. Key Product Decisions & Implementation Batches

### Batch A: Theme Scoping in `src/index.css`
- **Scope All Enterprise Light Theme Selectors**:
  - Prepend `.light-high-contrast` to all base surface rules (`body`, `.theme-root`).
  - Prepend `.light-high-contrast` to all container rules (`.bg-slate-950`, `.bg-slate-900`, `.bg-slate-800`).
  - Prepend `.light-high-contrast` to border and divider overrides (`.border-slate-800`, `.divide-slate-800`).
  - Prepend `.light-high-contrast` to typography rules (`.text-white`, `.text-slate-100`, `.text-slate-200`, `.text-slate-400`).
  - Prepend `.light-high-contrast` to accent colors (`.text-cyan-400`, `.bg-cyan-500`, `.bg-emerald-950`, `.border-cyan-500`).
  - Prepend `.light-high-contrast` to form inputs, selects, and textareas.
  - Prepend `.light-high-contrast` to diagram frames and density overrides.
- **Verify Floating Toggle in `App.tsx`**:
  - Ensure clicking the toggle switches root class from `dark` to `light-high-contrast`.
  - Verify that dark mode immediately renders deep slate backgrounds, dark cards, and glowing accents without being overridden.
  - Verify that light mode immediately renders clean off-white backgrounds, crisp white cards, and royal blue accents.

### Batch B: 4-Step Wizard Refinement & Explicit Aria Controls
- **Step 1 (Scope & Source)**:
  - Add explicit checkboxes for **Include VMware Aria Operations** and **Include VMware Aria Automation** directly in the Cluster Sizing Card.
  - Wire state updates directly into `wizardState.assumptions.ariaOperationsIncluded` and `ariaAutomationIncluded`.
  - Mirror controls in the Engineering Assumptions slide-over drawer.
  - Dynamically recalculate usable vCPU and RAM based on active Aria selections.
- **Step 2 (Transit & Routing)**:
  - Enhance inline environment editor (drawer/expandable card) supporting Name, Region, Host Count, RAM, Storage, and CIDR with real-time validation.
  - Validate IPv4 CIDR blocks and detect collisions with on-premises networks.
- **Step 3 (Security & WAF)**:
  - Ensure firewall mode, NVA provider, dual inspection, and WAF selector seamlessly adapt to both dark and light modes.
- **Step 4 (Target SDDC & DR)**:
  - Verify SKU selection, external storage attachments, and DR SLA calculations.
  - Support verified 9-stage runbook modal display.
- **Remove Obsolete UI**:
  - Clean up any dead SVG drag-drop listeners and obsolete canvas event logic.

### Batch C: Nutanix NC2 on Azure Integration & Runbook Verification
- **Target Platform Selection**:
  - Nutanix Cloud Clusters on Azure (`nc2-azure`) represented across all 4 steps.
  - Bare-metal node SKUs: AN36 (36 cores, 576GB RAM, 15.3TB NVMe), AN36P (36 cores, 768GB RAM, 19.2TB NVMe), and AN64 (64 cores, 1024GB RAM, 30.7TB NVMe).
  - Dedicated Nutanix Controller VM (CVM) reservation math: 12 vCPUs and 32–64 GB RAM per host deducted before guest workload allocation.
  - Nutanix Flow Network Security VPC and Prism Central management integration.
- **9-Stage Migration Runbooks**:
  - Verify official citations for AVS, VMC, GCVE, and NC2 on Azure.
  - Explicitly attribute vendor-documented facts vs. Zaboraa architectural recommendations.

### Batch D: Calculation Engine & Vitest Test Suite
- Fix hypervisor and Aria RAM calculation test assertion:
  - Ensure `calculateClusterCapacity` cleanly separates base hypervisor reservation from optional Aria add-ons.
  - Add unit tests for Nutanix CVM reservations, storage parity multipliers, and replication bandwidth formulas.
- Build Vitest test suites:
  - `src/tests/architectureCalculator.test.ts`
  - `src/tests/cidrUtils.test.ts`
  - `src/tests/storageCalculator.test.ts`
- Execute `npm test` via Vitest and verify 100% pass rate.

### Batch E: Compilation, Linting & Verification
- Run `compile_applet` and `lint_applet` to confirm zero errors.
- Verify theme toggle across all pages (Home, Disciplines, Workbench Tools, Roadmap, About).
- Verify image generation pipeline remains functional and protected.

---

## 4. Technical Architecture & Data Strategy

### Scoped CSS Architecture in `src/index.css`

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                               src/index.css                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│ @import "tailwindcss";                                                        │
│                                                                               │
│ /* Base Tailwind configuration & scrollbars */                                │
│ ...                                                                           │
│                                                                               │
│ /* Default / Dark Mode Styles: Inherited from Tailwind classes directly */    │
│ (bg-slate-950, bg-slate-900, text-white, text-cyan-400, etc.)                │
│                                                                               │
│ /* Enterprise Light Theme Overrides (STRICTLY SCOPED) */                      │
│ .light-high-contrast body,                                                    │
│ .light-high-contrast .theme-root { background-color: #f8fafc !important; }    │
│ .light-high-contrast .bg-slate-950 { background-color: #ffffff !important; }  │
│ .light-high-contrast .bg-slate-900 { background-color: #ffffff !important; }  │
│ .light-high-contrast .text-white { color: #0f172a !important; }               │
│ .light-high-contrast .text-cyan-400 { color: #2563eb !important; }            │
│ ...                                                                           │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Verification & Testing Protocol

- **Theme Toggle Verification**:
  - Verify clicking the Moon/Sun floating button in `App.tsx` toggles root class between `.dark` and `.light-high-contrast`.
  - In `.dark`: Inspect background is `#020617` / `#0F172A`, cards are dark slate, text is light/white, and accent borders glow cyan.
  - In `.light-high-contrast`: Inspect background is `#F8FAFC`, cards are `#FFFFFF`, text is `#0F172A`, and accent borders are royal blue.
- **Unit Testing**: Convert Stage 1 verification into standard Vitest tests covering all mathematical boundaries, negative inputs, zero-host edge cases, and subnet collision intervals.
- **Compilation & Type Safety**: Run `compile_applet` and `lint_applet` with zero warnings and zero TypeScript errors.
- **Workflow Verification**: Verify user navigation through Steps 1 to 4, inline environment creation and editing, template switching with safety modals, and export generation.
- **Image Pipeline Isolation**: Verify that `api/generate-blueprint.js` and Gemini image generation endpoints function without regression.
