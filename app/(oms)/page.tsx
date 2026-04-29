"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/oms/topbar";
import { KpiStrip } from "@/components/oms/kpi-strip";
import {
  ProcessHealthWidget,
  WorkforceRiskWidget,
  HcGapHeatmapWidget,
  CostVsBudgetWidget,
  PendingApprovalsWidget,
  GrowthTrendWidget,
} from "@/components/oms/dashboard-widgets";
import { RightPanel } from "@/components/oms/right-panel";
import { AiAssistant } from "@/components/oms/ai-assistant";
import { criticalAlerts } from "@/lib/oms-data";
import { cn } from "@/lib/utils";
import { Filter, RefreshCw, Download, AlertTriangle, CheckCircle2, Clock, Info, Eye } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Critical", "High", "Medium", "Low"];
  const normalizedAlerts = criticalAlerts.map((a) => ({
    ...a,
    status: a.actionRequired ? "Open" : "Resolved",
    dept: a.module,
    time: a.timestamp,
  }));

  const filteredAlerts =
    activeFilter === "All"
      ? normalizedAlerts
      : normalizedAlerts.filter((a) => a.severity === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        title="Management Dashboard"
        subtitle="— Live Overview"
        breadcrumb={["OM+", "Dashboard"]}
      />

      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Period:</span>
            {["This Month", "Q2 2026", "YTD", "Custom"].map((p) => (
              <button
                key={p}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium",
                  p === "This Month"
                    ? "text-white border-transparent"
                    : "bg-card border-border text-foreground hover:bg-muted"
                )}
                style={p === "This Month" ? { background: "var(--primary)", borderColor: "var(--primary)" } : {}}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-card transition-colors">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-card transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border bg-card transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Key Performance Indicators</h2>
            <button
              onClick={() => router.push("/scenario/directory")}
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View Drilldown
            </button>
          </div>
          <KpiStrip />
        </section>

        <div className="grid grid-cols-[1fr_300px] gap-6">
          <div className="min-w-0 space-y-6">
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-3">Widget Dashboard</h2>
              <div className="grid grid-cols-2 gap-4">
                <ProcessHealthWidget />
                <WorkforceRiskWidget />
                <HcGapHeatmapWidget />
                <CostVsBudgetWidget />
                <PendingApprovalsWidget />
                <GrowthTrendWidget />
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-foreground">Critical Alerts</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
                    {normalizedAlerts.filter((a) => a.status === "Open").length} Open
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-lg border transition-colors font-medium",
                        activeFilter === f
                          ? "text-white border-transparent"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      )}
                      style={activeFilter === f ? { background: "var(--primary)", borderColor: "var(--primary)" } : {}}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Alert</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Department</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Severity</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Time</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert, i) => {
                      const sc = alert.severity === "Critical"
                        ? { bg: "#FEF2F2", text: "#DC2626" }
                        : alert.severity === "High"
                        ? { bg: "#FEF9EC", text: "#D97706" }
                        : alert.severity === "Medium"
                        ? { bg: "#EFF6FF", text: "#2563EB" }
                        : { bg: "#F0FDF4", text: "#16A34A" };
                      return (
                        <tr
                          key={alert.id}
                          className={cn(
                            "border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer",
                            i % 2 === 0 ? "" : "bg-muted/20"
                          )}
                          onClick={() => router.push("/scenario/directory")}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              {alert.severity === "Critical" ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                              ) : alert.status === "Resolved" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : alert.status === "In Progress" ? (
                                <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                              )}
                              <span className="text-xs text-foreground leading-relaxed">{alert.message}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{alert.dept}</td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: sc.bg, color: sc.text }}
                            >
                              {alert.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{alert.time}</td>
                          <td className="px-4 py-3">
                            <span
                              className="text-xs font-medium"
                              style={{
                                color:
                                  alert.status === "Open"
                                    ? "#DC2626"
                                    : alert.status === "In Progress"
                                    ? "#D97706"
                                    : alert.status === "Resolved"
                                    ? "#16A34A"
                                    : "#6B7A99",
                              }}
                            >
                              {alert.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                              onClick={(e) => { e.stopPropagation(); router.push("/scenario/directory"); }}
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside>
            <RightPanel />
          </aside>
        </div>
      </main>

      <AiAssistant />
    </div>
  );
}
