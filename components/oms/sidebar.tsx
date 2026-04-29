"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { navModules } from "@/lib/oms-data";
import {
  Bot,
  Building2,
  ChevronRight,
  Clock,
  DollarSign,
  GitBranch,
  LayoutDashboard,
  Menu,
  Sparkles,
  User,
  X,
  BarChart3,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  DollarSign,
  GitBranch,
  BarChart3,
  Clock,
};

const ACTIVE_BG = "#2563EB";
const ACTIVE_FG = "#FFFFFF";
const HOVER_BG = "#F1F5F9";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const module of navModules) {
      if (!module.submodules?.length) continue;
      initial[module.id] = module.submodules.some((sub) => pathname === sub.path || pathname.startsWith(sub.path + "/"));
    }
    return initial;
  });

  const isPrefixActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(path + "/");

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r bg-white transition-[width] duration-300",
        isExpanded ? "w-[220px]" : "w-[72px]"
      )}
      style={{ borderColor: "#E2E8F0" }}
    >
      <div className={cn("flex items-center border-b px-3 py-4", isExpanded ? "justify-between" : "justify-center")} style={{ borderColor: "#E2E8F0" }}>
        <div className="h-10 w-10 rounded-2xl bg-[#F1F5F9] flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-[#2563EB]" />
        </div>
        {isExpanded && <span className="text-sm font-semibold text-[#0F172A]">Talent Suite</span>}
        <button onClick={() => setIsExpanded((v) => !v)} className="rounded-xl p-2 hover:bg-[#F1F5F9]">
          {isExpanded ? <X className="h-4 w-4 text-[#64748B]" /> : <Menu className="h-4 w-4 text-[#64748B]" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navModules.map((module) => {
          const Icon = iconMap[module.icon] || LayoutDashboard;
          const hasSubmodules = !!module.submodules?.length;
          const modulePath = module.path ?? module.submodules?.[0]?.path ?? "/";
          const moduleActive = hasSubmodules
            ? module.submodules!.some((sub) => isPrefixActive(sub.path))
            : isPrefixActive(modulePath);
          const isOpen = openModules[module.id] ?? false;
          const headerClasses = cn(
            "w-full flex items-center rounded-2xl transition-all duration-200",
            isExpanded ? "h-11 gap-3 px-3" : "h-11 justify-center",
          );
          const headerStyle: React.CSSProperties = moduleActive
            ? { background: ACTIVE_BG, color: ACTIVE_FG, boxShadow: "0 8px 18px rgba(37,99,235,0.22)" }
            : { color: "#64748B" };

          return (
            <div key={module.id} className="mb-2">
              <button
                type="button"
                className={headerClasses}
                style={headerStyle}
                onClick={() => {
                  if (hasSubmodules && isExpanded) {
                    setOpenModules((prev) => ({ ...prev, [module.id]: !isOpen }));
                    return;
                  }
                  router.push(modulePath);
                }}
                onMouseEnter={(e) => {
                  if (!moduleActive) (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                }}
                onMouseLeave={(e) => {
                  if (!moduleActive) (e.currentTarget as HTMLElement).style.background = "";
                }}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {isExpanded && (
                  <>
                    <span className="flex-1 truncate text-sm font-medium">{module.label}</span>
                    {!!module.submodules?.length && (
                      <ChevronRight className={cn("h-3.5 w-3.5 opacity-60 transition-transform", isOpen && "rotate-90")} />
                    )}
                  </>
                )}
              </button>
              {isExpanded && hasSubmodules && isOpen && (
                <div className="mt-1 ml-3 space-y-1 pl-4">
                  {module.submodules!.map((sub) => {
                    const activeSub = isPrefixActive(sub.path);
                    return (
                      <Link
                        key={sub.path}
                        href={sub.path}
                        className={cn(
                          "flex h-9 items-center rounded-xl px-3 text-sm transition-colors",
                          activeSub ? "font-semibold" : "font-medium"
                        )}
                        style={
                          activeSub
                            ? { background: "#EFF6FF", color: "#2563EB" }
                            : { color: "#64748B" }
                        }
                        onMouseEnter={(e) => {
                          if (!activeSub) (e.currentTarget as HTMLElement).style.background = HOVER_BG;
                        }}
                        onMouseLeave={(e) => {
                          if (!activeSub) (e.currentTarget as HTMLElement).style.background = "";
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

      <div className="border-t px-2 py-3 space-y-2" style={{ borderColor: "#E2E8F0" }}>
        <button className={cn("w-full h-10 rounded-2xl flex items-center transition-colors hover:bg-[#F1F5F9]", isExpanded ? "px-3 gap-3" : "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-[#F1F5F9] flex items-center justify-center">
            <User className="h-4 w-4 text-[#64748B]" />
          </div>
          {isExpanded && <span className="text-sm text-[#64748B]">Profile</span>}
        </button>
        <button
          className={cn("w-full h-10 rounded-2xl flex items-center text-white shadow-sm transition-opacity hover:opacity-95", isExpanded ? "px-3 gap-3 justify-start" : "justify-center")}
          style={{ background: "#2563EB" }}
        >
          <Bot className="h-4 w-4" />
          {isExpanded && <span className="text-sm font-medium">AI Assistant</span>}
        </button>
      </div>
    </aside>
  );
}
