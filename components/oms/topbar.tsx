"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Bell, Search, Settings, ChevronDown, X } from "lucide-react";
import { criticalAlerts } from "@/lib/oms-data";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  breadcrumb?: string[];
  /** Optional node rendered between the title and the standard right-side controls */
  actions?: ReactNode;
}

export function TopBar({ title = "OM+", subtitle, breadcrumb, actions }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const openAlerts = criticalAlerts.filter((a) => a.status === "Open").slice(0, 5);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3.5 bg-card border-b border-border">
      {/* Left: Title */}
      <div>
        {breadcrumb && (
          <p className="text-xs text-muted-foreground mb-0.5">
            {breadcrumb.join(" / ")}
          </p>
        )}
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {actions && <div className="flex items-center gap-2 border-r pr-2 mr-1">{actions}</div>}
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search modules, employees..."
            className="pl-8 pr-4 py-1.5 text-sm bg-muted rounded-lg border border-border w-56 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="w-4.5 h-4.5 text-foreground" style={{ width: 18, height: 18 }} />
            {openAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                <button onClick={() => setNotifOpen(false)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {openAlerts.map((a) => (
                  <div key={a.id} className="px-4 py-3 border-b border-border last:border-0 hover:bg-muted cursor-pointer">
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                        a.severity === "Critical" ? "bg-destructive" :
                        a.severity === "High" ? "bg-warning" : "bg-chart-2"
                      )} style={{ background: a.severity === "Critical" ? "var(--destructive)" : a.severity === "High" ? "var(--warning)" : "var(--accent)" }} />
                      <div>
                        <p className="text-xs text-foreground leading-relaxed">{a.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.dept} · {a.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5">
                <button className="text-xs font-medium w-full text-center" style={{ color: "var(--primary)" }}>
                  View all alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
          <Settings className="text-foreground" style={{ width: 18, height: 18 }} />
        </button>

        {/* User */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--primary)" }}>
            JD
          </div>
          <span className="text-sm font-medium text-foreground hidden md:block">John Doe</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
