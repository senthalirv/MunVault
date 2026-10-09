"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Plus, Bell, X, FileText, FolderKanban, Sparkles } from "lucide-react";
import { ViewType } from "./Sidebar";

interface TopbarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenCreateConference: () => void;
  onOpenUploadDocument: () => void;
  onSelectDocument?: (docId: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreateConference,
  onOpenUploadDocument,
  onSelectDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    conferences: any[];
    documents: any[];
    totalHits: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSearchModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Perform search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchModal(true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const viewTitles: Record<ViewType, string> = {
    dashboard: "DASHBOARD",
    conferences: "CONFERENCE WORKSPACE",
    documents: "DOCUMENT ARCHIVE",
    analyst: "AI RESEARCH ANALYST",
    connections: "KNOWLEDGE GRAPH",
    speeches: "SPEECH INTELLIGENCE",
    coach: "MUN COACH & VOICE LAB",
    settings: "WORKSPACE SETTINGS",
  };

  return (
    <>
      <header className="h-16 border-b-2 border-vault-border bg-vault-panel/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-vault-muted">
          <span className="text-vault-dim font-bold">MUNVAULT</span>
          <span>/</span>
          <span className="text-vault-coral font-bold tracking-wider">
            {viewTitles[currentView]}
          </span>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3">
          {/* Universal Search Input */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-vault-bg border-2 border-vault-border px-3 py-1.5 rounded shadow-neo-sm focus-within:border-vault-coral focus-within:ring-1 focus-within:ring-vault-coral/50 transition-all w-72">
              <Search className="w-3.5 h-3.5 text-vault-muted shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search archive, speeches, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults) setShowSearchModal(true);
                }}
                className="bg-transparent text-xs text-white placeholder-vault-muted/70 focus:outline-none w-full"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults(null);
                    setShowSearchModal(false);
                  }}
                  className="text-vault-muted hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="text-[10px] font-mono bg-vault-panel px-1.5 py-0.5 border border-vault-border rounded text-vault-dim">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <button
            onClick={onOpenCreateConference}
            className="neo-btn bg-vault-yellow text-vault-ink px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded hover:bg-yellow-400"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">NEW CONFERENCE</span>
          </button>

          <button
            onClick={onOpenUploadDocument}
            className="neo-btn bg-vault-teal text-vault-ink px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded hover:bg-teal-300"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">ADD DOCUMENT</span>
          </button>
        </div>
      </header>

      {/* Universal Search Results Flyout */}
      {showSearchModal && searchResults && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-vault-card border-2 border-vault-border shadow-neo-lg rounded w-full max-w-2xl max-h-[75vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b-2 border-vault-border flex items-center justify-between bg-vault-panel">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-vault-coral" />
                <span className="text-xs font-mono font-bold text-white">
                  SEARCH RESULTS FOR &quot;{searchQuery}&quot;
                </span>
                <span className="text-[10px] font-mono bg-vault-subtle text-vault-muted px-2 py-0.5 rounded border border-vault-border">
                  {searchResults.totalHits} MATCHES
                </span>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-vault-muted hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto space-y-4">
              {searchResults.totalHits === 0 ? (
                <div className="text-center py-10 text-vault-muted font-mono text-xs">
                  No records found matching &quot;{searchQuery}&quot;. Try terms like &quot;GSL&quot;, &quot;Sovereignty&quot;, &quot;Minorities&quot;, or &quot;Imperium&quot;.
                </div>
              ) : (
                <>
                  {/* Conferences */}
                  {searchResults.conferences.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono font-bold text-vault-yellow uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FolderKanban className="w-3 h-3" /> MATCHING CONFERENCES
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.conferences.map((conf) => (
                          <div
                            key={conf.id}
                            onClick={() => {
                              setShowSearchModal(false);
                              onNavigate("conferences");
                            }}
                            className="p-2.5 bg-vault-panel hover:bg-vault-subtle border border-vault-border rounded cursor-pointer transition flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{conf.countryFlag || "🌐"}</span>
                                <span>{conf.name}</span>
                                <span className="text-[10px] font-mono bg-vault-card px-1.5 py-0.5 rounded border border-vault-border text-vault-coral">
                                  {conf.committee}
                                </span>
                              </div>
                              <div className="text-[11px] text-vault-muted mt-0.5">
                                {conf.portfolio} · {conf.agenda}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-vault-dim">VIEW ↗</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {searchResults.documents.length > 0 && (
                    <div>
                      <div className="text-[10px] font-mono font-bold text-vault-teal uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> MATCHING DOCUMENTS
                      </div>
                      <div className="space-y-1.5">
                        {searchResults.documents.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setShowSearchModal(false);
                              onNavigate("documents");
                              if (onSelectDocument) onSelectDocument(doc.id);
                            }}
                            className="p-2.5 bg-vault-panel hover:bg-vault-subtle border border-vault-border rounded cursor-pointer transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{doc.title}</span>
                                <span className="text-[9px] font-mono bg-vault-card px-1.5 py-0.5 rounded border border-vault-border text-vault-lavender">
                                  {doc.category}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-vault-dim">
                                {doc.conference?.name}
                              </span>
                            </div>
                            {doc.snippet && (
                              <p className="text-[11px] text-vault-muted mt-1 font-sans line-clamp-2 italic bg-vault-card/40 p-1.5 rounded border border-vault-border/50">
                                &quot;{doc.snippet}&quot;
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
