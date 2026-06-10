"use client";

import { useState } from "react";
import { Search, ChevronRight, Loader2, AlertCircle, Lightbulb, BookOpen, Zap } from "lucide-react";
import { Badge, difficultyBadge } from "@/components/Badge";
import { api, type AnalysisResult } from "@/lib/api";

const PATTERN_COLORS: Record<string, string> = {
  "Sliding Window": "#7c3aed",
  "Two Pointers": "#3b82f6",
  "Binary Search": "#0ea5e9",
  "Dynamic Programming": "#f59e0b",
  "Graph BFS": "#10b981",
  "Graph DFS": "#059669",
  "Greedy": "#f97316",
  "Backtracking": "#ef4444",
  "Stack": "#8b5cf6",
  "Queue": "#6366f1",
  "Heap / Priority Queue": "#ec4899",
  "Hash Map": "#14b8a6",
  "Recursion": "#a78bfa",
  "Tree Traversal": "#22c55e",
  "Prefix Sum": "#06b6d4",
  "Sorting": "#84cc16",
  "Bit Manipulation": "#f43f5e",
};

export default function AnalyzePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    constraints: "",
    examples: "",
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const analyze = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const data = await api.analyzeProblem(form);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to analyze problem.");
    } finally {
      setLoading(false);
    }
  };

  const accentColor = result ? (PATTERN_COLORS[result.pattern] ?? "#7c3aed") : "#7c3aed";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Analyze Problem
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-fg)" }}>
          Paste your coding problem and PatternPilot will detect the best DSA pattern.
        </p>
      </div>

      {/* Input form */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-fg)" }}>
            Problem Title *
          </label>
          <input
            value={form.title}
            onChange={handle("title")}
            placeholder="e.g. Maximum Sum Subarray of Size K"
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "var(--background)",
              border: "1px solid var(--card-border)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--card-border)")}
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-fg)" }}>
            Problem Description *
          </label>
          <textarea
            value={form.description}
            onChange={handle("description")}
            rows={5}
            placeholder="Given an array of integers and a number k, find the maximum sum of a contiguous subarray of size k..."
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
            style={{
              background: "var(--background)",
              border: "1px solid var(--card-border)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--card-border)")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-fg)" }}>
              Constraints
            </label>
            <textarea
              value={form.constraints}
              onChange={handle("constraints")}
              rows={3}
              placeholder="1 ≤ n ≤ 10^5&#10;1 ≤ k ≤ n"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
              style={{
                background: "var(--background)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--card-border)")}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-fg)" }}>
              Example Test Cases
            </label>
            <textarea
              value={form.examples}
              onChange={handle("examples")}
              rows={3}
              placeholder="Input: [2,1,5,1,3,2], k=3&#10;Output: 9"
              className="mt-1.5 w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
              style={{
                background: "var(--background)",
                border: "1px solid var(--card-border)",
                color: "var(--foreground)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#7c3aed")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--card-border)")}
            />
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
          >
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
          }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
          ) : (
            <><Search size={16} /> Analyze Problem</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          {/* Pattern hero */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: `${accentColor}11`,
              border: `1px solid ${accentColor}44`,
              boxShadow: `0 0 30px ${accentColor}18`,
            }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: `${accentColor}bb` }}>
                  Detected Pattern
                </p>
                <h2 className="text-2xl font-bold" style={{ color: accentColor }}>
                  {result.pattern}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {difficultyBadge(result.difficulty)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Observations */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={15} style={{ color: "#f59e0b" }} />
                <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                  Key Observations
                </h3>
              </div>
              <ul className="space-y-2">
                {result.key_observations.map((obs, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--muted-fg)" }}>
                    <ChevronRight size={14} className="mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                    {obs}
                  </li>
                ))}
              </ul>
            </div>

            {/* Why this pattern */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} style={{ color: accentColor }} />
                <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                  Why This Pattern?
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>
                {result.why_pattern_fits}
              </p>
            </div>
          </div>

          {/* Approach */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={15} style={{ color: "#10b981" }} />
              <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                Suggested Approach
              </h3>
              <Badge color="green">No spoilers</Badge>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>
              {result.approach_summary}
            </p>
          </div>

          {/* Next steps */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <p className="text-sm" style={{ color: "var(--muted-fg)" }}>
              Ready to practice? Open the editor to write your solution.
            </p>
            <a
              href="/practice"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
                color: "#fff",
              }}
            >
              Open Editor →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
