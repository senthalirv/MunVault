"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Lock,
  ArrowUpRight,
  Sparkles,
  GitFork,
  Download,
} from "lucide-react";
import { DocumentCategory, CATEGORY_LABELS } from "@/lib/types";

interface DocumentListViewProps {
  documents: any[];
  conferences: any[];
  onOpenUploadDocument: () => void;
  onSelectDocument: (docId: string) => void;
  onOpenAnalyst: (confId: string) => void;
  onOpenConnectModal: (docId: string) => void;
}

export const DocumentListView: React.FC<DocumentListViewProps> = ({
  documents,
  conferences,
  onOpenUploadDocument,
  onSelectDocument,
  onOpenAnalyst,
  onOpenConnectModal,
}) => {
  const [selectedConf, setSelectedConf] = useState<string>("all");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filtered = documents.filter((doc) => {
    if (selectedConf !== "all" && doc.conferenceId !== selectedConf) return false;
    if (selectedCat !== "all" && doc.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title?.toLowerCase().includes(q);
      const matchContent = doc.content?.toLowerCase().includes(q);
      const matchTags = doc.tags?.toLowerCase().includes(q);
      if (!matchTitle && !matchContent && !matchTags) return false;
    }
    return true;
  });

  const categories = Object.keys(CATEGORY_LABELS) as DocumentCategory[];

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-vault-teal uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-1 bg-vault-teal inline-block"></span>
            IMMUTABLE RESEARCH & DRAFT ARCHIVE
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Document Library
          </h1>
          <p className="text-xs text-vault-muted mt-1 max-w-xl">
            GSLs, resolutions, moderated caucus notes, POI banks, and UN references—organized by conference and verified as read-only.
          </p>
        </div>

        <button
          onClick={onOpenUploadDocument}
          className="neo-btn bg-vault-teal text-vault-ink px-4 py-2.5 text-xs font-bold rounded flex items-center gap-2 hover:bg-teal-300 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> ADD DOCUMENT
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="neo-box bg-vault-card p-4 rounded-lg flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Conference Selector */}
        <div className="w-full md:w-64">
          <label className="block text-[10px] font-mono text-vault-muted uppercase mb-1">
            FILTER BY CONFERENCE:
          </label>
          <select
            value={selectedConf}
            onChange={(e) => setSelectedConf(e.target.value)}
            className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-vault-teal"
          >
            <option value="all">All Conferences ({conferences.length})</option>
            {conferences.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.committee})
              </option>
            ))}
          </select>
        </div>

        {/* Search within documents */}
        <div className="w-full md:flex-1">
          <label className="block text-[10px] font-mono text-vault-muted uppercase mb-1">
            FILTER BY KEYWORD / TAG:
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-vault-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by title, tags, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-vault-teal"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 flex-wrap border-b-2 border-vault-border pb-3">
        <button
          onClick={() => setSelectedCat("all")}
          className={`px-3 py-1 text-xs font-mono font-bold rounded border transition ${
            selectedCat === "all"
              ? "bg-vault-teal text-vault-ink border-vault-ink shadow-neo-sm"
              : "bg-vault-card/60 text-vault-muted border-vault-border hover:text-white"
          }`}
        >
          ALL FILES ({documents.length})
        </button>

        {categories.map((catKey) => {
          const meta = CATEGORY_LABELS[catKey];
          const count = documents.filter((d) => d.category === catKey).length;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCat(catKey)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded border transition flex items-center gap-1.5 ${
                selectedCat === catKey
                  ? "bg-vault-yellow text-vault-ink border-vault-ink shadow-neo-sm"
                  : "bg-vault-card/60 text-vault-muted border-vault-border hover:text-white"
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="neo-box bg-vault-card p-12 text-center text-vault-muted font-mono text-xs rounded">
          No documents found matching these filters. Click &quot;ADD DOCUMENT&quot; to upload your files.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const meta = CATEGORY_LABELS[doc.category as DocumentCategory] || CATEGORY_LABELS.RESEARCH;
            const wordCount = doc.content?.split(/\s+/).filter(Boolean).length || 0;

            return (
              <div
                key={doc.id}
                className="neo-box bg-vault-card hover:bg-vault-cardHover rounded-lg p-5 flex flex-col justify-between border-2 border-vault-border transition group"
              >
                <div>
                  {/* Top Category Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-vault-border/60">
                    <span className={`text-[10px] font-mono border px-2 py-0.5 rounded font-bold ${meta.badge}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-[10px] font-mono text-vault-teal font-bold">
                      {doc.coverageScore || 80}% COVERAGE
                    </span>
                  </div>

                  {/* Title & Conference */}
                  <h3
                    onClick={() => onSelectDocument(doc.id)}
                    className="text-sm font-bold text-white group-hover:text-vault-teal transition mt-3 cursor-pointer line-clamp-2"
                  >
                    {doc.title}
                  </h3>

                  <div className="text-[11px] font-mono text-vault-muted mt-1 truncate">
                    {doc.conference?.name} · {doc.conference?.committee}
                  </div>

                  {/* Content snippet */}
                  <p className="text-xs text-vault-dim mt-2 line-clamp-2 font-sans italic leading-relaxed">
                    &quot;{doc.content}&quot;
                  </p>
                </div>

                {/* Footer and Actions */}
                <div className="mt-4 pt-3 border-t border-vault-border/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-vault-muted flex items-center gap-1">
                    <Lock className="w-3 h-3 text-vault-yellow" /> {wordCount} words
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenConnectModal(doc.id)}
                      title="Connect node in knowledge graph"
                      className="p-1 rounded bg-vault-teal/20 hover:bg-vault-teal/30 text-vault-teal border border-vault-teal/40"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onSelectDocument(doc.id)}
                      className="px-2.5 py-1 rounded bg-vault-panel hover:bg-vault-card text-white border border-vault-border text-xs font-bold"
                    >
                      OPEN ↗
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
