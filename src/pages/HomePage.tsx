import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomization } from '../context/CustomizationContext';
import { Hero } from '../components/Hero';
import { CaseStudiesSection } from '../components/CaseStudiesSection';
import {
  Layers,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  FileSpreadsheet,
  Activity,
  Calendar,
  Sparkles,
  GripVertical,
  Star,
  ChevronLeft,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { resolveMediaUrl } from '../data/mediaAssets';

export const HomePage: React.FC = () => {
  const {
    siteConfig,
    setIsBriefingModalOpen,
    isAdmin,
    reorderPlatformShowcases,
    movePlatformShowcase,
    pinPlatformShowcaseToTop,
    setIsCustomizerOpen
  } = useCustomization();

  const [draggedPlatformIndex, setDraggedPlatformIndex] = useState<number | null>(null);
  const [dragOverPlatformIndex, setDragOverPlatformIndex] = useState<number | null>(null);
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  const triggerOrderNotification = (msg: string) => {
    setOrderNotification(msg);
    setTimeout(() => setOrderNotification(null), 3000);
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Executive Overview */}
      <Hero />

      {/* 2. Interactive Engineering Workbench Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          data-theme-container="dark"
          className="dark-card dark-feature-container p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>SELF-SERVICE ARCHITECTURAL SUITE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Interactive Cloud Engineering Workbench
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Run production-grade calculations before initiating hyperscaler procurement. Size nodes with external decoupled storage (ANF / FSx), parse real RVTools spreadsheets, discover East-West application flows with Aria Networks (vRNI), calculate DR replication WAN bandwidth, and generate validated hybrid blueprints.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Node Sizing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>RVTools Parser</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-300" />
                  <span>Nutanix NC2</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-300" />
                  <span>Aria & DFW</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>DR RPO/RTO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>BOM Generator</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-lg hover:scale-[1.02]"
              >
                <span>Launch Engineering Workbench</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/tools/design-generator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
              >
                <span>Launch Architecture Wizard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dynamic Disciplines & Platform Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Hyperscaler & Software-Defined Platforms
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Architectural Disciplines & Validated Blueprints
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Production architectures engineered across Microsoft Azure, Amazon Web Services, Google Cloud, and VMware software-defined infrastructure.
            </p>
          </div>
          <Link
            to="/tools/design-generator"
            className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Launch Hybrid Blueprint Generator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Admin Sequence Controls Banner (Only visible for Admin) */}
        {isAdmin && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <span>Admin Privilege: Drag & Reorder Disciplines Sequence</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                    Active
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Drag any card or use the arrow controls (<ChevronLeft className="inline w-3 h-3 text-cyan-300" /> / <ChevronRight className="inline w-3 h-3 text-cyan-300" />) to reposition. <strong className="text-emerald-300 font-semibold">Primary skills (#1)</strong> are highlighted at the top, while secondary and least-privileged disciplines are arranged last.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                title="Open sequence manager drawer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open Sequence Studio</span>
              </button>
            </div>
          </div>
        )}

        {/* Admin Order Confirmation Notification */}
        {orderNotification && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{orderNotification}</span>
            </div>
            <span className="text-[10px] text-emerald-400/80">Saved to Cloud Site Config</span>
          </div>
        )}

        {/* Dynamic Cards Grid from siteConfig.platformShowcases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(siteConfig.platformShowcases || []).filter(item => isAdmin || item.enabled !== false).map((platform, idx, arr) => {
            const resolvedImg = resolveMediaUrl(platform.imageUrl);
            const isPrimary = idx === 0;
            const isSecondary = idx === 1 || idx === 2;
            const isLeast = idx === arr.length - 1;
            const isDragging = draggedPlatformIndex === idx;
            const isDragOver = dragOverPlatformIndex === idx;

            return (
              <div
                key={platform.id}
                draggable={isAdmin}
                onDragStart={(e) => {
                  if (!isAdmin) return;
                  setDraggedPlatformIndex(idx);
                  e.dataTransfer.setData('text/plain', String(idx));
                }}
                onDragOver={(e) => {
                  if (!isAdmin) return;
                  e.preventDefault();
                  if (dragOverPlatformIndex !== idx) {
                    setDragOverPlatformIndex(idx);
                  }
                }}
                onDragLeave={() => {
                  if (!isAdmin) return;
                  if (dragOverPlatformIndex === idx) {
                    setDragOverPlatformIndex(null);
                  }
                }}
                onDrop={(e) => {
                  if (!isAdmin) return;
                  e.preventDefault();
                  if (draggedPlatformIndex !== null && draggedPlatformIndex !== idx) {
                    reorderPlatformShowcases(draggedPlatformIndex, idx);
                    triggerOrderNotification(`Repositioned ${platform.platform} to sequence #${idx + 1}`);
                  }
                  setDraggedPlatformIndex(null);
                  setDragOverPlatformIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedPlatformIndex(null);
                  setDragOverPlatformIndex(null);
                }}
                className={`flex flex-col justify-between rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border transition-all duration-300 group overflow-hidden shadow-lg relative ${
                  isDragging ? 'opacity-40 scale-[0.98] border-cyan-400' : ''
                } ${
                  isDragOver ? 'border-cyan-400 ring-2 ring-cyan-500/50 bg-slate-900' : 'border-slate-800 hover:border-cyan-500/50'
                } ${
                  isPrimary && !isAdmin ? 'ring-1 ring-emerald-500/30' : ''
                }`}
              >
                {/* Admin Drag Handle & Priority Reorder Header */}
                {isAdmin && (
                  <div className="px-3 py-2 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded transition"
                        title="Drag card to reorder sequence"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20">
                          <Star className="w-3 h-3 text-emerald-400 fill-current" />
                          #1 PRIMARY SKILL
                        </span>
                      ) : isSecondary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                          #{idx + 1} SECONDARY
                        </span>
                      ) : isLeast ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                          #{idx + 1} LEAST PRIVILEGE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => {
                            pinPlatformShowcaseToTop(platform.id);
                            triggerOrderNotification(`Set ${platform.platform} as #1 Primary Skill!`);
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-0.5"
                          title="Pin as #1 Primary Skill"
                        >
                          <Star className="w-3 h-3 text-amber-400" />
                          <span className="hidden sm:inline">Top</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          movePlatformShowcase(platform.id, 'up');
                          triggerOrderNotification(`Moved ${platform.platform} up`);
                        }}
                        className={`p-1 rounded border transition cursor-pointer ${
                          idx === 0
                            ? 'opacity-30 border-slate-900 text-slate-600 cursor-not-allowed'
                            : 'border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
                        }`}
                        title="Move left/up in sequence"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => {
                          movePlatformShowcase(platform.id, 'down');
                          triggerOrderNotification(`Moved ${platform.platform} down`);
                        }}
                        className={`p-1 rounded border transition cursor-pointer ${
                          idx === arr.length - 1
                            ? 'opacity-30 border-slate-900 text-slate-600 cursor-not-allowed'
                            : 'border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 hover:bg-slate-900'
                        }`}
                        title="Move right/down in sequence"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Image Header with Scrim */}
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={resolvedImg}
                    alt={platform.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/hero_cloud_datacenter_1791450064361.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-cyan-300 backdrop-blur-md">
                      {platform.badge}
                    </span>
                    {/* Primary Highlight Badge in Public View */}
                    {!isAdmin && isPrimary && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 backdrop-blur-md shadow-md">
                        <Star className="w-3 h-3 text-emerald-400 fill-current" />
                        PRIMARY DISCIPLINE
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400">
                      {platform.platform}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {platform.techTags.slice(0, 3).map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="text-[10px] font-mono text-slate-400 bg-slate-950/80 border border-slate-800/80 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {platform.techTags.length > 3 && (
                      <span className="text-[10px] font-mono text-slate-500 px-1 py-0.5">
                        +{platform.techTags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Navigation CTA */}
                  <div className="pt-4 border-t border-slate-800/80">
                    <Link
                      to={`/disciplines/${platform.id}`}
                      className="inline-flex items-center justify-between w-full text-xs font-semibold text-cyan-400 group-hover:text-cyan-300"
                    >
                      <span>Explore Architecture & Specs</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Verified Case Studies & Enterprise Track Record */}
      <CaseStudiesSection />

      {/* 5. Executive Advisory CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div
          data-theme-container="dark"
          className="dark-card dark-feature-container p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Plan Your Cloud Architecture with Lead Principal Architect Wasim Sayyed
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Direct executive briefing covering VMware license optimization, decoupled storage economics, HCX zero-downtime cutover windows, and hyperscaler networking.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsBriefingModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Architecture Briefing</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
