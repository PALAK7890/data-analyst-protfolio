"use client";

import { useEffect, useState } from "react";
import {
  Map, Loader2, RefreshCw, CheckSquare, AlertCircle, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { api, type RoadmapResult, type RoadmapDay } from "@/lib/api";

const DAY_COLORS = [
  "#7c3aed", "#3b82f6", "#10b981", "#f59e0b",
  "#ec4899", "#06b6d4", "#8b5cf6",
];

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateRoadmap();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateRoadmap();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to regenerate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            7-Day Learning Roadmap
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-fg)" }}>
            Your personalized DSA practice plan based on weak patterns and mistakes.
          </p>
        </div>
        <button
          onClick={regenerate}
          disabled={generating || loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(124,58,237,0.3)",
          }}
        >
          {generating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          Regenerate Plan
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
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--accent-light)" }} />
          <p className="text-sm" style={{ color: "var(--muted-fg)" }}>
            Generating your personalized plan…
          </p>
        </div>
      ) : data ? (
        <>
          {/* Mentor advice */}
          <div
            className="rounded-2xl p-5 flex gap-4"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.3)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--accent-light)" }}>
                Mentor&apos;s Note
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>
                {data.advice}
              </p>
            </div>
          </div>

          {/* 7-day grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.plan.map((day, i) => (
              <DayCard key={day.day} day={day} color={DAY_COLORS[i % DAY_COLORS.length]} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function DayCard({ day, color }: { day: RoadmapDay; color: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-transform duration-150 hover:-translate-y-0.5"
      style={{
        background: "var(--card-bg)",
        border: `1px solid ${color}33`,
        boxShadow: `0 2px 16px ${color}10`,
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{ background: `${color}22`, color }}
        >
          {day.day}
        </div>
        <Badge color="violet">{day.pattern_focus}</Badge>
      </div>
      <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
        {day.title}
      </h3>
      <ul className="space-y-2 flex-1">
        {day.tasks.map((task, i) => (
          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--muted-fg)" }}>
            <CheckSquare size={12} className="mt-0.5 flex-shrink-0" style={{ color }} />
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
}
