"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Scale,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  FileText,
} from "lucide-react";

export const SpeechIntelligenceView: React.FC = () => {
  const [speeches, setSpeeches] = useState<any[]>([]);
  const [habits, setHabits] = useState<any | null>(null);
  const [speechAId, setSpeechAId] = useState<string>("");
  const [speechBId, setSpeechBId] = useState<string>("");
  const [comparison, setComparison] = useState<any | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpeechesData = async () => {
      try {
        const res = await fetch("/api/speeches");
        if (res.ok) {
          const data = await res.json();
          setSpeeches(data.speeches || []);
          setHabits(data.habits || null);
          if (data.speeches?.length >= 2) {
            setSpeechAId(data.speeches[0].id);
            setSpeechBId(data.speeches[1].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch speeches:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpeechesData();
  }, []);

  const handleCompare = async () => {
    if (!speechAId || !speechBId || speechAId === speechBId) return;
    setIsComparing(true);
    try {
      const res = await fetch("/api/speeches/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speechAId, speechBId }),
      });
      if (res.ok) {
        const data = await res.json();
        setComparison(data.comparison);
      }
    } catch (err) {
      console.error("Failed to compare speeches:", err);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="text-[11px] font-mono font-bold text-vault-lavender uppercase tracking-wider flex items-center gap-2">
          <span className="w-3 h-1 bg-vault-lavender inline-block"></span>
          ARGUMENT MINING & COMPARATIVE RHETORIC
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight mt-1">
          Speech Intelligence & Similarity Engine
        </h1>
        <p className="text-xs text-vault-muted mt-1 max-w-xl">
          Track cross-conference argument habits, framing techniques, and compare draft speeches to ensure rhetorical diversity.
        </p>
      </div>

      {/* Top Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neo-box bg-vault-card p-5 rounded-lg border-2 border-vault-border">
          <div className="flex items-center justify-between text-vault-muted text-[10px] font-mono font-bold uppercase">
            <span>Rhetorical Diversity</span>
            <TrendingUp className="w-4 h-4 text-vault-teal" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {habits?.diversityScore || 85}
            <span className="text-[10px] text-vault-muted ml-1">/ 100</span>
          </div>
          <p className="text-[11px] text-vault-muted mt-1">
            Healthy cross-topic flexibility across portfolio caucuses.
          </p>
        </div>

        <div className="neo-box bg-vault-card p-5 rounded-lg border-2 border-vault-border">
          <div className="flex items-center justify-between text-vault-muted text-[10px] font-mono font-bold uppercase">
            <span>Speeches Indexed</span>
            <FileText className="w-4 h-4 text-vault-lavender" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {String(speeches.length).padStart(2, "0")}
            <span className="text-[10px] text-vault-muted ml-1">TOTAL</span>
          </div>
          <p className="text-[11px] text-vault-muted mt-1">
            GSL, moderated caucuses, and press statements analyzed.
          </p>
        </div>

        <div className="neo-box bg-vault-card p-5 rounded-lg border-2 border-vault-border">
          <div className="flex items-center justify-between text-vault-muted text-[10px] font-mono font-bold uppercase">
            <span>Repeated Themes</span>
            <AlertCircle className="w-4 h-4 text-vault-yellow" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {habits?.mostFrequentArguments?.length || 3}
            <span className="text-[10px] text-vault-muted ml-1">PATTERNS</span>
          </div>
          <p className="text-[11px] text-vault-muted mt-1">
            Core argumentation pillars detected across committees.
          </p>
        </div>
      </div>

      {/* Two-Column Habits Breakdown: Framing Distribution vs Cross-Conference Habit Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Framing Technique Distribution */}
        <div className="lg:col-span-5 neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
          <div className="flex items-center justify-between border-b border-vault-border/60 pb-3">
            <h3 className="text-xs font-mono font-bold text-vault-teal uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4" /> FRAMING TECHNIQUES
            </h3>
            <span className="text-[10px] font-mono text-vault-muted">DELEGATE STYLE</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {habits?.framingDistribution &&
              Object.entries(habits.framingDistribution).map(([framing, count]: any) => (
                <div key={framing} className="space-y-1">
                  <div className="flex justify-between text-vault-muted">
                    <span>{framing}</span>
                    <span className="font-bold text-white">{count} speeches</span>
                  </div>
                  <div className="bg-vault-subtle h-2 rounded-full overflow-hidden border border-vault-border">
                    <div
                      className="bg-vault-lavender h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (count / Math.max(1, speeches.length)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {habits?.critique && (
            <div className="p-3 bg-vault-panel/90 border border-vault-border rounded text-xs text-vault-text leading-relaxed">
              <span className="font-bold text-vault-yellow font-mono text-[10px] block uppercase mb-1">
                AI RHETORICAL CRITIQUE:
              </span>
              {habits.critique}
            </div>
          )}
        </div>

        {/* Right: Most Frequent Arguments & Recommendations */}
        <div className="lg:col-span-7 neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
          <div className="flex items-center justify-between border-b border-vault-border/60 pb-3">
            <h3 className="text-xs font-mono font-bold text-vault-yellow uppercase tracking-wider flex items-center gap-2">
              <Brain className="w-4 h-4" /> CROSS-CONFERENCE ARGUMENT MINING
            </h3>
            <span className="text-[10px] font-mono text-vault-muted">PILLARS REUSED</span>
          </div>

          <div className="space-y-2.5">
            {habits?.mostFrequentArguments?.map((item: any, i: number) => (
              <div
                key={i}
                className="p-3 bg-vault-panel border border-vault-border rounded flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{item.argument}</div>
                  <div className="text-[10px] font-mono text-vault-muted mt-0.5">
                    Used across {item.conferences?.join(", ") || "Conferences"}
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-vault-coral bg-vault-coral/10 border border-vault-coral/30 px-2 py-0.5 rounded">
                  {item.count}X
                </span>
              </div>
            ))}
          </div>

          {habits?.recommendations?.length > 0 && (
            <div className="p-3 bg-vault-subtle border border-vault-border rounded space-y-2">
              <div className="text-[10px] font-mono font-bold text-vault-teal flex items-center gap-1 uppercase">
                <Lightbulb className="w-3.5 h-3.5" /> ACTIONABLE STRATEGY PROMPTS:
              </div>
              <ul className="text-xs text-vault-muted space-y-1 list-disc list-inside">
                {habits.recommendations.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Comparative Speech Similarity Tool */}
      <div className="neo-box bg-vault-card rounded-lg border-2 border-vault-border p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-vault-border/60 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-vault-coral" /> COMPARATIVE SPEECH SIMILARITY ENGINE
            </h3>
            <p className="text-xs text-vault-muted mt-0.5">
              Select two speeches to analyze wording overlap, framing divergence, and policy repetition.
            </p>
          </div>

          <button
            onClick={handleCompare}
            disabled={isComparing || !speechAId || !speechBId || speechAId === speechBId}
            className="neo-btn bg-vault-coral text-vault-ink px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5 hover:bg-rose-400 disabled:opacity-50 self-start sm:self-auto"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isComparing ? "CALCULATING..." : "COMPARE SPEECHES"}</span>
          </button>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono text-vault-muted uppercase mb-1 font-bold">
              SPEECH A (REFERENCE):
            </label>
            <select
              value={speechAId}
              onChange={(e) => setSpeechAId(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white font-mono focus:border-vault-coral focus:outline-none"
            >
              {speeches.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.speechType}] {s.title} ({s.conference?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-vault-muted uppercase mb-1 font-bold">
              SPEECH B (COMPARISON):
            </label>
            <select
              value={speechBId}
              onChange={(e) => setSpeechBId(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white font-mono focus:border-vault-coral focus:outline-none"
            >
              {speeches.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.speechType}] {s.title} ({s.conference?.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Result Display */}
        {comparison && (
          <div className="mt-4 p-5 bg-vault-panel/90 border border-vault-border rounded-lg space-y-4 animate-in fade-in">
            <div className="flex items-center gap-4 pb-3 border-b border-vault-border/60">
              <div className="w-16 h-16 rounded-full border-2 border-vault-ink shadow-neo bg-vault-yellow flex flex-col items-center justify-center font-black text-vault-ink shrink-0">
                <span className="text-xl leading-none">{comparison.overallSimilarity}%</span>
                <span className="text-[8px] font-mono">SIMILAR</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Structural Metric Breakdown</h4>
                <p className="text-xs text-vault-muted mt-0.5">
                  Comparative alignment across syntax, rhetorical framing, and international policy.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-vault-card rounded border border-vault-border">
                <span className="text-vault-muted block text-[10px]">WORDING SIMILARITY</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {comparison.wordingSimilarity}%
                </span>
              </div>
              <div className="p-3 bg-vault-card rounded border border-vault-border">
                <span className="text-vault-muted block text-[10px]">FRAMING SIMILARITY</span>
                <span className="text-base font-bold text-vault-lavender mt-1 block">
                  {comparison.framingSimilarity}%
                </span>
              </div>
              <div className="p-3 bg-vault-card rounded border border-vault-border">
                <span className="text-vault-muted block text-[10px]">POLICY SIMILARITY</span>
                <span className="text-base font-bold text-vault-teal mt-1 block">
                  {comparison.policySimilarity}%
                </span>
              </div>
              <div className="p-3 bg-vault-card rounded border border-vault-border">
                <span className="text-vault-muted block text-[10px]">EVIDENCE OVERLAP</span>
                <span className="text-base font-bold text-vault-yellow mt-1 block">
                  {comparison.evidenceSimilarity}%
                </span>
              </div>
            </div>

            <p className="text-xs text-vault-text leading-relaxed font-sans bg-vault-subtle p-3.5 rounded border border-vault-border">
              {comparison.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
