"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain, Lightbulb, TrendingDown, Target,
  ArrowRight, RefreshCw, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/Badge";
import { api, type ProgressResult, type RevisionItem } from "@/lib/api";

export default function DashboardPage() {
  const [progress, setProgress] = useState<ProgressResult | null>(null);
  const [revision, setRevision] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getProgress(), api.getRevisionToday()])
      .then(([p, r]) => {
        setProgress(p);
        setRevision(r.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">PatternPilot AI</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-fg)" }}>
            Master DSA patterns with an AI mentor, not memorized solutions.
          </p>
        </div>
        <Link
          href="/analyze"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:opacity-90 hover:scale-105"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
            color: "#fff",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          }}
        >
          Analyze New Problem <ArrowRight size={15} />
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
        >
          <AlertCircle size={16} />
          Backend not reachable — make sure FastAPI is running on port 8000.
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl animate-pulse"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Problems Analyzed"
            value={progress?.problems_analyzed ?? 0}
            icon={<Brain size={16} />}
            accent="#7c3aed"
            sub="Total problems studied"
          />
          <StatCard
            label="Hints Used"
            value={progress?.hints_used ?? 0}
            icon={<Lightbulb size={16} />}
            accent="#f59e0b"
            sub="Across all sessions"
          />
          <StatCard
            label="Weakest Pattern"
            value={progress?.weakest_pattern ?? "N/A"}
            icon={<TrendingDown size={16} />}
            accent="#ef4444"
            sub="Focus area this week"
          />
          <StatCard
            label="Accuracy"
            value={`${progress?.accuracy ?? 0}%`}
            icon={<Target size={16} />}
            accent="#10b981"
            sub="Based on review ratings"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Revision */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} style={{ color: "var(--accent-light)" }} />
            <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              Today&apos;s Revision
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--accent-glow)", color: "var(--accent-light)" }}
            >
              {revision.length} due
            </span>
          </div>
          {revision.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <CheckCircle2 size={28} style={{ color: "var(--green)" }} />
              <p className="text-sm" style={{ color: "var(--muted-fg)" }}>
                All caught up! No revisions due today.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {revision.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: "rgba(124,58,237,0.07)", border: "1px solid var(--card-border)" }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {item.pattern_name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--muted-fg)" }}>
                      {item.review_date}
                    </span>
                    <span
                      className="pulse-dot w-2 h-2 rounded-full inline-block"
                      style={{ background: item.status === "pending" ? "var(--yellow)" : "var(--green)" }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pattern Strength */}
        <section
          className="rounded-2xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} style={{ color: "var(--accent-light)" }} />
            <h2 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              Pattern Strength
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 rounded animate-pulse" style={{ background: "var(--card-border)" }} />
              ))}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {(progress?.pattern_progress ?? []).slice(0, 7).map((p) => (
                <li key={p.pattern_name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted-fg)" }}>{p.pattern_name}</span>
                    <span style={{ color: "var(--foreground)" }}>{p.strength_score.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.strength_score}%`,
                        background:
                          p.strength_score >= 70
                            ? "var(--green)"
                            : p.strength_score >= 40
                            ? "var(--yellow)"
                            : "var(--red)",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent Mistakes */}
      {(progress?.mistakes?.length ?? 0) > 0 && (
        <section
          className="rounded-2xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--foreground)" }}>
            Recent Mistake Patterns
          </h2>
          <div className="flex flex-wrap gap-2">
            {progress!.mistakes.slice(0, 6).map((m) => (
              <div
                key={m.mistake_type}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <span className="text-xs font-medium" style={{ color: "#f87171" }}>
                  {m.mistake_type}
                </span>
                <Badge color="red">{m.count}×</Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { href: "/analyze", label: "Analyze Problem", desc: "Paste a new coding problem", color: "#7c3aed" },
          { href: "/practice", label: "Open Editor", desc: "Write and review code", color: "#3b82f6" },
          { href: "/roadmap", label: "View Roadmap", desc: "Your 7-day study plan", color: "#10b981" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-xl p-4 flex items-center justify-between group transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: `${a.color}11`,
              border: `1px solid ${a.color}33`,
            }}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: a.color }}>{a.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-fg)" }}>{a.desc}</p>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" style={{ color: a.color }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
