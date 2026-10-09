"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  History,
  FolderKanban,
  Send,
} from "lucide-react";

interface MUNCoachViewProps {
  conferences: any[];
  initialConferenceId?: string;
}

export const MUNCoachView: React.FC<MUNCoachViewProps> = ({
  conferences,
  initialConferenceId,
}) => {
  const [selectedConferenceId, setSelectedConferenceId] = useState<string>(
    initialConferenceId || conferences[0]?.id || ""
  );
  const [questions, setQuestions] = useState<string[]>([
    "The United Kingdom claims to support freedom of religion. How would your delegation respond to criticism regarding its treatment of religious minorities and institutional historical biases?",
    "Your opponent argues that international monitoring violates state sovereignty under Article 2(7). Give a diplomatic rebuttal.",
    "Name one concrete implementation mechanism your delegation would fund and explain how it would be monitored.",
    "What existing UN mechanism would your delegation strengthen, and why is it more effective than creating a new body?",
  ]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [historySessions, setHistorySessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Load questions for the selected conference
  const fetchQuestions = async (confId: string) => {
    try {
      const res = await fetch("/api/coach/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceId: confId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions?.length > 0) {
          setQuestions(data.questions);
          setCurrentQIndex(0);
        }
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
    }
  };

  // Load practice history
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/coach/history");
      if (res.ok) {
        const data = await res.json();
        setHistorySessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  useEffect(() => {
    if (selectedConferenceId) {
      fetchQuestions(selectedConferenceId);
    }
    fetchHistory();
  }, [selectedConferenceId]);

  // Web Speech API Voice Recognition setup
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      setError(null);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError(
          "Web Speech Recognition API is not supported in this browser. You can type your response directly into the transcript box below."
        );
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + " ";
          }
          setTranscript(current.trim());
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
          if (event.error !== "no-speech") {
            setError(`Speech recognition notice: ${event.error}. You can also type your response.`);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
      } catch (err: any) {
        console.error("Speech recognition start failed:", err);
        setError("Could not access microphone. Please type your response directly.");
        setIsRecording(false);
      }
    }
  };

  const handleNextQuestion = () => {
    setCurrentQIndex((prev) => (prev + 1) % questions.length);
    setEvaluation(null);
    setTranscript("");
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!transcript.trim()) {
      setError("Please speak or type your verbal response before evaluating.");
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      const res = await fetch("/api/coach/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conferenceId: selectedConferenceId,
          question: questions[currentQIndex],
          userTranscript: transcript,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to evaluate response");
      }

      const data = await res.json();
      setEvaluation(data.evaluation);
      fetchHistory();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const selectedConf = conferences.find((c) => c.id === selectedConferenceId) || conferences[0];

  return (
    <div className="space-y-6">
      {/* Title & Conference Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono font-bold text-vault-coral uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-1 bg-vault-coral inline-block"></span>
            LIVE PARLIAMENTARY SIMULATION & VOICE PRACTICE
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            AI MUN Coach
          </h1>
          <p className="text-xs text-vault-muted mt-1 max-w-xl">
            Rehearse diplomatic rebuttals, defuse hostile POIs, and build parliamentary composure under timed verbal cross-examination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-vault-card border border-vault-border rounded px-3 py-1.5 flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5 text-vault-coral" />
            <select
              value={selectedConferenceId}
              onChange={(e) => setSelectedConferenceId(e.target.value)}
              className="bg-transparent text-xs text-white font-mono focus:outline-none"
            >
              {conferences.map((c) => (
                <option key={c.id} value={c.id} className="bg-vault-panel text-white">
                  {c.countryFlag || "🌐"} {c.name} ({c.committee})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchQuestions(selectedConferenceId)}
            className="p-2 rounded bg-vault-card hover:bg-vault-cardHover text-vault-muted hover:text-white border border-vault-border"
            title="Generate new questions"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-vault-coral/15 border border-vault-coral text-vault-coral text-xs rounded font-mono">
          {error}
        </div>
      )}

      {/* Main Practice Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Dynamic Question & Speech Input Canvas */}
        <div className="lg:col-span-7 space-y-4">
          {/* Question Box */}
          <div className="neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-vault-yellow font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> LIVE CHALLENGE / QUESTION{" "}
                {String(currentQIndex + 1).padStart(2, "0")} OF{" "}
                {String(questions.length).padStart(2, "0")}
              </span>
              <span className="text-vault-muted">
                {selectedConf?.portfolio} · {selectedConf?.committee}
              </span>
            </div>

            <div className="p-5 bg-vault-yellow border-2 border-vault-ink shadow-neo rounded text-vault-ink text-base sm:text-lg font-bold leading-relaxed">
              &quot;{questions[currentQIndex]}&quot;
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleNextQuestion}
                className="text-xs font-mono text-vault-coral hover:underline flex items-center gap-1 font-bold"
              >
                SKIP TO NEXT QUESTION <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-vault-dim">
                RECORD VERBALLY OR TYPE RESPONSE
              </span>
            </div>
          </div>

          {/* Voice Input & Transcription Pad */}
          <div className="neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRecording}
                  className={`neo-btn px-4 py-2 text-xs font-bold rounded flex items-center gap-2 transition ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-vault-coral text-vault-ink hover:bg-rose-400"
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? "STOP RECORDING" : "START VOICE PRACTICE"}</span>
                </button>
                {isRecording && (
                  <span className="text-[11px] font-mono text-red-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    RECORDING LIVE AUDIO...
                  </span>
                )}
              </div>

              {transcript && (
                <button
                  onClick={() => setTranscript("")}
                  className="text-[10px] font-mono text-vault-muted hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            <textarea
              rows={5}
              placeholder="Your spoken transcript appears here in real-time. You can also type or polish your response directly before submitting for AI analysis..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full bg-vault-subtle border border-vault-border rounded p-3 text-xs text-white font-mono focus:border-vault-coral focus:outline-none leading-relaxed"
            />

            <button
              onClick={handleSubmitEvaluation}
              disabled={isEvaluating || !transcript.trim()}
              className="w-full neo-btn bg-vault-teal text-vault-ink py-2.5 text-xs font-black rounded flex items-center justify-center gap-2 hover:bg-teal-300 disabled:opacity-50"
            >
              {isEvaluating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isEvaluating ? "EVALUATING ON 6 AXES..." : "EVALUATE VERBAL RESPONSE"}</span>
            </button>
          </div>
        </div>

        {/* Right: 6-Axis Evaluation Results or Practice History */}
        <div className="lg:col-span-5 space-y-4">
          {evaluation ? (
            <div className="neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-5 animate-in fade-in">
              {/* Overall Score Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-vault-border/60">
                <div className="w-16 h-16 rounded-full border-2 border-vault-ink shadow-neo bg-vault-coral flex flex-col items-center justify-center font-black text-vault-ink shrink-0">
                  <span className="text-xl leading-none">{evaluation.overallScore}</span>
                  <span className="text-[8px] font-mono">/ 10 SCORE</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    EVALUATION COMPLETE
                  </h3>
                  <p className="text-xs text-vault-muted mt-0.5">
                    Analyzed across 6 diplomatic performance dimensions.
                  </p>
                </div>
              </div>

              {/* 6-Axis Evaluation Matrix */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 bg-vault-panel rounded border border-vault-border flex justify-between items-center">
                  <span className="text-vault-muted">Content</span>
                  <span className="text-white font-bold">{evaluation.contentScore} / 10</span>
                </div>
                <div className="p-2.5 bg-vault-panel rounded border border-vault-border flex justify-between items-center">
                  <span className="text-vault-muted">Accuracy</span>
                  <span className="text-white font-bold">{evaluation.accuracyScore} / 10</span>
                </div>
                <div className="p-2.5 bg-vault-panel rounded border border-vault-border flex justify-between items-center">
                  <span className="text-vault-muted">Relevance</span>
                  <span className="text-vault-teal font-bold">{evaluation.relevanceScore} / 10</span>
                </div>
                <div className="p-2.5 bg-vault-panel rounded border border-vault-border flex justify-between items-center">
                  <span className="text-vault-muted">Diplomacy</span>
                  <span className="text-vault-lavender font-bold">{evaluation.diplomacyScore} / 10</span>
                </div>
                <div className="p-2.5 bg-vault-panel rounded border border-vault-border flex justify-between items-center">
                  <span className="text-vault-muted">Structure</span>
                  <span className="text-vault-yellow font-bold">{evaluation.structureScore} / 10</span>
                </div>
                <div className="p-2.5 bg-vault-panel rounded border border-vault-border flex justify-between items-center">
                  <span className="text-vault-muted">Rebuttal</span>
                  <span className="text-vault-coral font-bold">{evaluation.rebuttalScore} / 10</span>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300">
                  <span className="font-bold font-mono text-[10px] uppercase block mb-0.5">
                    KEY STRENGTH:
                  </span>
                  {evaluation.strengths}
                </div>
                <div className="p-3 bg-vault-coral/10 border border-vault-coral/30 rounded text-vault-coral">
                  <span className="font-bold font-mono text-[10px] uppercase block mb-0.5">
                    AREAS TO POLISH:
                  </span>
                  {evaluation.weaknesses}
                </div>
              </div>

              {/* Actionable Suggestion */}
              {evaluation.actionableSuggestion && (
                <div className="p-3.5 bg-vault-yellow/15 border-2 border-vault-yellow/40 rounded text-xs text-vault-text">
                  <span className="font-bold font-mono text-[10px] text-vault-yellow uppercase flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5" /> ACTIONABLE FRAMING PROMPT:
                  </span>
                  {evaluation.actionableSuggestion}
                </div>
              )}
            </div>
          ) : (
            /* Historical Progress Timeline */
            <div className="neo-box bg-vault-card p-6 rounded-lg border-2 border-vault-border space-y-4">
              <div className="flex items-center justify-between border-b border-vault-border/60 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-vault-teal" /> PRACTICE HISTORY & PROGRESSION
                </h3>
                <span className="text-[10px] font-mono text-vault-muted">
                  {historySessions.length} SESSIONS
                </span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
                {historySessions.length === 0 ? (
                  <p className="text-xs text-vault-muted text-center py-8 font-mono">
                    No sessions recorded yet. Record or type an answer to begin logging your performance.
                  </p>
                ) : (
                  historySessions.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="p-3 bg-vault-panel border border-vault-border rounded space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white truncate max-w-[200px]">
                          {s.topic || "Diplomatic Rebuttal"}
                        </span>
                        <span className="text-vault-teal font-bold bg-vault-teal/10 px-2 py-0.5 rounded border border-vault-teal/30">
                          {s.overallScore} / 10
                        </span>
                      </div>
                      <p className="text-[11px] text-vault-muted line-clamp-1 italic font-sans">
                        &quot;{s.question}&quot;
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
