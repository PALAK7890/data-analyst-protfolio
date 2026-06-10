"use client";

import { useEffect, useState } from "react";
import {
  BarChart3, AlertTriangle, TrendingUp,
  Loader2, RefreshCw, AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { api, type ProgressResult } from "@/lib/api";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getProgress()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const mistakeColor = (count: number) =>
    count >= 4 ? "red" : count >= 2 ? "yellow" : "gray";

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            Progress
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-fg)" }}>
            Mistake tracking, pattern strength, and improvement insights.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", color: "var(--muted-fg)" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-4 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
        >
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent-light)" }} />
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Problems Analyzed", val: data?.problems_analyzed ?? 0, color: "#7c3aed" },
              { label: "Total Hints Used", val: data?.hints_used ?? 0, color: "#f59e0b" },
              { label: "Accuracy", val: `${data?.accuracy ?? 0}%`, color: "#10b981" },
              { label: "Weakest Pattern", val: data?.weakest_pattern ?? "—", color: "#ef4444" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
              >
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-fg)" }}>
                  {s.label}
                </p>
                <p className="text-xl font-bold" style={{ color: s.color }}>
                  {s.val}
                </p>
              </div>
            ))}
          </div>

          {/* Mistake Dashboard */}
          <section
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--card-border)" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ background: "var(--card-bg)", borderBottom: "1px solid var(--card-border)" }}
            >
              <AlertTriangle size={15} style={{ color: "#f59e0b" }} />
              <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                Mistake Dashboard
              </h2>
              <span className="ml-auto text-xs" style={{ color: "var(--muted-fg)" }}>
                {data?.mistakes?.length ?? 0} categories tracked
              </span>
            </div>

            {(data?.mistakes?.length ?? 0) === 0 ? (
              <div
                className="px-5 py-10 text-center"
                style={{ background: "var(--card-bg)" }}
              >
                <p className="text-sm" style={{ color: "var(--muted-fg)" }}>
                  No mistakes recorded yet — submit some code reviews to start tracking.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm" style={{ background: "var(--card-bg)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                    {["Mistake Type", "Count", "Last Occurred", "Suggested Improvement"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{ color: "var(--muted-fg)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data!.mistakes.map((m, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: "1px solid var(--card-border)" }}
                      className="transition-colors hover:bg-white/2"
                    >
                      <td className="px-5 py-3">
                        <Badge color={mistakeColor(m.count)}>{m.mistake_type}</Badge>
                      </td>
                      <td className="px-5 py-3 font-bold" style={{ color: m.count >= 4 ? "var(--red)" : "var(--foreground)" }}>
                        {m.count}×
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--muted-fg)" }}>
                        {m.last_occurred}
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: "var(--muted-fg)", maxWidth: "260px" }}>
                        {m.suggestion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Pattern Progress */}
          <section
            className="rounded-2xl p-6"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={15} style={{ color: "var(--accent-light)" }} />
              <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
                Pattern Strength Overview
              </h2>
            </div>
            <div className="space-y-4">
              {(data?.pattern_progress ?? []).map((p) => (
                <div key={p.pattern_name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {p.pattern_name}
                    </span>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-fg)" }}>
                      <span>{p.solved}/{p.attempts} solved</span>
                      <span>avg {p.average_rating.toFixed(1)}/10</span>
                      <span
                        className="font-bold"
                        style={{
                          color:
                            p.strength_score >= 70
                              ? "var(--green)"
                              : p.strength_score >= 40
                              ? "var(--yellow)"
                              : "var(--red)",
                        }}
                      >
                        {p.strength_score.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--card-border)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.strength_score}%`,
                        background:
                          p.strength_score >= 70
                            ? "linear-gradient(90deg,#10b981,#34d399)"
                            : p.strength_score >= 40
                            ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                            : "linear-gradient(90deg,#ef4444,#f87171)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
