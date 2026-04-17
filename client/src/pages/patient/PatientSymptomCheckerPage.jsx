import { useRef, useState } from "react";
import {
  SendHorizonal,
  Activity,
  AlertCircle,
  Brain,
  Stethoscope,
  Clock,
  ChevronRight,
  Zap,
  CheckCircle2,
  TriangleAlert,
  X,
  Loader2,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import { patientApi } from "@/patient/services/patientApi";
import InfoCard from "@/patient/components/ui/InfoCard";
import SectionCard from "@/patient/components/ui/SectionCard";

// ── Quick symptom chips ──────────────────────────────────────────
const QUICK_SYMPTOMS = [
  "Fever",
  "Fatigue",
  "Sore Throat",
  "Nausea",
  "Headache",
  "Chest Pain",
  "Shortness of Breath",
  "Back Pain",
  "Dizziness",
  "Cough",
];

// ── Urgency config ───────────────────────────────────────────────
const URGENCY_CONFIG = {
  high: {
    label: "High Urgency",
    icon: TriangleAlert,
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-700",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    dot: "bg-red-500",
    hint: "Please seek medical attention promptly.",
  },
  medium: {
    label: "Moderate Urgency",
    icon: Clock,
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-700",
    text: "text-amber-700 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    hint: "Schedule a consultation within a few days.",
  },
  low: {
    label: "Low Urgency",
    icon: CheckCircle2,
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-700",
    text: "text-emerald-700 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    hint: "Monitor symptoms and consult if they worsen.",
  },
};

// ── AI Result Card ───────────────────────────────────────────────
function AIResultCard({ result, onDismiss }) {
  const urgency = URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.medium;
  const UrgencyIcon = urgency.icon;

  return (
    <div
      className={`rounded-2xl border ${urgency.border} ${urgency.bg} p-5 relative`}
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className={urgency.text} />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
          AI Assessment
        </span>
        {!result.isAIGenerated && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
            <AlertCircle size={10} /> Fallback Mode
          </span>
        )}
        <span
          className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${urgency.badge}`}
        >
          <UrgencyIcon size={12} />
          {urgency.label}
        </span>
      </div>

      {/* AI Unavailable Banner */}
      {!result.isAIGenerated && (
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 mb-4">
          <AlertCircle
            size={15}
            className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            <span className="font-bold">AI engine unavailable.</span> The Gemini
            API key is missing or invalid. Add a valid{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">
              GEMINI_API_KEY
            </code>{" "}
            to your{" "}
            <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">
              .env
            </code>{" "}
            file and rebuild the AI service. Results below are generic fallback
            guidance only.
          </p>
        </div>
      )}

      {/* Suggestion */}
      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
        {result.suggestion}
      </p>

      {/* Specialty */}
      <div className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 rounded-xl px-4 py-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#055153]/10 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
          <Stethoscope
            size={16}
            className="text-[#055153] dark:text-teal-400"
          />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
            Recommended Specialty
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {result.recommendedSpecialty}
          </p>
        </div>
        <a
          href="/patient/doctors"
          className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#055153] dark:text-teal-400 hover:underline"
        >
          Find Doctor <ChevronRight size={13} />
        </a>
      </div>

      {/* Pre-medication Steps */}
      {result.preMedicationSteps?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <ClipboardList size={12} />
            Recommended Steps
          </p>
          <ul className="space-y-2">
            {result.preMedicationSteps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/80 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-[#055153] dark:text-teal-400 mt-0.5">
                  {i + 1}
                </span>
                {step.replace(/^Step \d+:\s*/i, "")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
        <AlertCircle size={11} />
        This is AI-generated guidance only. Always consult a licensed doctor.
      </p>
    </div>
  );
}

// ── Chat Bubble ──────────────────────────────────────────────────
function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#055153] to-teal-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 shadow-sm">
          <Brain size={13} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-[#055153] dark:bg-teal-700 text-white rounded-br-sm"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function PatientSymptomCheckerPage() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your AI Health Assistant powered by Google Gemini. Describe your symptoms and I'll provide a preliminary assessment — including urgency level, recommended specialist, and preparation steps.",
    },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(
      () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      80,
    );
  };

  const runAnalysis = async (symptomText) => {
    const trimmed = symptomText.trim();
    if (!trimmed || isAnalyzing) return;

    setMessage("");
    setLastResult(null);
    setChat((prev) => [...prev, { role: "user", text: trimmed }]);
    setIsAnalyzing(true);
    scrollToBottom();

    try {
      const result = await patientApi.analyzeSymptoms(trimmed);
      setLastResult(result);
      setSessionCount((c) => c + 1);
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: result.isAIGenerated
            ? `Analysis complete. Urgency: ${result.urgency?.toUpperCase() || "MEDIUM"} — Recommended specialist: ${result.recommendedSpecialty}. See the full assessment below.`
            : `⚠️ AI engine unavailable — could not analyze your symptoms. Check that a valid GEMINI_API_KEY is set in the server environment.`,
        },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I'm unable to process your request right now. Please ensure you're connected and try again, or contact your care team directly.",
        },
      ]);
    } finally {
      setIsAnalyzing(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runAnalysis(message);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#F8FAFB] dark:bg-slate-950 min-h-screen transition-colors duration-300 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#055153] to-teal-500 flex items-center justify-center shadow-md shadow-teal-900/20">
          <Brain size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#112429] dark:text-white tracking-tight">
            AI Symptom Checker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Powered by Google Gemini — Preliminary health guidance only
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            AI Online
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={Activity}
          title="Checks This Session"
          value={sessionCount}
          hint="Real-time AI analysis"
          accent="teal"
        />
        <InfoCard
          icon={Zap}
          title="Response Model"
          value="Gemini"
          hint="Google AI — gemini-2.5-flash"
          accent="blue"
        />
        <InfoCard
          icon={AlertCircle}
          title="Disclaimer"
          value="Info Only"
          hint="Not a medical diagnosis"
          accent="amber"
        />
      </div>

      {/* Chat Interface */}
      <SectionCard
        title="Clinical Assistant"
        subtitle="Describe your symptoms in detail for the most accurate guidance"
      >
        {/* Chat Window */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 h-64 overflow-y-auto mb-4 scroll-smooth">
          {chat.map((msg, i) => (
            <ChatBubble key={i} msg={msg} />
          ))}

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#055153] to-teal-500 flex items-center justify-center mr-0 flex-shrink-0 shadow-sm">
                <Brain size={13} className="text-white" />
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                <Loader2
                  size={14}
                  className="animate-spin text-[#055153] dark:text-teal-400"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Analyzing symptoms…
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Symptom Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_SYMPTOMS.map((symptom) => (
            <button
              key={symptom}
              type="button"
              disabled={isAnalyzing}
              onClick={() => runAnalysis(symptom)}
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-[#055153] dark:hover:border-teal-500 hover:text-[#055153] dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {symptom}
            </button>
          ))}
        </div>

        {/* Input Row */}
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnalyzing}
            placeholder="e.g. I have a severe headache, fever 38.5°C, and stiff neck since yesterday..."
            className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-[#055153] dark:focus:border-teal-500 focus:ring-2 focus:ring-[#055153]/10 dark:focus:ring-teal-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-60 transition-all"
          />
          <button
            type="button"
            onClick={() => runAnalysis(message)}
            disabled={isAnalyzing || !message.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-full bg-[#055153] hover:bg-[#033A3C] dark:bg-teal-600 dark:hover:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-[#055153]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <SendHorizonal size={18} />
            )}
          </button>
        </div>
      </SectionCard>

      {/* AI Result */}
      {lastResult && (
        <AIResultCard
          result={lastResult}
          onDismiss={() => setLastResult(null)}
        />
      )}

      {/* Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-100 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 px-5 py-4 flex items-start gap-3">
        <AlertCircle
          size={18}
          className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
        />
        <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
          <span className="font-bold">Medical Disclaimer:</span> This AI
          assistant provides informational guidance only and is not a substitute
          for professional medical advice, diagnosis, or treatment. Always seek
          the advice of a qualified healthcare provider for any medical
          condition.
        </p>
      </div>
    </div>
  );
}
