"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Download,
  Share2,
  Trash2,
  GitFork,
  Sparkles,
  Copy,
  Check,
  Tag,
  ArrowRight,
} from "lucide-react";
import { DocumentCategory, CATEGORY_LABELS } from "@/lib/types";

interface DocumentDetailModalProps {
  document: any;
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal: (docId: string) => void;
  onOpenAnalyst: (confId: string) => void;
  onDeleteDocument: (docId: string) => void;
  onRefresh: () => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onOpenConnectModal,
  onOpenAnalyst,
  onDeleteDocument,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>(
    doc?.category || "RESEARCH"
  );
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  if (!isOpen || !doc) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCategoryChange = async (newCat: DocumentCategory) => {
    setSelectedCategory(newCat);
    setIsUpdatingCategory(true);
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCat }),
      });
      onRefresh();
    } catch (e) {
      console.error("Failed to move category:", e);
    } finally {
      setIsUpdatingCategory(false);
    }
  };

  const categoryMeta = CATEGORY_LABELS[doc.category as DocumentCategory] || CATEGORY_LABELS.RESEARCH;
  const wordCount = doc.content?.split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-vault-card border-2 border-vault-border shadow-neo-lg rounded-lg w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-vault-panel border-b-2 border-vault-border flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded bg-vault-card border border-vault-border flex items-center justify-center text-lg font-black text-vault-teal shrink-0">
              {categoryMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{doc.title}</h2>
                <span className={`text-[10px] font-mono border px-2 py-0.5 rounded font-bold ${categoryMeta.badge}`}>
                  {categoryMeta.label}
                </span>
                <span className="text-[10px] font-mono bg-vault-yellow/10 text-vault-yellow border border-vault-yellow/30 px-2 py-0.5 rounded flex items-center gap-1">
                  <Lock className="w-3 h-3" /> IMMUTABLE ARCHIVE
                </span>
              </div>
              <div className="text-[11px] font-mono text-vault-muted mt-1">
                {doc.conference?.name} · {doc.conference?.committee} ({doc.conference?.portfolio}) · {wordCount} words
              </div>
            </div>
          </div>

          <button onClick={onClose} className="text-vault-muted hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="bg-vault-subtle px-5 py-2.5 border-b-2 border-vault-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-vault-muted">MOVE CATEGORY:</span>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as DocumentCategory)}
              disabled={isUpdatingCategory}
              className="bg-vault-panel border border-vault-border text-white text-xs rounded px-2 py-1 font-mono focus:border-vault-teal focus:outline-none"
            >
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-vault-panel hover:bg-vault-card text-vault-text border border-vault-border flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-vault-teal" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED" : "COPY TEXT"}</span>
            </button>

            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                download
                className="px-2.5 py-1 rounded bg-vault-panel hover:bg-vault-card text-vault-text border border-vault-border flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> DOWNLOAD FILE
              </a>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenConnectModal(doc.id);
              }}
              className="neo-btn bg-vault-teal text-vault-ink px-3 py-1 text-xs font-bold rounded flex items-center gap-1"
            >
              <GitFork className="w-3.5 h-3.5" /> CONNECT NODE
            </button>

            <button
              onClick={() => {
                if (confirm(`Delete document "${doc.title}" from your archive?`)) {
                  onDeleteDocument(doc.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
              title="Delete Document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Main Document Reader */}
          <div className="lg:col-span-8 p-6 overflow-y-auto bg-vault-bg/60 border-b-2 lg:border-b-0 lg:border-r-2 border-vault-border">
            <div className="font-mono text-[11px] text-vault-dim uppercase tracking-wider mb-3">
              IMMUTABLE DOCUMENT BODY (READ-ONLY)
            </div>
            <div className="bg-vault-panel/90 border border-vault-border rounded p-5 font-mono text-xs text-vault-text whitespace-pre-wrap leading-relaxed select-text">
              {doc.content}
            </div>

            {doc.tags && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <Tag className="w-3.5 h-3.5 text-vault-muted" />
                {doc.tags.split(",").map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono bg-vault-card border border-vault-border text-vault-teal px-2 py-0.5 rounded"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar: Knowledge Connections */}
          <div className="lg:col-span-4 p-5 overflow-y-auto bg-vault-subtle space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-vault-coral" /> KNOWLEDGE GRAPH LINKS
              </h3>
              <p className="text-[10px] font-mono text-vault-muted mt-1">
                Connected documents tracing your argumentation flow.
              </p>
            </div>

            {/* Outgoing links */}
            <div className="space-y-2">
              {(!doc.sourceLinks?.length && !doc.targetLinks?.length) ? (
                <div className="p-4 rounded bg-vault-panel border border-vault-border/60 text-center font-mono text-xs text-vault-muted">
                  No connections linked yet. Click &quot;CONNECT NODE&quot; to link to a speech or resolution.
                </div>
              ) : (
                <>
                  {doc.sourceLinks?.map((link: any) => (
                    <div
                      key={link.id}
                      className="p-3 rounded bg-vault-panel border border-vault-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-vault-teal font-bold">{link.connectionType}</span>
                        <span className="text-vault-yellow font-bold">{link.similarityScore}% SIM</span>
                      </div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-vault-muted shrink-0" />
                        <span className="truncate">{link.targetDoc?.title}</span>
                      </div>
                      {link.explanation && (
                        <p className="text-[10px] text-vault-muted italic leading-snug">
                          {link.explanation}
                        </p>
                      )}
                    </div>
                  ))}

                  {doc.targetLinks?.map((link: any) => (
                    <div
                      key={link.id}
                      className="p-3 rounded bg-vault-panel border border-vault-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-vault-lavender font-bold">{link.connectionType}</span>
                        <span className="text-vault-yellow font-bold">{link.similarityScore}% SIM</span>
                      </div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-vault-muted shrink-0 rotate-180" />
                        <span className="truncate">{link.sourceDoc?.title}</span>
                      </div>
                      {link.explanation && (
                        <p className="text-[10px] text-vault-muted italic leading-snug">
                          {link.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="pt-2 border-t border-vault-border/60">
              <button
                onClick={() => {
                  onClose();
                  onOpenAnalyst(doc.conferenceId);
                }}
                className="w-full neo-btn bg-vault-yellow text-vault-ink py-2 text-xs font-bold rounded flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> ANALYZE IN CONFERENCE DOSSIER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
