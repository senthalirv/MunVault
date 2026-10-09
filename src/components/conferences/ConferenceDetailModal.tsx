"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Mic,
  Plus,
  FileText,
  Calendar,
  Award,
  ChevronRight,
  ExternalLink,
  Trash2,
  Tag,
} from "lucide-react";
import { DocumentCategory, CATEGORY_LABELS, AWARD_TYPES } from "@/lib/types";

interface ConferenceDetailModalProps {
  conference: any;
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadDocument: (confId: string) => void;
  onOpenAnalyst: (confId: string) => void;
  onOpenCoach: (confId: string) => void;
  onSelectDocument: (docId: string) => void;
  onRefreshConference: () => void;
}

export const ConferenceDetailModal: React.FC<ConferenceDetailModalProps> = ({
  conference,
  isOpen,
  onClose,
  onOpenUploadDocument,
  onOpenAnalyst,
  onOpenCoach,
  onSelectDocument,
  onRefreshConference,
}) => {
  const [awardValue, setAwardValue] = useState(conference?.award || "");
  const [isUpdatingAward, setIsUpdatingAward] = useState(false);

  if (!isOpen || !conference) return null;

  const handleUpdateAward = async (newAward: string) => {
    setAwardValue(newAward);
    setIsUpdatingAward(true);
    try {
      await fetch(`/api/conferences/${conference.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ award: newAward || null }),
      });
      onRefreshConference();
    } catch (e) {
      console.error("Failed to update award:", e);
    } finally {
      setIsUpdatingAward(false);
    }
  };

  // Group documents by categories
  const docsByCategory: Record<string, any[]> = {};
  for (const doc of conference.documents || []) {
    if (!docsByCategory[doc.category]) {
      docsByCategory[doc.category] = [];
    }
    docsByCategory[doc.category].push(doc);
  }

  const categoryOrder: DocumentCategory[] = [
    "RESEARCH",
    "GSL",
    "MODERATED_CAUCUS",
    "UNMODERATED_CAUCUS",
    "POI",
    "RESOLUTION",
    "SMALL_NOTE",
    "REFERENCE",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-vault-card border-2 border-vault-border shadow-neo-lg rounded-lg w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-vault-panel border-b-2 border-vault-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-vault-card border-2 border-vault-border flex items-center justify-center text-2xl shadow-neo-sm">
              {conference.countryFlag || "🌐"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-white">{conference.name}</h2>
                <span className="text-[10px] font-mono bg-vault-coral/20 text-vault-coral border border-vault-coral/40 px-2 py-0.5 rounded font-bold">
                  {conference.committee}
                </span>
                <span className="text-[10px] font-mono bg-vault-teal/20 text-vault-teal border border-vault-teal/40 px-2 py-0.5 rounded font-bold">
                  {conference.portfolio}
                </span>
              </div>
              <p className="text-xs text-vault-muted mt-1 font-mono">
                {conference.date ? `Date: ${conference.date}` : "Date: Archived"} · Agenda: {conference.agenda}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-vault-muted hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action strip & Awards Bar */}
        <div className="bg-vault-subtle px-5 py-3 border-b-2 border-vault-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-vault-yellow flex items-center gap-1">
              <Award className="w-4 h-4" /> AWARD:
            </span>
            <select
              value={awardValue}
              onChange={(e) => handleUpdateAward(e.target.value)}
              className="bg-vault-panel border border-vault-border text-white text-xs rounded px-2.5 py-1 font-mono focus:border-vault-yellow focus:outline-none"
            >
              <option value="">No award logged</option>
              {AWARD_TYPES.map((a) => (
                <option key={a} value={a}>
                  ★ {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                onClose();
                onOpenAnalyst(conference.id);
              }}
              className="neo-btn bg-vault-yellow text-vault-ink px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> RUN AI ANALYST
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCoach(conference.id);
              }}
              className="neo-btn bg-vault-coral text-vault-ink px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" /> VOICE PRACTICE
            </button>
            <button
              onClick={() => onOpenUploadDocument(conference.id)}
              className="neo-btn bg-vault-teal text-vault-ink px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> ADD DOCUMENT
            </button>
          </div>
        </div>

        {/* Content Body: Categorized Asset Buckets */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {conference.notes && (
            <div className="p-3.5 rounded bg-vault-panel/80 border border-vault-border">
              <div className="text-[10px] font-mono font-bold text-vault-muted uppercase mb-1">
                CONFERENCE STRATEGY NOTES
              </div>
              <p className="text-xs text-vault-text leading-relaxed whitespace-pre-line">
                {conference.notes}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-vault-teal" /> ASSET BUCKETS & IMMUTABLE ARCHIVE (
                {conference.documents?.length || 0} FILES)
              </h3>
            </div>

            {(!conference.documents || conference.documents.length === 0) ? (
              <div className="text-center py-10 bg-vault-subtle rounded border border-vault-border/50 text-vault-muted font-mono text-xs">
                No documents uploaded for this conference yet. Click &quot;ADD DOCUMENT&quot; to upload your research, GSL, or POIs.
              </div>
            ) : (
              <div className="space-y-4">
                {categoryOrder.map((catKey) => {
                  const items = docsByCategory[catKey];
                  if (!items || items.length === 0) return null;
                  const catMeta = CATEGORY_LABELS[catKey];

                  return (
                    <div key={catKey} className="space-y-2">
                      <div className="text-[11px] font-mono font-bold text-vault-muted uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-vault-coral"></span>
                        <span>{catMeta.label}</span>
                        <span className="text-[10px] bg-vault-panel px-1.5 py-0.2 rounded border border-vault-border">
                          {items.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {items.map((doc: any) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              onClose();
                              onSelectDocument(doc.id);
                            }}
                            className="p-3 bg-vault-panel hover:bg-vault-cardHover border border-vault-border rounded cursor-pointer transition flex items-start justify-between group"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-white group-hover:text-vault-teal transition truncate">
                                {doc.title}
                              </div>
                              <div className="text-[10px] font-mono text-vault-muted mt-1 flex items-center gap-2">
                                <span>{doc.coverageScore}% COVERAGE</span>
                                {doc.tags && <span>· #{doc.tags.split(",")[0]}</span>}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-vault-muted group-hover:text-white shrink-0 ml-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
