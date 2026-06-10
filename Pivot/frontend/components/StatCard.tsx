import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: string;
  sub?: string;
}

export function StatCard({ label, value, icon, accent = "#7c3aed", sub }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-fg)" }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}22`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: "var(--muted-fg)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
