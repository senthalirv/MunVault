"use client";

import React, { useState, useRef } from "react";
import { X, Upload, FileText, Lock, AlertTriangle } from "lucide-react";
import { DocumentCategory, CATEGORY_LABELS } from "@/lib/types";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  conferences: any[];
  initialConferenceId?: string;
  onSuccess: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  conferences,
  initialConferenceId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [conferenceId, setConferenceId] = useState(initialConferenceId || conferences[0]?.id || "");
  const [category, setCategory] = useState<DocumentCategory>("RESEARCH");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conferenceId) {
      setError("Please select a target conference.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (activeTab === "file") {
        if (!selectedFile) {
          throw new Error("Please select a PDF, DOCX, or TXT file to upload.");
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("conferenceId", conferenceId);
        formData.append("category", category);
        if (title) formData.append("title", title);
        if (tags) formData.append("tags", tags);

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to upload document");
        }
      } else {
        // Direct text paste
        if (!title.trim() || !content.trim()) {
          throw new Error("Please provide a title and document content.");
        }

        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conferenceId,
            category,
            title: title.trim(),
            content: content.trim(),
            tags: tags.trim() || null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save document");
        }
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
      <div className="bg-vault-card border-2 border-vault-border shadow-neo-lg rounded-lg w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-vault-panel border-b-2 border-vault-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-vault-teal" />
            <h3 className="text-sm font-mono font-bold text-white uppercase">
              ADD IMMUTABLE DOCUMENT
            </h3>
          </div>
          <button onClick={onClose} className="text-vault-muted hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Immutability Banner */}
        <div className="bg-vault-yellow/10 border-b border-vault-border px-4 py-2 flex items-center gap-2 text-[11px] font-mono text-vault-yellow">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>
            IMMUTABLE ARCHIVE: Uploaded document text is strictly read-only after submission to preserve historical authenticity.
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-vault-border bg-vault-subtle">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex-1 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "file"
                ? "border-vault-teal text-vault-teal bg-vault-card"
                : "border-transparent text-vault-muted hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> UPLOAD FILE (PDF / DOCX / TXT)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`flex-1 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === "paste"
                ? "border-vault-teal text-vault-teal bg-vault-card"
                : "border-transparent text-vault-muted hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> PASTE TEXT DIRECTLY
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-vault-coral/10 border border-vault-coral text-vault-coral text-xs rounded font-mono">
              {error}
            </div>
          )}

          {/* Conference and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Assign to Conference *
              </label>
              <select
                value={conferenceId}
                onChange={(e) => setConferenceId(e.target.value)}
                required
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal font-mono"
              >
                {conferences.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.countryFlag || "🌐"} {c.name} ({c.committee})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Asset Bucket / Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal font-mono"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.icon} {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Document Title *
            </label>
            <input
              type="text"
              placeholder="e.g. International Monitoring Mechanisms Policy Brief"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal"
            />
          </div>

          {activeTab === "file" ? (
            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Select File (PDF, DOCX, TXT, MD) *
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-vault-border hover:border-vault-teal bg-vault-subtle/50 rounded-lg p-6 text-center cursor-pointer transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-vault-muted mx-auto mb-2" />
                {selectedFile ? (
                  <div>
                    <span className="text-xs font-bold text-vault-teal">{selectedFile.name}</span>
                    <span className="text-[10px] font-mono text-vault-muted block mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to index
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-mono text-vault-text block">
                      Click to browse or drop file here
                    </span>
                    <span className="text-[10px] font-mono text-vault-muted mt-1 block">
                      Text will be extracted automatically into your searchable knowledge base.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Speech / Research Content *
              </label>
              <textarea
                rows={7}
                placeholder="Paste your speech text, research analysis, POI questions, or resolution draft clauses here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={activeTab === "paste"}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. monitoring, unhrc, sovereignty, sanctions"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-teal"
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
              {isSubmitting ? "INDEXING DOCUMENT..." : "SUBMIT & ARCHIVE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
