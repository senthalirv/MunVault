"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Printer,
  ShieldCheck,
  RefreshCw,
  FolderKanban,
} from "lucide-react";

interface ResearchAnalystViewProps {
  conferences: any[];
  initialConferenceId?: string;
}

export const ResearchAnalystView: React.FC<ResearchAnalystViewProps> = ({
  conferences,
  initialConferenceId,
}) => {
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>(
    initialConferenceId || conferences[0]?.id || ""
  );
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedConf = conferences.find((c) => c.id === selectedConferenceId) || conferences[0];

  useEffect(() => {
    if (!selectedConferenceId) return;

    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analyst/${selectedConferenceId}`);
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data.analysis);
        }
      } catch (err: any) {
        console.error("Failed to fetch analysis:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [selectedConferenceId]);

  const handleRunAnalysis = async () => {
    if (!selectedConferenceId) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyst/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceId: selectedConferenceId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to run analysis");
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreBars = analysis
    ? [
        { label: "Sources & Empirical Evidence", val: analysis.sourcesScore, color: "bg-vault-teal" },
        { label: "Country Position & Policy", val: analysis.countryPositionScore, color: "bg-vault-teal" },
        { label: "UN Precedents & Mechanisms", val: analysis.unPrecedentsScore, color: "bg-vault-teal" },
        { label: "Existing Resolutions", val: analysis.resolutionsScore, color: "bg-vault-teal" },
        { label: "Historical Background", val: analysis.historicalScore, color: "bg-vault-lavender" },
        { label: "Opposition Arguments", val: analysis.oppositionScore, color: "bg-vault-yellow" },
        { label: "Implementation & Funding", val: analysis.implementationScore, color: "bg-vault-coral" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header and Conference Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-vault-yellow uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-1 bg-vault-yellow inline-block"></span>
            AI RESEARCH ANALYST & DOSSIER AUDIT
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Research Score & Audit
          </h1>
          <p className="text-xs text-vault-muted mt-1 max-w-xl">
            Automated intelligence audit across country posture, legal precedents, resolution phrasing, and opposition counterarguments.
          </p>
        </div>

        {/* Conference Selector + Run Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-vault-card border border-vault-border rounded px-3 py-1.5 flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5 text-vault-coral" />
            <select
              value={selectedConferenceId}
              onChange={(e) => setSelectedConferenceId(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none"
            >
              {conferences.map((c) => (
                <option key={c.id} value={c.id} className="bg-vault-panel text-white">
                  {c.countryFlag || "🌐"} {c.name} ({c.committee})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="neo-btn bg-vault-yellow text-vault-ink px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5 hover:bg-yellow-400 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isAnalyzing ? "EVALUATING DOSSIER..." : "RUN ANALYSIS"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-vault-coral/10 border border-vault-coral text-vault-coral text-xs rounded font-mono">
          {error}
        </div>
      )}

      {/* Main Analysis Panels */}
      {!analysis ? (
        <div className="neo-box bg-vault-card p-12 text-center rounded">
          <Sparkles className="w-8 h-8 text-vault-yellow mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white uppercase font-mono">
            NO RESEARCH AUDIT RUN YET FOR {selectedConf?.name?.toUpperCase() || "THIS CONFERENCE"}
          </h3>
          <p className="text-xs text-vault-muted mt-1 max-w-md mx-auto">
            Click &quot;RUN ANALYSIS&quot; above to evaluate all uploaded research materials, speeches, and working papers for this conference.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="mt-4 neo-btn bg-vault-yellow text-vault-ink px-5 py-2 text-xs font-bold rounded inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" /> START RESEARCH AUDIT
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Two-Col Score Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Intro Card */}
            <div className="lg:col-span-5 neo-box bg-gradient-to-br from-vault-card to-vault-panel p-6 rounded-lg border-2 border-vault-border flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-vault-yellow">
                  REPORT / {selectedConf?.portfolio?.toUpperCase()} · {selectedConf?.committee}
                </div>
                <h2 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">
                  Know your<br />
                  <span className="text-vault-coral">blind spots</span> before the floor.
                </h2>
                <p className="text-xs text-vault-muted mt-2 leading-relaxed">
                  Strong research is more than stockpiling links. Ensure your delegation balances legalist UN precedents with realistic funding pipelines and unassailable answers to hostile bloc challenges.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-vault-border/60 flex items-center justify-between text-xs font-mono">
                <span className="text-vault-muted">DOSSIER STATUS:</span>
                <span className="text-vault-teal font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> AUDITED BY MUNVAULT AI
                </span>
              </div>
            </div>

            {/* Right Score Panel */}
            <div className="lg:col-span-7 neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-5">
              {/* Score Circle & Summary */}
              <div className="flex items-center gap-5 pb-4 border-b border-vault-border/60">
                <div className="w-20 h-20 rounded-full border-2 border-vault-ink shadow-neo bg-vault-coral flex flex-col items-center justify-center font-black text-vault-ink shrink-0">
                  <span className="text-2xl leading-none">{analysis.overallScore}</span>
                  <span className="text-[9px] font-mono tracking-tighter">/ 10 SCORE</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {analysis.overallScore >= 8.0
                      ? "Formidable Preparation Foundation."
                      : analysis.overallScore >= 7.0
                      ? "Solid Foundation with Key Vulnerabilities."
                      : "Preliminary Preparation Dossier."}
                  </h3>
                  <p className="text-xs text-vault-muted mt-0.5">
                    Highest leverage next step: fortify funding mechanisms & counterarguments.
                  </p>
                </div>
              </div>

              {/* Categorized Metric Progress Bars */}
              <div className="space-y-2.5">
                {scoreBars.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-12 items-center gap-2 text-xs font-mono"
                  >
                    <span className="col-span-5 text-vault-muted truncate">{item.label}</span>
                    <div className="col-span-6 bg-vault-subtle h-2.5 rounded-full overflow-hidden border border-vault-border">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${item.val}%` }}
                      />
                    </div>
                    <span className="col-span-1 text-right font-bold text-white">
                      {Math.round(item.val)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Missing Areas Warning Callout */}
              {analysis.missingAreas?.length > 0 && (
                <div className="p-3 bg-vault-coral/15 border-2 border-vault-coral/60 rounded text-xs font-mono text-white">
                  <div className="font-bold text-vault-coral flex items-center gap-1.5 uppercase mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> CRITICAL BLIND SPOTS IDENTIFIED
                  </div>
                  <div className="text-vault-text/90 leading-relaxed">
                    {analysis.missingAreas.join(" · ")}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Two-Column Deep Dive: Strong Areas vs Detailed Strategic Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Strong Areas */}
            <div className="lg:col-span-4 neo-box bg-vault-card p-5 rounded-lg border-2 border-vault-border space-y-3">
              <h3 className="text-xs font-mono font-bold text-vault-teal uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> VERIFIED STRENGTHS
              </h3>
              <div className="space-y-2">
                {analysis.strongAreas?.map((item: string, i: number) => (
                  <div
                    key={i}
                    className="p-2.5 bg-vault-panel border border-vault-border rounded flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-vault-teal mt-1.5 shrink-0" />
                    <span className="text-xs text-vault-text leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Explanatory Feedback */}
            <div className="lg:col-span-8 neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
              <h3 className="text-xs font-mono font-bold text-vault-yellow uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> STRATEGIC DEBRIEF & ACTION PLAN
              </h3>
              <div className="p-4 bg-vault-panel/90 border border-vault-border rounded font-sans text-xs text-vault-text leading-relaxed whitespace-pre-wrap">
                {analysis.feedback}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
