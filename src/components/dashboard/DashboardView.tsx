"use client";

import React from "react";
import {
  FolderKanban,
  FileText,
  Sparkles,
  Award,
  Flame,
  ArrowUpRight,
  Mic,
  Brain,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { ViewType } from "../layout/Sidebar";

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
  onOpenCreateConference: () => void;
  onOpenUploadDocument: () => void;
  data: {
    stats: {
      conferences: number;
      documents: number;
      speeches: number;
      awards: number;
      practiceStreak: number;
    };
    recentConferences: any[];
    recentDocs: any[];
    awardsList: any[];
  } | null;
  onSelectConference: (confId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCreateConference,
  onOpenUploadDocument,
  data,
  onSelectConference,
}) => {
  const stats = data?.stats || {
    conferences: 3,
    documents: 9,
    speeches: 2,
    awards: 3,
    practiceStreak: 4,
  };

  const recentConfs = data?.recentConferences || [];
  const recentDocs = data?.recentDocs || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-vault-coral font-mono text-[11px] font-bold tracking-wider uppercase">
            <span className="w-4 h-1 bg-vault-coral inline-block"></span>
            ACTIVE DELEGATE ARCHIVE · ALL SYSTEMS OPERATIONAL
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            Your MUN brain,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-vault-coral via-vault-yellow to-vault-teal">
              beautifully organized.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-vault-muted mt-2 max-w-xl">
            One central command center for your research briefs, GSL speeches, POI banks, resolutions, and AI-driven debate simulations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateConference}
            className="neo-btn bg-vault-coral text-vault-ink px-4 py-2.5 text-xs font-extrabold rounded flex items-center gap-2 hover:bg-rose-400"
          >
            ＋ NEW CONFERENCE
          </button>
          <button
            onClick={onOpenUploadDocument}
            className="neo-btn bg-vault-card hover:bg-vault-cardHover text-white px-4 py-2.5 text-xs font-bold rounded flex items-center gap-2"
          >
            ＋ ADD DOCUMENT
          </button>
        </div>
      </div>

      {/* Hero Delegate Desk Panel */}
      <div className="neo-box bg-gradient-to-br from-vault-card to-vault-panel rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 border-2 border-vault-border">
        <div className="p-6 lg:p-8 lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-vault-yellow flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> DELEGATE FIELD DESK / 001
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight tracking-tight">
              PREPARE WITH PURPOSE.<br />
              DEBATE WITH PROOF.
            </h2>
            <p className="text-xs sm:text-sm text-vault-muted mt-2 max-w-lg leading-relaxed">
              Never lose another argument to scattered notes. Your immutable research connects automatically to GSL speeches, caucus notes, and working papers with verified UN precedents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("analyst")}
              className="neo-btn bg-vault-yellow text-vault-ink px-4 py-2 text-xs font-extrabold rounded flex items-center gap-2 hover:bg-yellow-400"
            >
              RUN AI RESEARCH ANALYST <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate("coach")}
              className="neo-btn bg-vault-coral text-vault-ink px-4 py-2 text-xs font-extrabold rounded flex items-center gap-2 hover:bg-rose-400"
            >
              <Mic className="w-3.5 h-3.5" /> VOICE SIMULATION LAB
            </button>
          </div>
        </div>

        <div className="bg-vault-subtle p-6 lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-vault-border flex flex-col justify-center relative overflow-hidden">
          <div className="text-[10px] font-mono text-vault-dim uppercase tracking-wider mb-2">
            AI ARCHIVE METRICS
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-vault-card/60 border border-vault-border">
              <span className="text-vault-muted">IMMUTABLE ARCHIVE</span>
              <span className="text-vault-teal font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED READ-ONLY
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-vault-card/60 border border-vault-border">
              <span className="text-vault-muted">CONNECTED NODES</span>
              <span className="text-vault-lavender font-bold">14 ACTIVE LINKS</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-vault-card/60 border border-vault-border">
              <span className="text-vault-muted">SPEECH ARGUMENTS</span>
              <span className="text-vault-yellow font-bold">8 CORE THEMES</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-vault-border/60 flex items-center justify-between text-[11px] font-mono text-vault-muted">
            <span>MUNVAULT OS</span>
            <span className="text-vault-coral">v1.0.0 PROD</span>
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Conferences */}
        <div
          onClick={() => onNavigate("conferences")}
          className="neo-box bg-vault-card hover:bg-vault-cardHover p-4 rounded cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-vault-muted text-[10px] font-mono font-bold uppercase">
            <span>Conferences</span>
            <FolderKanban className="w-4 h-4 text-vault-coral" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {String(stats.conferences).padStart(2, "0")}
            <span className="text-[10px] font-normal text-vault-muted ml-1">ARCHIVED</span>
          </div>
        </div>

        {/* Documents */}
        <div
          onClick={() => onNavigate("documents")}
          className="neo-box bg-vault-card hover:bg-vault-cardHover p-4 rounded cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-vault-muted text-[10px] font-mono font-bold uppercase">
            <span>Documents</span>
            <FileText className="w-4 h-4 text-vault-teal" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {String(stats.documents).padStart(2, "0")}
            <span className="text-[10px] font-normal text-vault-muted ml-1">FILES</span>
          </div>
        </div>

        {/* Speeches */}
        <div
          onClick={() => onNavigate("speeches")}
          className="neo-box bg-vault-card hover:bg-vault-cardHover p-4 rounded cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-vault-muted text-[10px] font-mono font-bold uppercase">
            <span>Speeches</span>
            <Brain className="w-4 h-4 text-vault-lavender" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {String(stats.speeches).padStart(2, "0")}
            <span className="text-[10px] font-normal text-vault-muted ml-1">INDEXED</span>
          </div>
        </div>

        {/* Awards */}
        <div
          onClick={() => onNavigate("conferences")}
          className="neo-box bg-vault-card hover:bg-vault-cardHover p-4 rounded cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-vault-muted text-[10px] font-mono font-bold uppercase">
            <span>Awards</span>
            <Award className="w-4 h-4 text-vault-yellow" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {String(stats.awards).padStart(2, "0")}
            <span className="text-[10px] font-normal text-vault-muted ml-1">WON</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Conferences + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Conferences */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-vault-coral" /> RECENT CONFERENCES
            </h3>
            <button
              onClick={() => onNavigate("conferences")}
              className="text-xs font-mono text-vault-coral hover:underline flex items-center gap-1"
            >
              VIEW ALL ↗
            </button>
          </div>

          <div className="space-y-2.5">
            {recentConfs.length === 0 ? (
              <div className="neo-box bg-vault-card p-6 text-center text-vault-muted text-xs font-mono">
                No conferences created yet. Click &quot;＋ NEW CONFERENCE&quot; to begin your archive!
              </div>
            ) : (
              recentConfs.map((conf) => (
                <div
                  key={conf.id}
                  onClick={() => onSelectConference(conf.id)}
                  className="neo-box bg-vault-card hover:bg-vault-cardHover p-4 rounded cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded bg-vault-panel border border-vault-border flex items-center justify-center text-xl shrink-0">
                      {conf.countryFlag || "🌐"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">{conf.name}</span>
                        {conf.award && (
                          <span className="text-[9px] font-mono bg-vault-yellow/20 text-vault-yellow border border-vault-yellow/40 px-1.5 py-0.5 rounded font-bold">
                            ★ {conf.award}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-vault-muted mt-0.5 truncate">
                        {conf.committee} · {conf.portfolio} · {conf._count?.documents || 0} DOCS
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-vault-muted shrink-0 ml-2" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed & Quick Insights */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold uppercase text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-vault-teal" /> RECENT ARCHIVAL ACTIVITY
            </h3>
            <button
              onClick={() => onNavigate("documents")}
              className="text-xs font-mono text-vault-teal hover:underline flex items-center gap-1"
            >
              ALL DOCUMENTS ↗
            </button>
          </div>

          <div className="neo-box bg-vault-card p-4 rounded space-y-3">
            {recentDocs.length === 0 ? (
              <div className="text-center py-6 text-vault-muted text-xs font-mono">
                No documents uploaded yet.
              </div>
            ) : (
              recentDocs.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onNavigate("documents")}
                  className="flex items-start gap-2.5 pb-2.5 border-b border-vault-border/50 last:border-0 last:pb-0 cursor-pointer hover:opacity-80 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-vault-teal mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{doc.title}</div>
                    <div className="text-[10px] font-mono text-vault-muted mt-0.5 truncate">
                      {doc.category} · {doc.conference?.name || "Archive"}
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => onNavigate("documents")}
              className="w-full neo-btn bg-vault-panel hover:bg-vault-subtle text-vault-text py-2 text-xs font-bold rounded mt-2 border border-vault-border"
            >
              EXPLORE FULL DOCUMENT LIBRARY ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
