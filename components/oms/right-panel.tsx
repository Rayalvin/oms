"use client";

import { useRouter } from "next/navigation";
import { criticalAlerts, aiRecommendations } from "@/lib/oms-data";
import { Lightbulb, ArrowRight, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Critical: { bg: "#FEF2F2", text: "#DC2626" },
    High: { bg: "#FEF9EC", text: "#D97706" },
    Medium: { bg: "#EFF6FF", text: "#2563EB" },
    Low: { bg: "#F0FDF4", text: "#16A34A" },
  };
  const c = map[severity] || map.Low;
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: "#DC2626",
    "In Progress": "#D97706",
    Resolved: "#16A34A",
    Pending: "#6B7A99",
  };
  return (
    <span className="text-xs font-medium" style={{ color: map[status] || "#6B7A99" }}>
      {status}
    </span>
  );
}

export function RightPanel() {
  const router = useRouter();
  const normalizedAlerts = criticalAlerts.map((a) => ({
    ...a,
    status: a.actionRequired ? "Open" : "Resolved",
    time: a.timestamp,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* AI Insights */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border"
          style={{ background: "var(--primary-light)" }}>
          <Lightbulb className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>AI Insights</p>
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded font-medium text-white" style={{ background: "var(--primary)" }}>
            {aiRecommendations.length}
          </span>
        </div>
        <div className="divide-y divide-border">
          {aiRecommendations.slice(0, 2).map((rec) => (
            <div key={rec.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs font-semibold text-foreground leading-tight">{rec.title}</p>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0",
                  rec.category === "Critical" ? "bg-red-50 text-red-600" :
                  rec.category === "Risk" ? "bg-amber-50 text-amber-600" :
                  rec.category === "Optimization" ? "bg-blue-50 text-blue-600" :
                  "bg-green-50 text-green-600"
                )}>
                  {rec.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">{rec.description}</p>
              <button
                onClick={() => router.push("/scenario/directory")}
                className="flex items-center gap-1 text-xs font-semibold hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {rec.action} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="px-4 py-2.5 border-t border-border">
          <button
            onClick={() => router.push("/scenario/directory")}
            className="text-xs font-medium w-full text-center hover:underline"
            style={{ color: "var(--primary)" }}
          >
            View all {aiRecommendations.length} recommendations
          </button>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-semibold text-foreground">Active Alerts</p>
          <span className="ml-auto text-xs px-1.5 py-0.5 rounded font-medium bg-red-50 text-red-600">
            {normalizedAlerts.filter((a) => a.status === "Open").length} Open
          </span>
        </div>
        <div className="divide-y divide-border">
          {normalizedAlerts.slice(0, 5).map((a) => (
            <div key={a.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted cursor-pointer transition-colors">
              <div className="mt-0.5">
                {a.severity === "Critical" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                ) : a.severity === "High" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                ) : a.status === "Resolved" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Info className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground leading-tight">{a.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                  <StatusBadge status={a.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Quick Stats</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Open Vacancies", value: "380", color: "var(--destructive)" },
            { label: "Pending Approvals", value: "4", color: "var(--warning)" },
            { label: "Active Pipelines", value: "8", color: "var(--primary)" },
            { label: "Audit Alerts", value: "3", color: "var(--chart-5)" },
          ].map((s) => (
            <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
