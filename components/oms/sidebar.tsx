"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navModules } from "@/lib/oms-data";
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  GitBranch,
  BarChart3,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  DollarSign,
  GitBranch,
  BarChart3,
  Clock,
};

// OM+ active highlight per spec — soft indigo bg, indigo bold text
const ACTIVE_BG = "#EEF2FF";
const ACTIVE_FG = "#4F46E5";
const HOVER_BG = "#F1F5F9";

export function Sidebar() {
  const pathname = usePathname();

  const initialExpanded = (() => {
    const out: Record<string, boolean> = {};
    for (const m of navModules) {
      if (!m.submodules) continue;
      out[m.id] = m.submodules.some((s) => pathname === s.path || pathname.startsWith(s.path + "/"));
    }
    return out;
  })();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded);

  const toggleModule = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const isExactActive = (path: string) => pathname === path;
  const isPrefixActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-30 overflow-hidden border-r"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Logo — "OM+" wordmark, dark text on white */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#4F46E5" }}
        >
          <span className="text-white text-base font-bold leading-none">+</span>
        </div>
        <div>
          <p
            className="text-[20px] font-bold leading-none tracking-tight"
            style={{ color: "#0F172A" }}
          >
            OM+
          </p>
          <p className="text-[11px] mt-1" style={{ color: "#94A3B8" }}>
            Organization Management
          </p>
        </div>
      </div>

      {/* Nav — strict 6 modules; dashboard is direct, others accordion */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navModules.map((module) => {
          const Icon = iconMap[module.icon] || LayoutDashboard;
          const hasSub = !!module.submodules && module.submodules.length > 0;
          const isOpen = expanded[module.id];
          const directActive = !hasSub && module.path ? isPrefixActive(module.path) : false;
          const accordionActive = hasSub
            ? module.submodules!.some((s) => isPrefixActive(s.path))
            : false;
          const moduleActive = directActive || accordionActive;

          // Module header — light theme: slate text default, indigo active
          const headerClasses = cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm",
            moduleActive ? "font-semibold" : "font-medium",
          );
          const headerStyle: React.CSSProperties = directActive
            ? { background: ACTIVE_BG, color: ACTIVE_FG }
            : moduleActive
              ? { color: "#0F172A" }
              : { color: "#475569" };

          return (
            <div key={module.id} className="mb-0.5">
              {hasSub ? (
                <button
                  onClick={() => toggleModule(module.id)}
                  className={headerClasses}
                  style={headerStyle}
                  onMouseEnter={(e) => {
                    if (!directActive)
                      (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                  }}
                  onMouseLeave={(e) => {
                    if (!directActive)
                      (e.currentTarget as HTMLElement).style.background = "";
                  }}
                  aria-expanded={isOpen}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-sm">{module.label}</span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>
              ) : (
                <Link
                  href={module.path || "/"}
                  className={headerClasses}
                  style={headerStyle}
                  onMouseEnter={(e) => {
                    if (!directActive)
                      (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                  }}
                  onMouseLeave={(e) => {
                    if (!directActive)
                      (e.currentTarget as HTMLElement).style.background = "";
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-sm">{module.label}</span>
                </Link>
              )}

              {/* Submodules — white dropdown, indented hierarchy, no card nesting */}
              {hasSub && isOpen && (
                <div className="ml-7 mt-0.5 mb-1 flex flex-col gap-0.5">
                  {module.submodules!.map((sub) => {
                    const active =
                      isExactActive(sub.path) || pathname.startsWith(sub.path + "/");
                    return (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={cn(
                          "block px-3 py-1.5 rounded-lg text-[13px] transition-colors",
                          active ? "font-semibold" : "font-normal",
                        )}
                        style={
                          active
                            ? { color: ACTIVE_FG, background: ACTIVE_BG }
                            : { color: "#64748B" }
                        }
                        onMouseEnter={(e) => {
                          if (!active)
                            (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                        }}
                        onMouseLeave={(e) => {
                          if (!active)
                            (e.currentTarget as HTMLElement).style.background = "";
                        }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer — slate text on white */}
      <div className="px-4 py-4 border-t" style={{ borderColor: "#E5E7EB" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "#4F46E5" }}
          >
            JD
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: "#0F172A" }}
            >
              John Doe
            </p>
            <p className="text-[11px] truncate" style={{ color: "#94A3B8" }}>
              Finance Director
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
