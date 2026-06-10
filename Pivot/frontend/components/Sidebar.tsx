"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Code2,
  BarChart3,
  Map,
  MessageSquare,
  Zap,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze Problem", icon: Search },
  { href: "/practice", label: "Practice", icon: Code2 },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/chat", label: "Mentor Chat", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--card-border)" }}
      className="w-64 min-h-screen flex-shrink-0 flex flex-col"
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "var(--card-border)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center glow-accent"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)" }}
          >
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
              PatternPilot
            </p>
            <p className="text-xs" style={{ color: "var(--accent-light)" }}>
              AI
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "var(--accent-glow)" : "transparent",
                color: active ? "var(--accent-light)" : "var(--muted-fg)",
                borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t" style={{ borderColor: "var(--card-border)" }}>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Demo Mode — add{" "}
          <code
            className="px-1 rounded text-xs"
            style={{ background: "var(--card-bg)", color: "var(--accent-light)" }}
          >
            LLM_API_KEY
          </code>{" "}
          to enable AI
        </p>
      </div>
    </aside>
  );
}
