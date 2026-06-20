import { motion } from "motion/react";

import React from "react";
import {
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Send,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router";
type CurrentSelectedHistoryProps = {
  setSelectedCurrentHistory: (verification: any) => void;
  selectedcurrentHistory: any;
  customImage?: File;
};
const getVerdictColors = (verdict?: string) => {
  const normalized = (verdict || "").trim().toLowerCase();
  if (normalized === "likely fake")
    return {
      gradient: "from-red-500/10 to-red-600/10",
      border: "border-red-500/30",
      bar: "from-red-500 to-red-400",
      text: "text-red-400",
    };
  if (normalized === "suspicious")
    return {
      gradient: "from-yellow-500/10 to-yellow-600/10",
      border: "border-yellow-500/30",
      bar: "from-yellow-500 to-yellow-400",
      text: "text-yellow-400",
    };
  if (normalized === "likely real")
    return {
      gradient: "from-green-500/10 to-green-600/10",
      border: "border-green-500/30",
      bar: "from-green-500 to-green-400",
      text: "text-green-400",
    };
  if (normalized === "satire")
    return {
      gradient: "from-pink-500/10 to-pink-600/10",
      border: "border-pink-500/30",
      bar: "from-pink-500 to-pink-400",
      text: "text-pink-400",
    };
  if (normalized === "unreadable")
    return {
      gradient: "from-slate-500/10 to-slate-600/10",
      border: "border-slate-500/30",
      bar: "from-slate-500 to-slate-400",
      text: "text-slate-400",
    };
  return {
    gradient: "from-blue-500/10 to-blue-600/10",
    border: "border-blue-500/30",
    bar: "from-blue-500 to-blue-400",
    text: "text-blue-400",
  };
};

const getRealityScorePercentage = (score?: number) => {
  if (typeof score !== "number") return 0;
  if (score <= 1.0) return score * 100;
  if (score <= 10) return score * 10;
  return Math.min(100, score);
};

const CurrentSelectedHistory = ({
  setSelectedCurrentHistory,
  selectedcurrentHistory,
  customImage,
}: CurrentSelectedHistoryProps) => {
  const navigate = useNavigate();
  const result = selectedcurrentHistory?.result || {};
  const explanationText =
    typeof result.explanation === "string" && result.explanation.trim()
      ? result.explanation
      : "No explanation was returned for this verification.";
  const evidences = Array.isArray(result.evidence) ? result.evidence : [];
  const colors = getVerdictColors(result.verdict);

  const confidencePct =
    typeof result.confidence === "number"
      ? Math.round(result.confidence * 100)
      : 0;
  const realityPct = getRealityScorePercentage(result.reality_score);
  console.log(selectedcurrentHistory);

  return (
    <div>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <button
          onClick={() => setSelectedCurrentHistory(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-6"
      >
        <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Your Question</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.border} bg-card/50 ${colors.text} uppercase tracking-wider`}
            >
              {result.verdict || "UNREADABLE"}
            </span>
          </div>
          {selectedcurrentHistory.image_url ? (
            <img
              src={selectedcurrentHistory.image_url}
              alt="Verification"
              className="rounded-lg w-full max-h-96 object-contain bg-black/20 mt-4"
            />
          ) : customImage ? (
            <img
              src={URL.createObjectURL(customImage)}
              alt="Verification"
              className="rounded-lg w-full max-h-96 object-contain bg-black/20 mt-4"
            />
          ) : (
            <p className="text-xs text-muted-foreground mt-4">
              {selectedcurrentHistory?.result?.input ||
                "No image available for this verification."}
            </p>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div
            className={`bg-linear-to-r ${colors.gradient} border ${colors.border} rounded-2xl p-4 h-full`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${colors.text}`} />
                <span className="text-sm">Confidence Score</span>
              </div>
              <span className={`text-2xl ${colors.text}`}>
                {confidencePct}%
              </span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${confidencePct}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full bg-linear-to-r ${colors.bar} rounded-full`}
              />
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div
            className={`bg-linear-to-r ${colors.gradient} border ${colors.border} rounded-2xl p-4 h-full`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-5 h-5 ${colors.text}`} />
                <span className="text-sm">Reality Score</span>
              </div>
              <span className={`text-2xl ${colors.text}`}>
                {typeof result.reality_score === "number"
                  ? result.reality_score.toFixed(2)
                  : "N/A"}
              </span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${realityPct}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full bg-linear-to-r ${colors.bar} rounded-full`}
              />
            </div>
          </div>
        </motion.div>
      </div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mb-6"
      >
        <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6">
          <p className="text-xs text-muted-foreground mb-4">AI Verification</p>
          <div className="prose prose-invert max-w-none">
            {explanationText
              .split("\n\n")
              .map((paragraph: string, index: string) => (
                <p
                  key={index}
                  className="mb-4 last:mb-0 text-sm leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer">
          Evidences
        </h1>
      </motion.div>
      {evidences.length > 0 ? (
        evidences.map((evidence: any, index: number) => (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="my-6"
          >
            <h1
              className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 text-lg cursor-pointer"
              onClick={() => window.open(evidence.url, "_blank")}
              rel="noopener noreferrer"
            >
              {evidence.title}
            </h1>
          </motion.div>
        ))
      ) : (
        <div className="rounded-2xl border border-border bg-card/50 p-6 text-sm text-muted-foreground">
          No evidence items were returned for this verification.
        </div>
      )}
    </div>
  );
};

export default CurrentSelectedHistory;
