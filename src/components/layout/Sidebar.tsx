"use client";

import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Sparkles,
  GitFork,
  Mic,
  Brain,
  Settings,
  Flame,
  Award,
} from "lucide-react";

export type ViewType =
  | "dashboard"
  | "conferences"
  | "documents"
  | "analyst"
  | "connections"
  | "speeches"
  | "coach"
  | "settings";

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  stats?: {
    conferences: number;
    documents: number;
    speeches: number;
    awards: number;
    practiceStreak: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  stats = { conferences: 3, documents: 9, speeches: 2, awards: 3, practiceStreak: 4 },
}) => {
  const navItems: Array<{
    id: ViewType;
    label: string;
    icon: React.ReactNode;
    count?: number | string;
    highlight?: boolean;
  }> = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: "conferences",
      label: "Conferences",
      icon: <FolderKanban className="w-4 h-4" />,
      count: String(stats.conferences).padStart(2, "0"),
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FileText className="w-4 h-4" />,
      count: String(stats.documents).padStart(2, "0"),
    },
    {
      id: "analyst",
      label: "AI Analyst",
      icon: <Sparkles className="w-4 h-4 text-vault-yellow" />,
      highlight: true,
    },
    {
      id: "connections",
      label: "Knowledge Graph",
      icon: <GitFork className="w-4 h-4 text-vault-teal" />,
    },
    {
      id: "speeches",
      label: "Speech Intel",
      icon: <Brain className="w-4 h-4 text-vault-lavender" />,
      count: String(stats.speeches).padStart(2, "0"),
    },
    {
      id: "coach",
      label: "MUN Coach",
      icon: <Mic className="w-4 h-4 text-vault-coral" />,
      highlight: true,
    },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-vault-panel border-r-2 border-vault-border flex flex-col h-screen sticky top-0 shrink-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b-2 border-vault-border/80 flex items-center gap-3">
        <div className="w-10 h-10 bg-vault-coral border-2 border-vault-ink shadow-neo-sm flex items-center justify-center font-black text-vault-ink text-base tracking-tighter -rotate-3 transition-transform hover:rotate-0">
          MV
        </div>
        <div>
          <div className="font-extrabold text-base tracking-wide text-white flex items-center gap-1">
            MUN<span className="text-vault-coral">VAULT</span>
          </div>
          <p className="text-[9px] font-mono tracking-widest text-vault-muted uppercase">
            DELEGATE COMMAND CENTER
          </p>
        </div>
      </div>

      {/* Navigation section */}
      <div className="px-3 pt-4 pb-2">
        <span className="text-[10px] font-mono tracking-wider text-vault-dim uppercase px-2 font-semibold">
          WORKSPACE NAVIGATION
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded border transition-all duration-150 ${
                isActive
                  ? "bg-vault-coral text-vault-ink border-vault-ink shadow-neo translate-x-1"
                  : "bg-vault-card/40 text-vault-text hover:bg-vault-card hover:text-white border-transparent hover:border-vault-border"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? "text-vault-ink" : ""}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.count && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    isActive
                      ? "bg-vault-ink text-vault-coral border-vault-ink"
                      : "bg-vault-subtle text-vault-muted border-vault-border"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage and Profile Widget */}
      <div className="p-3 border-t-2 border-vault-border space-y-3 bg-vault-subtle">
        {/* Practice streak badge */}
        <div className="bg-vault-card border border-vault-border p-2.5 rounded shadow-neo-sm">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
            <span className="flex items-center gap-1.5 text-vault-yellow">
              <Flame className="w-3.5 h-3.5 fill-vault-yellow" /> PRACTICE STREAK
            </span>
            <span className="text-white bg-vault-subtle px-1.5 py-0.5 rounded border border-vault-border">
              {stats.practiceStreak} DAYS
            </span>
          </div>
          <div className="w-full bg-vault-panel h-1.5 rounded-full mt-2 overflow-hidden border border-vault-border">
            <div
              className="bg-vault-yellow h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.practiceStreak * 25)}%` }}
            />
          </div>
        </div>

        {/* User Workspace Info */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-8 h-8 rounded bg-vault-blue border border-vault-border flex items-center justify-center font-bold text-xs text-white shadow-neo-sm">
            MV
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">Delegate Workspace</div>
            <div className="text-[9px] font-mono text-vault-muted truncate">
              {stats.awards} AWARDS WON · ARCHIVE V1
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
