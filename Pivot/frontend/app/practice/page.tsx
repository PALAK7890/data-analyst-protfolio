"use client";

/**
 * Practice page — Code editor, hint panel, test generation, AI review, code runner.
 * Monaco Editor is dynamically imported (ssr:false) to avoid SSR issues.
 */

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Code2, Lightbulb, FlaskConical, Play,
  Star, ChevronDown, ChevronUp, Loader2,
  CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { Badge, difficultyBadge } from "@/components/Badge";
import { api, type ReviewResult, type TestCase, type TestRunResult } from "@/lib/api";

// SSR-safe Monaco import
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const LANGUAGES = ["python", "javascript", "java", "cpp"] as const;
type Lang = (typeof LANGUAGES)[number];

const STARTER: Record<Lang, string> = {
  python: `def solution(nums: list[int], k: int) -> int:
    # Write your solution here
    pass
`,
  javascript: `/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number}
 */
function solution(nums, k) {
  // Write your solution here
}
`,
  java: `class Solution {
    public int solution(int[] nums, int k) {
        // Write your solution here
        return 0;
    }
}
`,
  cpp: `class Solution {
public:
    int solution(vector<int>& nums, int k) {
        // Write your solution here
        return 0;
    }
};
`,
};

const HINT_LABELS = [
  "Key Observation",
  "Pattern Direction",
  "Approach Explanation",
  "Pseudocode",
  "Final Solution Idea",
];

export default function PracticePage() {
  const [lang, setLang] = useState<Lang>("python");
  const [code, setCode] = useState(STARTER.python);
  const [problem, setProblem] = useState("");
  const [pattern, setPattern] = useState("Sliding Window");

  // Hints
  const [hints, setHints] = useState<{ level: number; text: string }[]>([]);
  const [hintLoading, setHintLoading] = useState(false);

  // Review
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(true);

  // Tests
  const [tests, setTests] = useState<TestCase[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);

  // Run
  const [runResults, setRunResults] = useState<TestRunResult[]>([]);
  const [runSummary, setRunSummary] = useState<{ passed: number; failed: number } | null>(null);
  const [runLoading, setRunLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const nextHintLevel = hints.length + 1;
  const canHint = nextHintLevel <= 5;

  const fetchHint = async () => {
    setHintLoading(true);
    setError(null);
    try {
      const data = await api.generateHint({
        problem: problem || "General DSA practice problem",
        pattern,
        hint_level: nextHintLevel,
      });
      setHints((h) => [...h, { level: data.hint_level, text: data.hint }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch hint.");
    } finally {
      setHintLoading(false);
    }
  };

  const fetchReview = async () => {
    if (!code.trim()) return;
    setReviewLoading(true);
    setError(null);
    try {
      const data = await api.reviewCode({
        problem: problem || "General DSA practice problem",
        pattern,
        language: lang,
        code,
      });
      setReview(data);
      setReviewOpen(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to review code.");
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchTests = async () => {
    setTestsLoading(true);
    setError(null);
    try {
      const data = await api.generateTests({
        problem: problem || "General DSA practice problem",
        pattern,
      });
      setTests(data.tests);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate tests.");
    } finally {
      setTestsLoading(false);
    }
  };

  const runCode = async () => {
    if (lang !== "python") {
      setError("Code execution is only supported for Python in this MVP.");
      return;
    }
    if (!tests.length) {
      setError("Generate test cases first before running code.");
      return;
    }
    setRunLoading(true);
    setError(null);
    try {
      const data = await api.runCode({
        language: lang,
        code,
        test_cases: tests.map((t) => ({ input: t.input, expected: t.expected_output })),
      });
      setRunResults(data.results);
      setRunSummary({ passed: data.passed, failed: data.failed });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to run code.");
    } finally {
      setRunLoading(false);
    }
  };

  const ratingColor = (r: number) =>
    r >= 8 ? "var(--green)" : r >= 5 ? "var(--yellow)" : "var(--red)";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Practice</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-fg)" }}>
          Write your solution, get hints, generate tests, and request AI code review.
        </p>
      </div>

      {/* Context strip */}
      <div
        className="rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <div>
          <label className="text-xs font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--muted-fg)" }}>
            Problem context (optional)
          </label>
          <input
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. Maximum sum subarray of size K"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider block mb-1" style={{ color: "var(--muted-fg)" }}>
            Pattern (for hints & review)
          </label>
          <input
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. Sliding Window"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--background)", border: "1px solid var(--card-border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--card-border)" }}
        >
          {/* Toolbar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}
          >
            <Code2 size={15} style={{ color: "var(--accent-light)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Code Editor</span>
            <div className="ml-auto flex gap-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    setCode(STARTER[l]);
                  }}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: lang === l ? "var(--accent-glow)" : "transparent",
                    color: lang === l ? "var(--accent-light)" : "var(--muted-fg)",
                    border: lang === l ? "1px solid var(--accent)" : "1px solid transparent",
                  }}
                >
                  {l === "cpp" ? "C++" : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <MonacoEditor
            height="420px"
            language={lang === "cpp" ? "cpp" : lang}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            theme="vs-dark"
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderLineHighlight: "line",
              fontFamily: "var(--font-mono), 'Fira Code', monospace",
              padding: { top: 12 },
            }}
          />

          {/* Action bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 flex-wrap"
            style={{ background: "var(--card-bg)", borderTop: "1px solid var(--card-border)" }}
          >
            <button
              onClick={fetchReview}
              disabled={reviewLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", color: "#fff" }}
            >
              {reviewLoading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
              AI Review
            </button>
            <button
              onClick={fetchTests}
              disabled={testsLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}
            >
              {testsLoading ? <Loader2 size={14} className="animate-spin" /> : <FlaskConical size={14} />}
              Generate Tests
            </button>
            <button
              onClick={runCode}
              disabled={runLoading || lang !== "python"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
              title={lang !== "python" ? "Python only" : ""}
            >
              {runLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Run {lang !== "python" && "(Python only)"}
            </button>
          </div>
        </div>

        {/* Hint panel */}
        <div
          className="rounded-2xl flex flex-col"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--card-border)" }}>
            <div className="flex items-center gap-2">
              <Lightbulb size={15} style={{ color: "#f59e0b" }} />
              <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Hints</span>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}
              >
                {hints.length}/5 revealed
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {hints.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "var(--muted-fg)" }}>
                Stuck? Click &ldquo;Next Hint&rdquo; for a nudge in the right direction.
              </p>
            )}
            {hints.map((h) => (
              <div
                key={h.level}
                className="rounded-xl p-3 animate-fade-in"
                style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
              >
                <p className="text-xs font-semibold mb-1" style={{ color: "#fbbf24" }}>
                  Hint {h.level} — {HINT_LABELS[h.level - 1]}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>
                  {h.text}
                </p>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t" style={{ borderColor: "var(--card-border)" }}>
            <button
              onClick={fetchHint}
              disabled={!canHint || hintLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
            >
              {hintLoading ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />}
              {canHint ? `Next Hint (${nextHintLevel}/5)` : "All hints revealed"}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
        >
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Test Cases table */}
      {tests.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--card-border)" }}
        >
          <div
            className="px-5 py-4 flex items-center gap-2"
            style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}
          >
            <FlaskConical size={15} style={{ color: "#3b82f6" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              Generated Test Cases
            </span>
            <span className="ml-auto text-xs" style={{ color: "var(--muted-fg)" }}>
              {tests.length} cases
            </span>
          </div>
          <div style={{ background: "var(--card-bg)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                  {["Type", "Input", "Expected Output", "Reason"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--muted-fg)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tests.map((t, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid var(--card-border)" }}
                    className="hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <Badge
                        color={t.type === "basic" ? "blue" : t.type === "edge" ? "yellow" : "red"}
                      >
                        {t.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "var(--foreground)" }}>
                      {t.input}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "var(--green)" }}>
                      {t.expected_output}
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "var(--muted-fg)" }}>
                      {t.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Run Results */}
      {runSummary && (
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-3">
            <Play size={15} style={{ color: "#10b981" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Run Results</span>
            <span style={{ color: "var(--green)", fontWeight: 600 }}>{runSummary.passed} passed</span>
            <span style={{ color: "var(--red)", fontWeight: 600 }}>{runSummary.failed} failed</span>
          </div>
          <div className="space-y-2">
            {runResults.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
                style={{
                  background: r.passed ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${r.passed ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                }}
              >
                {r.passed ? (
                  <CheckCircle2 size={14} style={{ color: "var(--green)", flexShrink: 0 }} />
                ) : (
                  <XCircle size={14} style={{ color: "var(--red)", flexShrink: 0 }} />
                )}
                <div className="flex-1">
                  <span style={{ color: "var(--muted-fg)" }}>Input: </span>
                  <span className="font-mono" style={{ color: "var(--foreground)" }}>{r.input}</span>
                  <span className="ml-4" style={{ color: "var(--muted-fg)" }}>Expected: </span>
                  <span className="font-mono" style={{ color: "var(--green)" }}>{r.expected}</span>
                  <span className="ml-4" style={{ color: "var(--muted-fg)" }}>Got: </span>
                  <span className="font-mono" style={{ color: r.passed ? "var(--green)" : "var(--red)" }}>
                    {r.actual || r.error || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Review */}
      {review && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--card-border)" }}
        >
          <button
            onClick={() => setReviewOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-5 py-4"
            style={{ background: "var(--card-bg)", borderBottom: reviewOpen ? "1px solid var(--card-border)" : "none" }}
          >
            <Star size={15} style={{ color: "#f59e0b" }} />
            <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>AI Code Review</span>
            <span
              className="ml-2 text-2xl font-bold"
              style={{ color: ratingColor(review.rating) }}
            >
              {review.rating}/10
            </span>
            <span className="ml-auto" style={{ color: "var(--muted-fg)" }}>
              {reviewOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {reviewOpen && (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5" style={{ background: "var(--card-bg)" }}>
              <Field label="Correctness" value={review.correctness} color="var(--green)" />
              <Field label="Readability" value={review.readability} color="#60a5fa" />
              <Field label="Time Complexity" value={review.time_complexity} color="#a78bfa" mono />
              <Field label="Space Complexity" value={review.space_complexity} color="#a78bfa" mono />
              <Field label="Optimization" value={review.optimization} color="var(--yellow)" />

              {review.bugs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--red)" }}>
                    Bugs Found
                  </p>
                  <ul className="space-y-1">
                    {review.bugs.map((b, i) => (
                      <li key={i} className="text-sm flex gap-1.5" style={{ color: "var(--muted-fg)" }}>
                        <XCircle size={13} className="mt-0.5" style={{ color: "var(--red)" }} /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.edge_cases.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--yellow)" }}>
                    Missing Edge Cases
                  </p>
                  <ul className="space-y-1">
                    {review.edge_cases.map((c, i) => (
                      <li key={i} className="text-sm flex gap-1.5" style={{ color: "var(--muted-fg)" }}>
                        <AlertTriangle size={13} className="mt-0.5" style={{ color: "var(--yellow)" }} /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {review.mistake_categories.length > 0 && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-fg)" }}>
                    Mistake Categories Flagged
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.mistake_categories.map((m) => (
                      <Badge key={m} color="red">{m}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  color,
  mono,
}: {
  label: string;
  value: string;
  color?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--muted-fg)" }}>
        {label}
      </p>
      <p
        className={`text-sm ${mono ? "font-mono" : ""}`}
        style={{ color: color ?? "var(--foreground)" }}
      >
        {value}
      </p>
    </div>
  );
}
