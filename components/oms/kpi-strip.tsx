"use client";

import { useRouter } from "next/navigation";
import { kpiData } from "@/lib/oms-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const kpiConfig = [
  { key: "headcount", label: "Headcount", icon: "HC" },
  { key: "positions", label: "Positions", icon: "POS" },
  { key: "vacancy", label: "Vacancy", icon: "VAC" },
  { key: "hcGap", label: "HC Gap", icon: "GAP" },
  { key: "utilization", label: "Utilization", icon: "UTL" },
  { key: "cost", label: "Total Cost", icon: "$" },
  { key: "kpiScore", label: "KPI Score", icon: "KPI" },
] as const;

type KpiKey = keyof typeof kpiData;

const kpiRouteMap: Record<string, string> = {
  headcount: "/organization/employees",
  positions: "/organization/positions",
  vacancy: "/organization/positions?status=Open",
  hcGap: "/scenario/builder",
  utilization: "/workload-activity/utilization-dashboard",
  cost: "/financial/overview",
  kpiScore: "/business-process/process-directory",
};

function statusColor(status: string) {
  if (status === "good") return { bg: "#EDF7F0", text: "#16A34A", dot: "#16A34A" };
  if (status === "warning") return { bg: "#FEF9EC", text: "#D97706", dot: "#D97706" };
  return { bg: "#FEF2F2", text: "#DC2626", dot: "#DC2626" };
}

export function KpiStrip() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-7 gap-3">
      {kpiConfig.map(({ key, label }) => {
        const kpi = kpiData[key as KpiKey];
        const colors = statusColor(kpi.status);
        const isUp = kpi.trend.startsWith("+");
        const isDown = kpi.trend.startsWith("-");

        return (
          <button
            key={key}
            onClick={() => router.push(kpiRouteMap[key] || "/")}
            className="bg-card rounded-xl p-4 border border-border hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
          >
            {/* Status dot + trend */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: colors.dot }}
              />
              <span
                className="text-xs font-medium flex items-center gap-0.5"
                style={{ color: colors.text }}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {kpi.trend}
              </span>
            </div>

            {/* Value */}
            <p className="text-2xl font-bold text-foreground leading-none mb-1">
              {kpi.prefix}{typeof kpi.value === "number" && kpi.unit === "%" ? kpi.value : kpi.value.toLocaleString()}{kpi.unit}
            </p>

            {/* Label */}
            <p className="text-xs text-muted-foreground font-medium">{label}</p>

            {/* Target */}
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Target</span>
                <span className="text-xs font-medium text-foreground">
                  {kpi.prefix}{kpi.target.toLocaleString()}{kpi.unit}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
