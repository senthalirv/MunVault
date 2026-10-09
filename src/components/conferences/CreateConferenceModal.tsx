"use client";

import React, { useState } from "react";
import { X, FolderPlus } from "lucide-react";
import { AWARD_TYPES } from "@/lib/types";

interface CreateConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateConferenceModal: React.FC<CreateConferenceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [committee, setCommittee] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [agenda, setAgenda] = useState("");
  const [notes, setNotes] = useState("");
  const [award, setAward] = useState("");
  const [status, setStatus] = useState("active");
  const [countryFlag, setCountryFlag] = useState("🌐");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !committee || !portfolio || !agenda) {
      setError("Please fill in Conference Name, Committee, Portfolio, and Agenda.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/conferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          date: date || null,
          committee,
          portfolio,
          agenda,
          notes,
          award: award || null,
          status,
          countryFlag,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create conference");
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
            <FolderPlus className="w-4 h-4 text-vault-coral" />
            <h3 className="text-sm font-mono font-bold text-white uppercase">
              NEW MUN CONFERENCE WORKSPACE
            </h3>
          </div>
          <button onClick={onClose} className="text-vault-muted hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-vault-coral/10 border border-vault-coral text-vault-coral text-xs rounded font-mono">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Conference Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Imperium MUN 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Date (or Month/Year)
              </label>
              <input
                type="text"
                placeholder="e.g. 2026-03-15 or March 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Committee *
              </label>
              <input
                type="text"
                placeholder="e.g. UNHRC, DISEC, UNSC"
                value={committee}
                onChange={(e) => setCommittee(e.target.value)}
                required
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Portfolio / Country *
              </label>
              <input
                type="text"
                placeholder="e.g. United Kingdom"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                required
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Flag Emoji
              </label>
              <input
                type="text"
                placeholder="e.g. 🇬🇧, 🇸🇪, 🇫🇷"
                value={countryFlag}
                onChange={(e) => setCountryFlag(e.target.value)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Agenda Topic *
            </label>
            <input
              type="text"
              placeholder="e.g. Protection of Religious Minorities and Freedom of Belief"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              required
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
              >
                <option value="active">In Progress (Active)</option>
                <option value="past">Past Conference</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
                Award Won (Optional)
              </label>
              <select
                value={award}
                onChange={(e) => setAward(e.target.value)}
                className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
              >
                <option value="">No award yet</option>
                {AWARD_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-vault-muted uppercase mb-1 font-bold">
              Conference Notes / Strategy Memo
            </label>
            <textarea
              rows={3}
              placeholder="Key bloc partners, chair temperament, crisis guidelines..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-vault-coral"
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
              className="neo-btn bg-vault-coral text-vault-ink px-5 py-2 text-xs font-bold rounded hover:bg-rose-400 disabled:opacity-50"
            >
              {isSubmitting ? "CREATING WORKSPACE..." : "CREATE WORKSPACE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
