import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: "violet" | "blue" | "green" | "yellow" | "red" | "gray";
}

const COLORS: Record<string, { bg: string; text: string }> = {
  violet: { bg: "rgba(124,58,237,0.18)", text: "#a78bfa" },
  blue:   { bg: "rgba(59,130,246,0.18)", text: "#60a5fa" },
  green:  { bg: "rgba(16,185,129,0.18)", text: "#34d399" },
  yellow: { bg: "rgba(245,158,11,0.18)", text: "#fbbf24" },
  red:    { bg: "rgba(239,68,68,0.18)",  text: "#f87171" },
  gray:   { bg: "rgba(75,85,99,0.3)",    text: "#9ca3af" },
};

export function Badge({ children, color = "violet" }: BadgeProps) {
  const { bg, text } = COLORS[color] ?? COLORS.gray;
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color: text }}
    >
      {children}
    </span>
  );
}

export function difficultyBadge(difficulty: string) {
  const map: Record<string, BadgeProps["color"]> = {
    Easy: "green",
    Medium: "yellow",
    Hard: "red",
  };
  return <Badge color={map[difficulty] ?? "gray"}>{difficulty}</Badge>;
}
