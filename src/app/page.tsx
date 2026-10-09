"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, ViewType } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ConferenceListView } from "@/components/conferences/ConferenceListView";
import { ConferenceDetailModal } from "@/components/conferences/ConferenceDetailModal";
import { CreateConferenceModal } from "@/components/conferences/CreateConferenceModal";
import { DocumentListView } from "@/components/documents/DocumentListView";
import { DocumentDetailModal } from "@/components/documents/DocumentDetailModal";
import { UploadDocumentModal } from "@/components/documents/UploadDocumentModal";
import { ResearchAnalystView } from "@/components/analyst/ResearchAnalystView";
import { KnowledgeGraphView } from "@/components/connections/KnowledgeGraphView";
import { CreateConnectionModal } from "@/components/connections/CreateConnectionModal";
import { SpeechIntelligenceView } from "@/components/speeches/SpeechIntelligenceView";
import { MUNCoachView } from "@/components/coach/MUNCoachView";
import { SettingsView } from "@/components/settings/SettingsView";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [profileData, setProfileData] = useState<any | null>(null);
  const [conferences, setConferences] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [activeConferenceId, setActiveConferenceId] = useState<string>("");
  const [activeDocumentId, setActiveDocumentId] = useState<string>("");

  // Modals
  const [isCreateConfOpen, setIsCreateConfOpen] = useState(false);
  const [isConfDetailOpen, setIsConfDetailOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isDocDetailOpen, setIsDocDetailOpen] = useState(false);
  const [isCreateConnectOpen, setIsCreateConnectOpen] = useState(false);
  const [connectSourceDocId, setConnectSourceDocId] = useState<string | undefined>(undefined);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch core data
  const loadData = async () => {
    try {
      const [resProfile, resConfs, resDocs] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/conferences"),
        fetch("/api/documents"),
      ]);

      if (resProfile.ok) {
        const d = await resProfile.json();
        setProfileData(d);
      }
      if (resConfs.ok) {
        const d = await resConfs.json();
        setConferences(d.conferences || []);
        if (d.conferences?.length > 0 && !activeConferenceId) {
          setActiveConferenceId(d.conferences[0].id);
        }
      }
      if (resDocs.ok) {
        const d = await resDocs.json();
        setDocuments(d.documents || []);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectConference = (confId: string) => {
    setActiveConferenceId(confId);
    setIsConfDetailOpen(true);
  };

  const handleSelectDocument = (docId: string) => {
    setActiveDocumentId(docId);
    setIsDocDetailOpen(true);
  };

  const handleOpenAnalystForConf = (confId: string) => {
    setActiveConferenceId(confId);
    setCurrentView("analyst");
  };

  const handleOpenCoachForConf = (confId: string) => {
    setActiveConferenceId(confId);
    setCurrentView("coach");
  };

  const handleOpenConnectModal = (sourceDocId?: string) => {
    setConnectSourceDocId(sourceDocId);
    setIsCreateConnectOpen(true);
  };

  const handleDeleteConference = async (confId: string) => {
    try {
      const res = await fetch(`/api/conferences/${confId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Conference workspace deleted.");
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete conference:", err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Document deleted from archive.");
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const handleReseed = async () => {
    const res = await fetch("/api/seed", { method: "POST" });
    if (res.ok) {
      await loadData();
      showToast("Benchmark archive reloaded with authentic sample records!");
    }
  };

  // Active items for modals
  const activeConference = conferences.find((c) => c.id === activeConferenceId);
  const activeDocument = documents.find((d) => d.id === activeDocumentId);

  return (
    <div className="flex min-h-screen bg-vault-bg text-vault-text">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        stats={profileData?.stats}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          currentView={currentView}
          onNavigate={(v) => setCurrentView(v)}
          onOpenCreateConference={() => setIsCreateConfOpen(true)}
          onOpenUploadDocument={() => setIsUploadDocOpen(true)}
          onSelectDocument={handleSelectDocument}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
          {currentView === "dashboard" && (
            <DashboardView
              onNavigate={(v) => setCurrentView(v)}
              onOpenCreateConference={() => setIsCreateConfOpen(true)}
              onOpenUploadDocument={() => setIsUploadDocOpen(true)}
              data={profileData}
              onSelectConference={handleSelectConference}
            />
          )}

          {currentView === "conferences" && (
            <ConferenceListView
              conferences={conferences}
              onOpenCreateConference={() => setIsCreateConfOpen(true)}
              onSelectConference={handleSelectConference}
              onOpenAnalyst={handleOpenAnalystForConf}
              onOpenCoach={handleOpenCoachForConf}
              onDeleteConference={handleDeleteConference}
            />
          )}

          {currentView === "documents" && (
            <DocumentListView
              documents={documents}
              conferences={conferences}
              onOpenUploadDocument={() => setIsUploadDocOpen(true)}
              onSelectDocument={handleSelectDocument}
              onOpenAnalyst={handleOpenAnalystForConf}
              onOpenConnectModal={handleOpenConnectModal}
            />
          )}

          {currentView === "analyst" && (
            <ResearchAnalystView
              conferences={conferences}
              initialConferenceId={activeConferenceId}
            />
          )}

          {currentView === "connections" && (
            <KnowledgeGraphView
              conferences={conferences}
              initialConferenceId={activeConferenceId}
              onOpenCreateConnection={handleOpenConnectModal}
              onSelectDocument={handleSelectDocument}
            />
          )}

          {currentView === "speeches" && <SpeechIntelligenceView />}

          {currentView === "coach" && (
            <MUNCoachView
              conferences={conferences}
              initialConferenceId={activeConferenceId}
            />
          )}

          {currentView === "settings" && (
            <SettingsView
              onReseedDatabase={handleReseed}
              profileData={profileData?.profile}
              onRefreshProfile={loadData}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="p-6 border-t-2 border-vault-border text-[10px] font-mono text-vault-dim flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          <span>MUNVAULT © 2026 · YOUR MEMORY. YOUR STRATEGY. YOUR FLOOR.</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ALL ARCHIVES IMMUTABLE & PERSISTENT · PRODUCTION RUNTIME
          </span>
        </footer>
      </div>

      {/* Modals */}
      <CreateConferenceModal
        isOpen={isCreateConfOpen}
        onClose={() => setIsCreateConfOpen(false)}
        onSuccess={() => {
          loadData();
          showToast("New conference workspace created!");
        }}
      />

      <ConferenceDetailModal
        conference={activeConference}
        isOpen={isConfDetailOpen}
        onClose={() => setIsConfDetailOpen(false)}
        onOpenUploadDocument={(confId) => {
          setActiveConferenceId(confId);
          setIsUploadDocOpen(true);
        }}
        onOpenAnalyst={handleOpenAnalystForConf}
        onOpenCoach={handleOpenCoachForConf}
        onSelectDocument={handleSelectDocument}
        onRefreshConference={loadData}
      />

      <UploadDocumentModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        conferences={conferences}
        initialConferenceId={activeConferenceId}
        onSuccess={() => {
          loadData();
          showToast("Document indexed into immutable archive!");
        }}
      />

      <DocumentDetailModal
        document={activeDocument}
        isOpen={isDocDetailOpen}
        onClose={() => setIsDocDetailOpen(false)}
        onOpenConnectModal={handleOpenConnectModal}
        onOpenAnalyst={handleOpenAnalystForConf}
        onDeleteDocument={handleDeleteDocument}
        onRefresh={loadData}
      />

      <CreateConnectionModal
        isOpen={isCreateConnectOpen}
        onClose={() => setIsCreateConnectOpen(false)}
        documents={documents}
        initialSourceDocId={connectSourceDocId}
        onSuccess={() => {
          loadData();
          showToast("Knowledge graph connection created!");
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-vault-yellow text-vault-ink border-2 border-vault-ink shadow-neo px-4 py-2.5 rounded text-xs font-mono font-bold animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
