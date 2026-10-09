"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Database,
  Check,
  User,
} from "lucide-react";

interface SettingsViewProps {
  onReseedDatabase: () => Promise<void>;
  profileData: any;
  onRefreshProfile: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onReseedDatabase,
  profileData,
  onRefreshProfile,
}) => {
  const [isReseeding, setIsReseeding] = useState(false);
  const [reseedSuccess, setReseedSuccess] = useState(false);
  const [profileName, setProfileName] = useState(profileData?.name || "Delegate Workspace");
  const [institution, setInstitution] = useState(
    profileData?.institution || "International MUN Society"
  );
  const [country, setCountry] = useState(profileData?.country || "United Kingdom");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleReseed = async () => {
    if (
      !confirm(
        "Are you sure you want to reset and reseed sample conferences (Imperium MUN 2026, SHMUN, IPC)?"
      )
    ) {
      return;
    }
    setIsReseeding(true);
    setReseedSuccess(false);
    try {
      await onReseedDatabase();
      setReseedSuccess(true);
      setTimeout(() => setReseedSuccess(false), 3000);
    } catch (e) {
      console.error("Reseed failed:", e);
    } finally {
      setIsReseeding(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveSuccess(false);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          institution,
          country,
        }),
      });
      setSaveSuccess(true);
      onRefreshProfile();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="text-[11px] font-mono font-bold text-vault-teal uppercase tracking-wider flex items-center gap-2">
          <span className="w-3 h-1 bg-vault-teal inline-block"></span>
          WORKSPACE PREFERENCES & SYSTEM CONFIGURATION
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mt-1">
          Workspace Settings
        </h1>
        <p className="text-xs text-vault-muted mt-1 max-w-xl">
          Customize delegate profile metadata, audit immutability policies, and manage database state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Delegate Profile Card */}
        <div className="neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-vault-coral" /> DELEGATE PROFILE METADATA
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-vault-muted uppercase text-[10px] mb-1">
                Delegate Name / Workspace Title
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-white focus:border-vault-coral focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-vault-muted uppercase text-[10px] mb-1">
                Institution / School Delegation
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-white focus:border-vault-coral focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-vault-muted uppercase text-[10px] mb-1">
                Primary Delegation Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-white focus:border-vault-coral focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="neo-btn bg-vault-coral text-vault-ink px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5 hover:bg-rose-400 disabled:opacity-50 mt-2"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" /> SAVED
                </>
              ) : (
                "UPDATE PROFILE"
              )}
            </button>
          </form>
        </div>

        {/* Archival Security & Safeguards */}
        <div className="neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-vault-teal" /> ARCHIVAL SAFEGUARDS
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-vault-panel border border-vault-border rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">IMMUTABLE ARCHIVE POLICY</span>
                <span className="text-[10px] text-vault-muted">
                  Uploaded files and speeches cannot be modified inline.
                </span>
              </div>
              <span className="text-vault-teal font-bold text-[10px] bg-vault-teal/10 px-2 py-0.5 rounded border border-vault-teal/30">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-vault-panel border border-vault-border rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">ZERO-LEAK GIT CONFIGURATION</span>
                <span className="text-[10px] text-vault-muted">
                  All databases and uploads strictly ignored from git.
                </span>
              </div>
              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                SECURED
              </span>
            </div>

            <div className="p-3 bg-vault-panel border border-vault-border rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">AI PROVIDER FALLBACK</span>
                <span className="text-[10px] text-vault-muted">
                  Heuristic analysis active if runtime keys omitted.
                </span>
              </div>
              <span className="text-vault-yellow font-bold text-[10px] bg-vault-yellow/10 px-2 py-0.5 rounded border border-vault-yellow/30">
                RESILIENT
              </span>
            </div>
          </div>
        </div>

        {/* Database Management & Sample Data */}
        <div className="neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4 md:col-span-2">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-vault-yellow" /> DATABASE MANAGEMENT & SAMPLE BENCHMARK DATA
          </h3>
          <p className="text-xs text-vault-muted leading-relaxed">
            Populate your workspace with authentic MUN benchmark data (Imperium MUN 2026 UNHRC UK, SHMUN &apos;24 DISEC Sweden, and IPC Crisis France) along with pre-linked knowledge graphs, research scores, and practice records.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleReseed}
              disabled={isReseeding}
              className="neo-btn bg-vault-yellow text-vault-ink px-4 py-2 text-xs font-bold rounded flex items-center gap-2 hover:bg-yellow-400 disabled:opacity-50"
            >
              {isReseeding ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>{isReseeding ? "RESEEDING ARCHIVE..." : "RESET / RESEED BENCHMARK ARCHIVE"}</span>
            </button>
            {reseedSuccess && (
              <span className="text-xs font-mono text-vault-teal flex items-center gap-1 font-bold">
                <Check className="w-4 h-4" /> ARCHIVE SUCCESSFULLY REPOPULATED!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
