"use client";

import React, { useState } from "react";
import { X, GitFork } from "lucide-react";

interface CreateConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: any[];
  initialSourceDocId?: string;
  onSuccess: () => void;
}

export const CreateConnectionModal: React.FC<CreateConnectionModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialSourceDocId,
  onSuccess,
}) => {
  const [sourceDocId, setSourceDocId] = useState(initialSourceDocId || documents[0]?.id || "");
  const [targetDocId, setTargetDocId] = useState(
    documents.find((d) => d.id !== (initialSourceDocId || documents[0]?.id))?.id || ""
  );
  const [connectionType, setConnectionType] = useState("RESEARCH_TO_SPEECH");
  const [explanation, setExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceDocId || !targetDocId) {
      setError("Please select both source and target documents.");
      return;
    }
    if (sourceDocId === targetDocId) {
      setError("Cannot connect a document to itself.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDocId,
          targetDocId,
          connectionType,
          explanation: explanation.trim() || "Manual relation established by delegate.",
          similarityScore: 82.0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create connection");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-vault-card border-2 border-vault-border shadow-neo-lg rounded-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-vault-panel border-b-2 border-vault-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-vault-teal" />
            <h3 className="text-sm font-mono font-bold text-white uppercase">
              LINK KNOWLEDGE GRAPH NODES
            </h3>
          </div>
          <button onClick={onClose} className="text-vault-muted hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-vault-coral/10 border border-vault-coral text-vault-coral text-xs rounded font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Source Document (Origin) *
            </label>
            <select
              value={sourceDocId}
              onChange={(e) => setSourceDocId(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal font-mono"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.category}] {d.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Target Document (Destination) *
            </label>
            <select
              value={targetDocId}
              onChange={(e) => setTargetDocId(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal font-mono"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.category}] {d.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Relationship Type
            </label>
            <select
              value={connectionType}
              onChange={(e) => setConnectionType(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal font-mono"
            >
              <option value="RESEARCH_TO_SPEECH">Research → GSL Speech</option>
              <option value="SPEECH_TO_CAUCUS">GSL → Moderated Caucus</option>
              <option value="SPEECH_TO_POI">Speech → POI Bank</option>
              <option value="RESEARCH_TO_RESOLUTION">Research → Draft Resolution</option>
              <option value="POI_TO_RESOLUTION">POI → Resolution Operative Clause</option>
              <option value="THEMATIC">Thematic Cross-Reference</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Relationship Rationale / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. This research document provides the primary statistical grounding for operative clause 4..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal font-mono"
            />
          </div>

          <div className="pt-3 border-t border-vault-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-vault-muted hover:text-white"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="neo-btn bg-vault-teal text-vault-ink px-5 py-2 text-xs font-bold rounded hover:bg-teal-300 disabled:opacity-50"
            >
              {isSubmitting ? "LINKING..." : "CREATE CONNECTION"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
