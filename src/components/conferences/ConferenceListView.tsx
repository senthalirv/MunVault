"use client";

import React, { useState } from "react";
import {
  FolderKanban,
  Plus,
  Sparkles,
  Mic,
  ArrowUpRight,
  Award,
  FileText,
  Trash2,
} from "lucide-react";

interface ConferenceListViewProps {
  conferences: any[];
  onOpenCreateConference: () => void;
  onSelectConference: (confId: string) => void;
  onOpenAnalyst: (confId: string) => void;
  onOpenCoach: (confId: string) => void;
  onDeleteConference: (confId: string) => void;
}

export const ConferenceListView: React.FC<ConferenceListViewProps> = ({
  conferences,
  onOpenCreateConference,
  onSelectConference,
  onOpenAnalyst,
  onOpenCoach,
  onDeleteConference,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filtered = conferences.filter((c) => {
    if (filterStatus === "all") return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-vault-coral uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-1 bg-vault-coral inline-block"></span>
            YOUR DIPLOMATIC HISTORY, AT A GLANCE
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Conference Workspaces
          </h1>
          <p className="text-xs text-vault-muted mt-1 max-w-lg">
            Every portfolio, agenda, draft resolution, POI bank, and award organized into its own dedicated delegate workspace.
          </p>
        </div>

        <button
          onClick={onOpenCreateConference}
          className="neo-btn bg-vault-coral text-vault-ink px-4 py-2.5 text-xs font-bold rounded flex items-center gap-2 hover:bg-rose-400 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> NEW CONFERENCE
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap border-b-2 border-vault-border pb-3">
        {[
          { id: "all", label: `ALL WORKSPACES (${conferences.length})` },
          { id: "active", label: "IN PROGRESS" },
          { id: "past", label: "PAST CONFERENCES" },
          { id: "archived", label: "ARCHIVED" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded border transition-all ${
              filterStatus === tab.id
                ? "bg-vault-yellow text-vault-ink border-vault-ink shadow-neo-sm"
                : "bg-vault-card/60 text-vault-muted border-vault-border hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conference Cards Grid */}
      {filtered.length === 0 ? (
        <div className="neo-box bg-vault-card p-12 text-center text-vault-muted font-mono text-xs rounded">
          No conferences found under this filter. Create one to begin archiving.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((conf, index) => (
            <div
              key={conf.id}
              className="neo-box bg-vault-card hover:bg-vault-cardHover rounded-lg p-5 flex flex-col justify-between border-2 border-vault-border transition group"
            >
              <div>
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between text-[10px] font-mono text-vault-muted pb-3 border-b border-vault-border/60">
                  <span className="font-bold">CONFERENCE / {String(index + 1).padStart(3, "0")}</span>
                  <span
                    className={`px-2 py-0.5 rounded uppercase font-bold text-[9px] border ${
                      conf.status === "active"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-vault-subtle text-vault-muted border-vault-border"
                    }`}
                  >
                    {conf.status}
                  </span>
                </div>

                {/* Country Flag & Name */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded bg-vault-panel border border-vault-border flex items-center justify-center text-2xl shadow-neo-sm">
                    {conf.countryFlag || "🌐"}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-vault-teal transition">
                      {conf.name}
                    </h3>
                    <div className="text-[11px] font-mono text-vault-coral font-bold mt-0.5">
                      {conf.committee} · {conf.portfolio}
                    </div>
                  </div>
                </div>

                {/* Agenda */}
                <p className="text-xs text-vault-muted mt-3 line-clamp-2 leading-relaxed">
                  {conf.agenda}
                </p>
              </div>

              {/* Footer Details & Actions */}
              <div className="mt-5 pt-4 border-t border-vault-border/60 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-vault-muted flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-vault-teal" />
                    {conf._count?.documents || 0} DOCS · {conf._count?.speeches || 0} SPEECHES
                  </span>
                  {conf.award && (
                    <span className="text-vault-yellow font-bold flex items-center gap-1 bg-vault-yellow/10 px-2 py-0.5 rounded border border-vault-yellow/30 text-[10px]">
                      ★ {conf.award}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onSelectConference(conf.id)}
                    className="flex-1 neo-btn bg-vault-panel hover:bg-vault-subtle text-white py-1.5 text-xs font-bold rounded flex items-center justify-center gap-1 border border-vault-border"
                  >
                    WORKSPACE <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenAnalyst(conf.id)}
                    title="Run AI Research Analyst"
                    className="p-1.5 rounded bg-vault-yellow/20 hover:bg-vault-yellow/30 text-vault-yellow border border-vault-yellow/40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onOpenCoach(conf.id)}
                    title="Launch Voice Coach"
                    className="p-1.5 rounded bg-vault-coral/20 hover:bg-vault-coral/30 text-vault-coral border border-vault-coral/40"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete conference "${conf.name}" and all its documents?`)) {
                        onDeleteConference(conf.id);
                      }
                    }}
                    title="Delete conference"
                    className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
