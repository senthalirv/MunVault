"use client";

import React, { useState, useEffect } from "react";
import {
  GitFork,
  Plus,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Info,
  Trash2,
  FolderKanban,
} from "lucide-react";
import { CATEGORY_LABELS, DocumentCategory } from "@/lib/types";

interface KnowledgeGraphViewProps {
  conferences: any[];
  initialConferenceId?: string;
  onOpenCreateConnection: (sourceDocId?: string) => void;
  onSelectDocument: (docId: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  conferences,
  initialConferenceId,
  onOpenCreateConnection,
  onSelectDocument,
}) => {
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>(
    initialConferenceId || conferences[0]?.id || "all"
  );
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGraphData = async () => {
    setIsLoading(true);
    try {
      const confQuery = selectedConferenceId !== "all" ? `?conferenceId=${selectedConferenceId}` : "";
      const [resConn, resSugg, resDocs] = await Promise.all([
        fetch(`/api/connections${confQuery}`),
        fetch(`/api/connections/suggest${confQuery}`),
        fetch(`/api/documents${confQuery}`),
      ]);

      if (resConn.ok) {
        const data = await resConn.json();
        setConnections(data.connections || []);
      }
      if (resSugg.ok) {
        const data = await resSugg.json();
        setSuggestions(data.suggestions || []);
      }
      if (resDocs.ok) {
        const data = await resDocs.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch knowledge graph data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [selectedConferenceId]);

  const handleAcceptSuggestion = async (sugg: any) => {
    try {
      const res = await fetch("/api/connections/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "accept",
          sourceDocId: sugg.sourceDocId,
          targetDocId: sugg.targetDocId,
          connectionType: sugg.connectionType,
          similarityScore: sugg.similarityScore,
          explanation: sugg.explanation,
        }),
      });

      if (res.ok) {
        setSuggestions((prev) =>
          prev.filter(
            (s) => !(s.sourceDocId === sugg.sourceDocId && s.targetDocId === sugg.targetDocId)
          )
        );
        fetchGraphData();
      }
    } catch (err) {
      console.error("Failed to accept suggestion:", err);
    }
  };

  const handleRejectSuggestion = async (sugg: any) => {
    try {
      const res = await fetch("/api/connections/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          sourceDocId: sugg.sourceDocId,
          targetDocId: sugg.targetDocId,
        }),
      });

      if (res.ok) {
        setSuggestions((prev) =>
          prev.filter(
            (s) => !(s.sourceDocId === sugg.sourceDocId && s.targetDocId === sugg.targetDocId)
          )
        );
      }
    } catch (err) {
      console.error("Failed to reject suggestion:", err);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    try {
      const res = await fetch(`/api/connections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete connection:", err);
    }
  };

  // Node placement positions in 1000x500 virtual coordinate space
  const getNodePosition = (index: number, total: number, category: string) => {
    const defaultCoords: Record<string, { x: number; y: number }> = {
      RESEARCH: { x: 180, y: 120 },
      GSL: { x: 480, y: 100 },
      MODERATED_CAUCUS: { x: 480, y: 260 },
      POI: { x: 220, y: 380 },
      RESOLUTION: { x: 800, y: 220 },
      UNMODERATED_CAUCUS: { x: 480, y: 400 },
      REFERENCE: { x: 180, y: 240 },
      SMALL_NOTE: { x: 780, y: 380 },
    };

    if (defaultCoords[category] && index < 6) {
      return defaultCoords[category];
    }

    // Circular layout fallback
    const angle = (index / Math.max(1, total)) * 2 * Math.PI;
    return {
      x: Math.round(500 + 320 * Math.cos(angle)),
      y: Math.round(250 + 170 * Math.sin(angle)),
    };
  };

  const nodeMap = new Map<string, { x: number; y: number; doc: any }>();
  documents.forEach((doc, idx) => {
    const pos = getNodePosition(idx, documents.length, doc.category);
    nodeMap.set(doc.id, { ...pos, doc });
  });

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-vault-teal uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-1 bg-vault-teal inline-block"></span>
            RELATIONAL KNOWLEDGE ENGINE
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Knowledge Graph & Connections
          </h1>
          <p className="text-xs text-vault-muted mt-1 max-w-xl">
            Trace how foundational research translates into GSL speeches, moderated caucuses, POI banks, and binding resolution clauses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-vault-card border border-vault-border rounded px-3 py-1.5 flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5 text-vault-coral" />
            <select
              value={selectedConferenceId}
              onChange={(e) => setSelectedConferenceId(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none"
            >
              <option value="all" className="bg-vault-panel text-white">
                All Conferences
              </option>
              {conferences.map((c) => (
                <option key={c.id} value={c.id} className="bg-vault-panel text-white">
                  {c.countryFlag || "🌐"} {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onOpenCreateConnection()}
            className="neo-btn bg-vault-teal text-vault-ink px-4 py-2 text-xs font-bold rounded flex items-center gap-1.5 hover:bg-teal-300"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> ADD CONNECTION
          </button>
        </div>
      </div>

      {/* AI Suggestions Callout Strip */}
      {suggestions.length > 0 && (
        <div className="neo-box bg-vault-card border-2 border-vault-yellow/60 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-vault-yellow flex items-center gap-2 uppercase">
              <Sparkles className="w-4 h-4 text-vault-yellow" /> AI AUTO-SUGGESTIONS ({suggestions.length} DETECTED)
            </div>
            <span className="text-[10px] font-mono text-vault-muted">
              SEMANTIC SIMILARITY ENGINE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.slice(0, 2).map((sugg, i) => (
              <div
                key={i}
                className="bg-vault-panel/90 border border-vault-border rounded p-3 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white font-bold flex items-center gap-1">
                      <span className="text-vault-teal">{sugg.sourceDocTitle}</span>
                      <ArrowRight className="w-3 h-3 text-vault-muted" />
                      <span className="text-vault-lavender">{sugg.targetDocTitle}</span>
                    </span>
                    <span className="text-vault-yellow font-bold bg-vault-yellow/10 px-1.5 py-0.5 rounded border border-vault-yellow/30">
                      {sugg.similarityScore}% SIMILAR
                    </span>
                  </div>
                  <p className="text-[11px] text-vault-muted mt-1 leading-snug">
                    {sugg.explanation}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-vault-border/50">
                  <button
                    onClick={() => handleRejectSuggestion(sugg)}
                    className="px-2.5 py-1 text-[11px] font-mono text-vault-muted hover:text-white flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> REJECT
                  </button>
                  <button
                    onClick={() => handleAcceptSuggestion(sugg)}
                    className="neo-btn bg-vault-teal text-vault-ink px-3 py-1 text-[11px] font-bold rounded flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 stroke-[3]" /> ACCEPT CONNECTION
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Visual Graph Canvas */}
      <div className="neo-box bg-vault-card rounded-lg border-2 border-vault-border overflow-hidden relative">
        <div className="p-3 bg-vault-panel border-b border-vault-border flex items-center justify-between text-xs font-mono">
          <span className="text-vault-muted flex items-center gap-1.5">
            <GitFork className="w-4 h-4 text-vault-teal" /> VISUAL KNOWLEDGE GRAPH
          </span>
          <span className="text-[10px] text-vault-dim">
            CLICK ANY NODE TO INSPECT ITS CONTENT & CONNECTIONS
          </span>
        </div>

        <div className="relative w-full h-[520px] bg-vault-bg/90 overflow-hidden vault-grid-bg select-none">
          {/* SVG Connecting Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            {connections.map((c) => {
              const src = nodeMap.get(c.sourceDocId);
              const tgt = nodeMap.get(c.targetDocId);
              if (!src || !tgt) return null;

              const isHighlighted =
                selectedNodeId === c.sourceDocId || selectedNodeId === c.targetDocId;

              return (
                <g key={c.id}>
                  <line
                    x1={src.x + 60}
                    y1={src.y + 25}
                    x2={tgt.x + 60}
                    y2={tgt.y + 25}
                    stroke={isHighlighted ? "#FF5C6C" : "#3D4E6B"}
                    strokeWidth={isHighlighted ? "3" : "2"}
                    strokeDasharray={isHighlighted ? "none" : "6 4"}
                  />
                  {/* Midpoint badge for similarity */}
                  <rect
                    x={(src.x + tgt.x) / 2 + 50}
                    y={(src.y + tgt.y) / 2 + 18}
                    width="42"
                    height="16"
                    rx="3"
                    fill="#151B26"
                    stroke="#293548"
                  />
                  <text
                    x={(src.x + tgt.x) / 2 + 71}
                    y={(src.y + tgt.y) / 2 + 30}
                    fill="#38E1C2"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {c.similarityScore}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Document Node Boxes */}
          {Array.from(nodeMap.values()).map(({ x, y, doc }) => {
            const isSelected = selectedNodeId === doc.id;
            const meta = CATEGORY_LABELS[doc.category as DocumentCategory] || CATEGORY_LABELS.RESEARCH;

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedNodeId(isSelected ? null : doc.id)}
                onDoubleClick={() => onSelectDocument(doc.id)}
                style={{
                  left: `${(x / 1000) * 100}%`,
                  top: `${(y / 500) * 100}%`,
                  transform: "translate(-20%, -30%)",
                }}
                className={`absolute w-44 p-3 rounded border-2 cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "bg-vault-coral text-vault-ink border-vault-ink shadow-neo scale-105 z-20"
                    : "bg-vault-card hover:bg-vault-cardHover text-white border-vault-border shadow-neo-sm z-10"
                }`}
              >
                <div className="flex items-center justify-between text-[9px] font-mono uppercase mb-1">
                  <span className={`font-bold ${isSelected ? "text-vault-ink" : "text-vault-teal"}`}>
                    {meta.label}
                  </span>
                  <span className={isSelected ? "text-vault-ink" : "text-vault-muted"}>
                    {meta.icon}
                  </span>
                </div>
                <div
                  className={`text-xs font-bold truncate ${
                    isSelected ? "text-vault-ink" : "text-white"
                  }`}
                >
                  {doc.title}
                </div>
                <div
                  className={`text-[9px] font-mono mt-1 truncate ${
                    isSelected ? "text-vault-ink/80" : "text-vault-muted"
                  }`}
                >
                  {doc.conference?.name || "Workspace"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details Drawer or Connection Table */}
      {selectedNodeId ? (
        (() => {
          const selectedDoc = documents.find((d) => d.id === selectedNodeId);
          if (!selectedDoc) return null;

          const linkedConnections = connections.filter(
            (c) => c.sourceDocId === selectedNodeId || c.targetDocId === selectedNodeId
          );

          return (
            <div className="neo-box bg-vault-card p-5 rounded-lg border-2 border-vault-border space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-vault-teal uppercase font-bold">
                    SELECTED NODE DETAILS
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedDoc.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectDocument(selectedDoc.id)}
                    className="neo-btn bg-vault-teal text-vault-ink px-3 py-1.5 text-xs font-bold rounded"
                  >
                    OPEN IMMUTABLE DOC ↗
                  </button>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-vault-muted hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-vault-panel border border-vault-border rounded font-mono text-xs text-vault-muted">
                  <span className="text-vault-dim block mb-1">SNIPPET:</span>
                  <p className="line-clamp-3 text-vault-text font-sans italic">
                    &quot;{selectedDoc.content}&quot;
                  </p>
                </div>

                <div className="p-3 bg-vault-panel border border-vault-border rounded space-y-2">
                  <span className="text-[10px] font-mono font-bold text-vault-yellow uppercase block">
                    ACTIVE GRAPH CONNECTIONS ({linkedConnections.length})
                  </span>
                  {linkedConnections.length === 0 ? (
                    <p className="text-xs text-vault-muted font-mono">No links established yet.</p>
                  ) : (
                    linkedConnections.map((c) => {
                      const otherDoc =
                        c.sourceDocId === selectedNodeId ? c.targetDoc : c.sourceDoc;
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between text-xs font-mono p-1.5 bg-vault-card rounded border border-vault-border/60"
                        >
                          <span className="text-white truncate max-w-[200px]">
                            {otherDoc?.title || "Connected Node"}
                          </span>
                          <span className="text-vault-teal font-bold">{c.similarityScore}%</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        /* Full Connections Table */
        <div className="neo-box bg-vault-card rounded-lg border-2 border-vault-border overflow-hidden">
          <div className="p-4 bg-vault-panel border-b border-vault-border flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <GitFork className="w-4 h-4 text-vault-teal" /> ALL ACTIVE KNOWLEDGE CONNECTIONS (
              {connections.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-vault-subtle text-vault-muted border-b border-vault-border">
                <tr>
                  <th className="p-3">SOURCE DOCUMENT</th>
                  <th className="p-3">RELATION</th>
                  <th className="p-3">TARGET DOCUMENT</th>
                  <th className="p-3">SIMILARITY</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border/50">
                {connections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-vault-muted">
                      No document connections established yet. Click &quot;ADD CONNECTION&quot; above.
                    </td>
                  </tr>
                ) : (
                  connections.map((c) => (
                    <tr key={c.id} className="hover:bg-vault-cardHover transition">
                      <td className="p-3 text-white font-bold max-w-xs truncate">
                        {c.sourceDoc?.title}
                      </td>
                      <td className="p-3 text-vault-teal font-bold">{c.connectionType}</td>
                      <td className="p-3 text-white font-bold max-w-xs truncate">
                        {c.targetDoc?.title}
                      </td>
                      <td className="p-3">
                        <span className="text-vault-yellow font-bold bg-vault-yellow/10 px-2 py-0.5 rounded border border-vault-yellow/30">
                          {c.similarityScore}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteConnection(c.id)}
                          className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          title="Remove Connection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
