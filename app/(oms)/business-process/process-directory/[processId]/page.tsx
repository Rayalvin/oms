"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  GitBranch,
  History,
  Lightbulb,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TopBar } from "@/components/oms/topbar";
import { AiAssistant } from "@/components/oms/ai-assistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  processList,
  activityList,
  processIOMapping,
  processDependencies,
  processKPIMaps,
  employees,
} from "@/lib/oms-data";

// ---------- helpers ----------
const STATUS_STYLE: Record<string, string> = {
  "On Track": "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
  "At Risk": "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
};

const CRITICALITY_STYLE: Record<string, string> = {
  Low: "bg-muted text-foreground border-border",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
  High: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400",
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
};

function utilColor(util: number) {
  if (util > 100) return "text-destructive";
  if (util >= 70) return "text-emerald-600 dark:text-emerald-400";
  return "text-amber-600 dark:text-amber-400";
}

function staffingColor(s: string) {
  if (s === "Understaffed") return "text-destructive border-destructive/30";
  if (s === "Overstaffed") return "text-amber-600 border-amber-500/30 dark:text-amber-400";
  return "text-emerald-600 border-emerald-500/30 dark:text-emerald-400";
}

// ---------- page ----------
export default function ProcessDetailPage({
  params,
}: {
  params: Promise<{ processId: string }>;
}) {
  const { processId } = use(params);
  const router = useRouter();

  const process = useMemo(
    () => processList.find((p) => p.id === processId),
    [processId],
  );

  const [savedDialog, setSavedDialog] = useState(false);
  const [submitDialog, setSubmitDialog] = useState(false);
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // 404 state
  if (!process) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar
          title="Process not found"
          breadcrumb={["OM+", "Business Process", "Process Directory", "Detail"]}
        />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-medium">No process matches that ID.</p>
              <Button asChild>
                <Link href="/business-process/process-directory">Back to directory</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const owner = employees.find((e) => e.id === process.ownerId);
  const activities = activityList.filter((a) => a.processId === process.id);
  const kpiLinks = processKPIMaps.filter((k) => k.processId === process.id);
  const ioInputs = processIOMapping.filter((io) => io.toProcess === process.id);
  const ioOutputs = processIOMapping.filter((io) => io.fromProcess === process.id);
  const dependencies = processDependencies.filter(
    (d) => d.fromProcess === process.id || d.toProcess === process.id,
  );
  // Deterministic version history derived from process metadata
  const versions = [
    { version: "v1.0", date: "2024-01-15", author: "System", changes: "Initial process definition" },
    { version: "v1.1", date: "2024-04-20", author: "Process Owner", changes: "Activity allocations refined" },
    { version: "v2.0", date: "2024-09-08", author: "BPM Lead", changes: "KPI bindings & I/O mapping added" },
    { version: "v2.1", date: process.lastUpdated || "2025-02-14", author: "Process Owner", changes: "Latest published baseline" },
  ];

  // ----- aggregates -----
  const totalHours = activities.reduce((s, a) => s + a.workloadHours, 0);
  const avgUtil =
    activities.length > 0
      ? Math.round(activities.reduce((s, a) => s + a.utilization, 0) / activities.length)
      : 0;
  const uniqueEmployeeIds = Array.from(
    new Set(activities.flatMap((a) => a.assignedEmployees)),
  );
  const headcount = uniqueEmployeeIds.length;

  const allocatedEmployees = uniqueEmployeeIds
    .map((eid) => employees.find((e) => e.id === eid))
    .filter(Boolean) as typeof employees;

  // monthly cost: sum of (cost * activity-share-of-month) — proportional to time spent
  const monthlyCost = allocatedEmployees.reduce((sum, e) => {
    // assume ~22 working days, 8h/day = 176h/mo per employee
    const empActivities = activities.filter((a) => a.assignedEmployees.includes(e.id));
    const timeShare = empActivities.reduce((s, a) => s + a.workloadHours, 0) / 176;
    // employee.cost is annual fully-loaded; convert to monthly
    return sum + (e.cost / 12) * Math.min(1, timeShare);
  }, 0);

  // performance trend (synthetic 6-month from current actual baseline)
  const trendData = (() => {
    const base = process.efficiency;
    const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    return months.map((m, i) => {
      const drift = (i - 2) * 1.5 + (process.bottleneck ? -i * 0.5 : 0.4 * i);
      const efficiency = Math.max(40, Math.min(100, Math.round(base + drift)));
      const sla = Math.max(0, Math.round(process.sla * (0.9 + (i / 12)) * 10) / 10);
      const actual = Math.max(
        0.5,
        Math.round((process.actualTime + (i - 2) * 0.3) * 10) / 10,
      );
      return { month: m, efficiency, sla, actual };
    });
  })();

  // Cross-functional dependencies (resolved with names)
  const depRows = dependencies.map((d) => {
    const isInbound = d.toProcess === process.id;
    const otherId = isInbound ? d.fromProcess : d.toProcess;
    const other = processList.find((p) => p.id === otherId);
    return {
      direction: isInbound ? ("Upstream" as const) : ("Downstream" as const),
      otherId,
      other,
      criticality: d.criticality,
      delay: d.delay,
    };
  });

  // ---- AI insights (data-derived) ----
  const aiInsights: { tone: "good" | "warn" | "bad"; title: string; rec: string }[] = [];
  if (process.bottleneck) {
    aiInsights.push({
      tone: "bad",
      title: "Bottleneck identified",
      rec: `Mid-stream activity in ${process.name} is constraining throughput. Consider parallelizing approval steps or adding ${Math.max(1, Math.ceil(headcount * 0.15))} FTE.`,
    });
  }
  if (!process.slaMet) {
    aiInsights.push({
      tone: "bad",
      title: "SLA breach",
      rec: `Actual time (${process.actualTime}d) exceeds SLA (${process.sla}d). Audit handoff points and remove redundant approvals.`,
    });
  }
  if (avgUtil > 95) {
    aiInsights.push({
      tone: "warn",
      title: "Workforce overload",
      rec: `Average activity utilization is ${avgUtil}%. Distribute workload across more contributors to reduce burnout risk.`,
    });
  } else if (avgUtil > 0 && avgUtil < 60) {
    aiInsights.push({
      tone: "warn",
      title: "Underutilized team",
      rec: `Average utilization is ${avgUtil}%. Consolidate tasks or reassign capacity to higher-priority processes.`,
    });
  }
  if (process.kpiScore >= 90) {
    aiInsights.push({
      tone: "good",
      title: "High-performing process",
      rec: `KPI score of ${process.kpiScore}% indicates strong execution. Document best practices and replicate to peer processes.`,
    });
  }
  if (aiInsights.length === 0) {
    aiInsights.push({
      tone: "good",
      title: "Operating within targets",
      rec: "All key indicators are within normal range. Continue routine governance and monthly reviews.",
    });
  }

  // ---- Risk register ----
  const risks: { tone: "bad" | "warn" | "good"; label: string; detail: string }[] = [];
  risks.push(
    process.bottleneck
      ? { tone: "bad", label: "Bottleneck flag", detail: "Process flagged as workflow bottleneck." }
      : { tone: "good", label: "Flow", detail: "No bottleneck detected." },
  );
  risks.push(
    process.slaMet
      ? { tone: "good", label: "SLA", detail: `Met (${process.actualTime}d ≤ ${process.sla}d).` }
      : { tone: "bad", label: "SLA", detail: `Breached (${process.actualTime}d > ${process.sla}d).` },
  );
  risks.push(
    process.efficiency >= 85
      ? { tone: "good", label: "Efficiency", detail: `${process.efficiency}% — healthy.` }
      : process.efficiency >= 70
        ? { tone: "warn", label: "Efficiency", detail: `${process.efficiency}% — monitor.` }
        : { tone: "bad", label: "Efficiency", detail: `${process.efficiency}% — at risk.` },
  );
  risks.push(
    headcount >= 3
      ? { tone: "good", label: "Coverage", detail: `${headcount} contributors assigned.` }
      : { tone: "warn", label: "Coverage", detail: `Only ${headcount} contributor(s) — single-point risk.` },
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        title={process.name}
        breadcrumb={["OM+", "Business Process", "Process Directory", process.code]}
      />

      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to directory
          </Button>
          <div className="text-xs text-muted-foreground">
            Last updated <span className="font-medium text-foreground">{process.lastUpdated}</span>
            {" • "}Version <span className="font-medium text-foreground">{process.version}</span>
          </div>
        </div>

        {/* ============ 1. HERO ============ */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {process.code}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${STATUS_STYLE[process.status] ?? ""}`}>
                    {process.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {process.category}
                  </Badge>
                  {process.bottleneck && (
                    <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/30">
                      <Zap className="mr-1 h-3 w-3" />
                      Bottleneck
                    </Badge>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {process.name}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty">
                  {process.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setSavedDialog(true)}>
                  <Edit3 className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDuplicateDialog(true)}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Duplicate
                </Button>
                <Button size="sm" onClick={() => setSubmitDialog(true)}>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Submit Changes
                </Button>
              </div>
            </div>

            {/* Hero KPIs */}
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
              <HeroKpi
                icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                label="SLA Status"
                value={process.slaMet ? "Met" : "Breached"}
                tone={process.slaMet ? "good" : "bad"}
                hint={`${process.actualTime}d / ${process.sla}d`}
              />
              <HeroKpi
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Efficiency"
                value={`${process.efficiency}%`}
                tone={process.efficiency >= 85 ? "good" : process.efficiency >= 70 ? "warn" : "bad"}
                hint="vs baseline"
              />
              <HeroKpi
                icon={<TrendingUp className="h-3.5 w-3.5" />}
                label="KPI Score"
                value={`${process.kpiScore}%`}
                tone={process.kpiScore >= 80 ? "good" : process.kpiScore >= 60 ? "warn" : "bad"}
                hint={`${kpiLinks.length} linked KPI${kpiLinks.length === 1 ? "" : "s"}`}
              />
              <HeroKpi
                icon={<Users className="h-3.5 w-3.5" />}
                label="Headcount"
                value={headcount.toString()}
                tone="neutral"
                hint={`${activities.length} activities`}
              />
              <HeroKpi
                icon={<GitBranch className="h-3.5 w-3.5" />}
                label="Frequency"
                value={process.frequency}
                tone="neutral"
                hint={process.dept}
              />
            </div>
          </CardContent>
        </Card>

        {/* ============ 2. ACTIVITY & WORKLOAD SUMMARY ============ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Activity &amp; Workload Summary</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activities.length} activities • {Math.round(totalHours)}h/month total demand • {avgUtil}% avg utilization
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/workload-activity/activity-directory">
                Open Activity Directory <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                No activities mapped to this process yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="h-9 w-10 text-xs">#</TableHead>
                      <TableHead className="h-9 text-xs">Activity</TableHead>
                      <TableHead className="h-9 text-xs">Role</TableHead>
                      <TableHead className="h-9 text-right text-xs">Hours/mo</TableHead>
                      <TableHead className="h-9 text-center text-xs">Util%</TableHead>
                      <TableHead className="h-9 text-center text-xs">Staffing</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((a) => (
                      <TableRow
                        key={a.id}
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() =>
                          router.push(`/workload-activity/activity-directory/${a.id}`)
                        }
                      >
                        <TableCell className="text-xs text-muted-foreground">{a.seq}</TableCell>
                        <TableCell className="text-xs font-medium">{a.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.role}</TableCell>
                        <TableCell className="text-right text-xs font-mono tabular-nums">
                          {Math.round(a.workloadHours)}
                        </TableCell>
                        <TableCell className={`text-center text-xs font-medium ${utilColor(a.utilization)}`}>
                          {a.utilization}%
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-[10px] ${staffingColor(a.staffingStatus)}`}>
                            {a.staffingStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============ 3. WORKFORCE COVERAGE & COST ALLOCATION ============ */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Workforce Coverage</CardTitle>
              <p className="text-xs text-muted-foreground">
                {headcount} contributor{headcount === 1 ? "" : "s"} across{" "}
                {new Set(allocatedEmployees.map((e) => e.dept)).size} department(s)
              </p>
            </CardHeader>
            <CardContent>
              {allocatedEmployees.length === 0 ? (
                <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                  No contributors assigned.
                </p>
              ) : (
                <div className="space-y-2">
                  {allocatedEmployees.slice(0, 8).map((e) => (
                    <Link
                      key={e.id}
                      href={`/organization/employees/${e.id}`}
                      className="flex items-center gap-3 rounded-md border p-2.5 hover:bg-muted/30"
                    >
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {e.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{e.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {e.position} • {e.dept}
                        </p>
                      </div>
                      <div className="flex-none text-right">
                        <p className={`text-xs font-semibold ${utilColor(e.utilization)}`}>
                          {e.utilization}%
                        </p>
                        <p className="text-[10px] text-muted-foreground">util</p>
                      </div>
                    </Link>
                  ))}
                  {allocatedEmployees.length > 8 && (
                    <p className="text-center text-[11px] text-muted-foreground">
                      +{allocatedEmployees.length - 8} more contributor{allocatedEmployees.length - 8 === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cost Allocation</CardTitle>
              <p className="text-xs text-muted-foreground">
                Estimated process cost based on contributor time-share
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Monthly Cost" value={`$${(monthlyCost / 1000).toFixed(1)}K`} />
                <Stat label="Annualized" value={`$${(monthlyCost * 12 / 1000).toFixed(0)}K`} />
                <Stat label="Cost per Run" value={`$${(monthlyCost / Math.max(1, _runsPerMonth(process.frequency))).toFixed(0)}`} />
                <Stat label="$ / hour" value={`$${(monthlyCost / Math.max(1, totalHours)).toFixed(0)}`} />
              </div>

              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={costByDept(allocatedEmployees, activities)}
                    margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dept" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                    />
                    <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============ 4. PERFORMANCE TREND ============ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance Trend</CardTitle>
            <p className="text-xs text-muted-foreground">6-month efficiency and cycle-time movement</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Efficiency %"
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    name="Actual time (d)"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ============ 5. CROSS-FUNCTIONAL DEPENDENCY ============ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cross-functional Dependency</CardTitle>
            <p className="text-xs text-muted-foreground">
              Inputs, outputs, and upstream/downstream process linkages
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* I/O */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Inputs ({ioInputs.length || 1})
                </h4>
                {ioInputs.length === 0 ? (
                  <p className="rounded-md border bg-muted/20 p-2.5 text-xs">
                    Source: <span className="font-medium">{process.inputSource}</span>
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {ioInputs.map((io) => {
                      const fromProc = processList.find((p) => p.id === io.fromProcess);
                      return (
                        <li key={io.id} className="rounded-md border p-2.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{io.input}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {io.dataType}
                            </Badge>
                          </div>
                          {fromProc && (
                            <Link
                              href={`/business-process/process-directory/${fromProc.id}`}
                              className="mt-1 flex items-center gap-1 text-[11px] text-primary hover:underline"
                            >
                              from {fromProc.name} <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Outputs ({ioOutputs.length || 1})
                </h4>
                {ioOutputs.length === 0 ? (
                  <p className="rounded-md border bg-muted/20 p-2.5 text-xs">
                    Deliverable:{" "}
                    <span className="font-medium">{process.outputDeliverable}</span>
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {ioOutputs.map((io) => {
                      const toProc = processList.find((p) => p.id === io.toProcess);
                      return (
                        <li key={io.id} className="rounded-md border p-2.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium">{io.output}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {io.dataType}
                            </Badge>
                          </div>
                          {toProc && (
                            <Link
                              href={`/business-process/process-directory/${toProc.id}`}
                              className="mt-1 flex items-center gap-1 text-[11px] text-primary hover:underline"
                            >
                              to {toProc.name} <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* Dependencies */}
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Process Dependencies ({depRows.length})
              </h4>
              {depRows.length === 0 ? (
                <p className="rounded-md border border-dashed py-4 text-center text-xs text-muted-foreground">
                  No upstream or downstream dependencies recorded.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="h-9 text-xs">Direction</TableHead>
                        <TableHead className="h-9 text-xs">Process</TableHead>
                        <TableHead className="h-9 text-xs">Criticality</TableHead>
                        <TableHead className="h-9 text-right text-xs">Delay (d)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depRows.map((d, idx) => (
                        <TableRow key={`${d.otherId}-${idx}`}>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              {d.direction}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {d.other ? (
                              <Link
                                href={`/business-process/process-directory/${d.other.id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {d.other.name}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">{d.otherId}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] ${CRITICALITY_STYLE[d.criticality] ?? ""}`}>
                              {d.criticality}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs tabular-nums">
                            {d.delay}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ============ 6. AI INSIGHT & RECOMMENDATION ============ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insight &amp; Recommendation
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Auto-generated optimization suggestions based on current metrics
            </p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {aiInsights.map((ins, i) => (
              <div
                key={i}
                className={`flex gap-3 rounded-md border p-3 ${
                  ins.tone === "bad"
                    ? "border-destructive/30 bg-destructive/5"
                    : ins.tone === "warn"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-emerald-500/30 bg-emerald-500/5"
                }`}
              >
                <Lightbulb
                  className={`mt-0.5 h-4 w-4 flex-none ${
                    ins.tone === "bad"
                      ? "text-destructive"
                      : ins.tone === "warn"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{ins.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{ins.rec}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ============ 7. PROCESS HEALTH & RISK ============ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Process Health &amp; Risk</CardTitle>
            <p className="text-xs text-muted-foreground">
              Live indicators across SLA, efficiency, flow, and coverage
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {risks.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-md border p-3 ${
                    r.tone === "bad"
                      ? "border-destructive/30 bg-destructive/5"
                      : r.tone === "warn"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-emerald-500/30 bg-emerald-500/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {r.tone === "bad" ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    ) : r.tone === "warn" ? (
                      <TrendingDown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {r.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground">{r.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ============ 8. AUDIT & COMPLIANCE ============ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Audit &amp; Compliance
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Version history, ownership, and last-modified trail
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Owner card */}
            <div className="flex items-center gap-3 rounded-md border bg-muted/20 p-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {process.owner.split(" ").map((s) => s[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{process.owner}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {process.ownerPosition} • {owner?.dept ?? process.dept}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/organization/employees/${process.ownerId}`}>View Owner</Link>
              </Button>
            </div>

            {/* Version log */}
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                Version History
              </h4>
              {versions.length === 0 ? (
                <p className="rounded-md border border-dashed py-4 text-center text-xs text-muted-foreground">
                  No version history recorded for this process.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="h-9 text-xs">Version</TableHead>
                        <TableHead className="h-9 text-xs">Date</TableHead>
                        <TableHead className="h-9 text-xs">Changes</TableHead>
                        <TableHead className="h-9 text-xs">Author</TableHead>
                        <TableHead className="h-9 text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map((v) => (
                        <TableRow key={v.version}>
                          <TableCell className="text-xs font-mono">{v.version}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{v.date}</TableCell>
                          <TableCell className="text-xs">{v.changes}</TableCell>
                          <TableCell className="text-xs">{v.author}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                v.status === "Active"
                                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {v.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ============ 9. ACTION CENTER ============ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Action Center</CardTitle>
            <p className="text-xs text-muted-foreground">
              Operate on this process — edits create a new draft version
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => setSavedDialog(true)}>
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setSubmitDialog(true)}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Submit for Approval
            </Button>
            <Button variant="outline" onClick={() => setDuplicateDialog(true)}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Duplicate as Draft
            </Button>
            <Button asChild variant="outline">
              <Link href="/business-process/process-chain">
                <GitBranch className="mr-1.5 h-3.5 w-3.5" />
                View in Process Chain
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteDialog(true)}
            >
              Delete Process
            </Button>
          </CardContent>
        </Card>
      </main>

      <AiAssistant />

      {/* dialogs */}
      <Dialog open={savedDialog} onOpenChange={setSavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changes saved</DialogTitle>
            <DialogDescription>
              {process.name} ({process.code}) has been saved as a working draft. Submit
              for approval to publish a new version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSavedDialog(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={submitDialog} onOpenChange={setSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submitted for approval</DialogTitle>
            <DialogDescription>
              {process.name} has been routed to {process.owner} for review. You will be
              notified when a decision is made.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSubmitDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={duplicateDialog} onOpenChange={setDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate process</DialogTitle>
            <DialogDescription>
              A draft copy of {process.name} will be created so you can iterate without
              affecting the live version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDuplicateDialog(false)}>Create Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this process?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. {activities.length} linked activities will be
              unlinked and the audit trail preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setDeleteDialog(false);
                router.push("/business-process/process-directory");
              }}
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- subcomponents ----------
function HeroKpi({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone: "good" | "warn" | "bad" | "neutral";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : tone === "bad"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-1.5 text-lg font-semibold leading-none ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 p-2.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

// ---------- helpers (pure) ----------
function _runsPerMonth(freq: string) {
  switch (freq) {
    case "Daily":
      return 22;
    case "Weekly":
      return 4;
    case "Monthly":
      return 1;
    case "Quarterly":
      return 1 / 3;
    case "Annual":
      return 1 / 12;
    case "Continuous":
      return 22;
    default:
      return 1;
  }
}

function costByDept(
  emps: { id: string; dept: string; cost: number }[],
  acts: { assignedEmployees: string[]; workloadHours: number }[],
) {
  const map = new Map<string, number>();
  emps.forEach((e) => {
    const empActs = acts.filter((a) => a.assignedEmployees.includes(e.id));
    const timeShare = empActs.reduce((s, a) => s + a.workloadHours, 0) / 176;
    const monthly = (e.cost / 12) * Math.min(1, timeShare);
    map.set(e.dept, (map.get(e.dept) ?? 0) + monthly);
  });
  return Array.from(map.entries())
    .map(([dept, cost]) => ({ dept, cost: Math.round(cost) }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 6);
}
