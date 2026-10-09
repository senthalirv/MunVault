export type DocumentCategory =
  | "RESEARCH"
  | "GSL"
  | "MODERATED_CAUCUS"
  | "UNMODERATED_CAUCUS"
  | "POI"
  | "RESOLUTION"
  | "SMALL_NOTE"
  | "REFERENCE"
  | "OTHER";

export const CATEGORY_LABELS: Record<DocumentCategory, { label: string; badge: string; icon: string }> = {
  RESEARCH: { label: "Research Brief", badge: "bg-vault-lavender/20 text-vault-lavender border-vault-lavender/40", icon: "▤" },
  GSL: { label: "GSL Speech", badge: "bg-vault-coral/20 text-vault-coral border-vault-coral/40", icon: "↗" },
  MODERATED_CAUCUS: { label: "Mod Caucus", badge: "bg-vault-teal/20 text-vault-teal border-vault-teal/40", icon: "⚡" },
  UNMODERATED_CAUCUS: { label: "Unmod Notes", badge: "bg-vault-yellow/20 text-vault-yellow border-vault-yellow/40", icon: "✎" },
  POI: { label: "POI Bank", badge: "bg-vault-amber/20 text-vault-amber border-vault-amber/40", icon: "?" },
  RESOLUTION: { label: "Draft Resolution", badge: "bg-vault-blue/20 text-vault-blue border-vault-blue/40", icon: "☷" },
  SMALL_NOTE: { label: "Delegate Note", badge: "bg-zinc-700/30 text-zinc-300 border-zinc-600/40", icon: "▫" },
  REFERENCE: { label: "UN Reference", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40", icon: "⚖" },
  OTHER: { label: "Supporting Doc", badge: "bg-slate-700/20 text-slate-300 border-slate-600/40", icon: "▪" },
};

export const AWARD_TYPES = [
  "Best Delegate",
  "Outstanding Delegate",
  "High Commendation",
  "Special Mention",
  "Verbal Mention",
  "Participation",
  "Diplomatic Commendation",
] as const;

export interface ConferenceWithDetails {
  id: string;
  name: string;
  date: string | null;
  committee: string;
  portfolio: string;
  agenda: string;
  notes: string | null;
  award: string | null;
  status: string;
  countryFlag: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    speeches: number;
    practiceSessions: number;
  };
  documents?: DocumentItem[];
}

export interface DocumentItem {
  id: string;
  conferenceId: string;
  title: string;
  category: DocumentCategory;
  content: string;
  summary: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  fileUrl: string | null;
  tags: string | null;
  isImmutable: boolean;
  coverageScore: number | null;
  createdAt: string;
  updatedAt: string;
  conference?: {
    id: string;
    name: string;
    committee: string;
    portfolio: string;
  };
  sourceLinks?: ConnectionItem[];
  targetLinks?: ConnectionItem[];
}

export interface ConnectionItem {
  id: string;
  sourceDocId: string;
  targetDocId: string;
  connectionType: string;
  similarityScore: number;
  explanation: string | null;
  status: "accepted" | "suggested" | "rejected";
  createdAt: string;
  sourceDoc?: DocumentItem;
  targetDoc?: DocumentItem;
}

export interface ResearchAnalysisResult {
  id: string;
  conferenceId: string;
  overallScore: number;
  countryPositionScore: number;
  historicalScore: number;
  unPrecedentsScore: number;
  resolutionsScore: number;
  oppositionScore: number;
  implementationScore: number;
  sourcesScore: number;
  strongAreas: string[];
  missingAreas: string[];
  feedback: string;
  createdAt: string;
}

export interface SpeechItem {
  id: string;
  conferenceId: string;
  documentId: string | null;
  title: string;
  speechType: string;
  content: string;
  themes: string[];
  arguments: string[];
  policyProposals: string[];
  evidenceUsed: string[];
  framingType: string | null;
  createdAt: string;
  conference?: {
    name: string;
    committee: string;
    portfolio: string;
  };
}

export interface SpeechComparisonResult {
  id: string;
  speechAId: string;
  speechBId: string;
  overallSimilarity: number;
  wordingSimilarity: number;
  framingSimilarity: number;
  policySimilarity: number;
  evidenceSimilarity: number;
  explanation: string;
  speechA?: SpeechItem;
  speechB?: SpeechItem;
}

export interface PracticeEvaluationResult {
  id?: string;
  question: string;
  userTranscript: string;
  contentScore: number;
  accuracyScore: number;
  relevanceScore: number;
  diplomacyScore: number;
  structureScore: number;
  rebuttalScore: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  actionableSuggestion: string;
  createdAt?: string;
}
