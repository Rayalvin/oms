"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity as ActivityIcon,
  AlertCircle,
  ArrowLeftRight,
  Calculator,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Save,
  Send,
  Target,
  Trash2,
  TrendingUp,
  Users,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  employeesAll,
  processList,
  workloadActivities,
  type WorkloadActivity,
} from "@/lib/oms-data";

interface ActivityDetailPanelProps {
  activityId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (activity: WorkloadActivity) => void;
  onDelete?: (activity: WorkloadActivity) => void;
}

function utilColor(util: number) {
  if (util > 110) return "text-destructive";
  if (util >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (util >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-blue-600 dark:text-blue-400";
}

function staffingBadge(status: WorkloadActivity["staffingStatus"]) {
  const styles: Record<WorkloadActivity["staffingStatus"], string> = {
    Overloaded: "bg-destructive/15 text-destructive border-destructive/30",
    Understaffed: "bg-destructive/15 text-destructive border-destructive/30",
    Balanced: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    Underutilized: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
    "Significantly Underutilized":
      "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  };
  return <Badge className={styles[status]}>{status}</Badge>;
}

function criticalityBadge(level: WorkloadActivity["criticality"]) {
  const styles: Record<WorkloadActivity["criticality"], string> = {
    Critical: "bg-destructive/15 text-destructive border-destructive/30",
    High: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400",
    Medium: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
    Low: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={styles[level]}>
      {level}
    </Badge>
  );
}

export function ActivityDetailPanel({
  activityId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ActivityDetailPanelProps) {
  const activity = useMemo(
    () => workloadActivities.find((a) => a.id === activityId) ?? null,
    [activityId],
  );

  const [sentToWfp, setSentToWfp] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [hcReqOpen, setHcReqOpen] = useState(false);

  if (!activity) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Activity not found</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const process = processList.find((p) => p.id === activity.processId);
  const trendData = activity.trend.map((u, i) => ({
    month: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"][i],
    util: u,
  }));
  const capacityCompare = [
    { name: "Required", value: activity.requiredHc },
    { name: "Assigned", value: activity.assignedHc },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-3xl lg:max-w-4xl"
      >
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
          <SheetHeader className="px-6 pb-4 pt-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  Activity Detail
                </p>
                <SheetTitle className="text-pretty text-xl leading-tight">
                  {activity.name}
                </SheetTitle>
                <SheetDescription className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-mono">{activity.activityCode}</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>{activity.processCode}</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>Step {activity.seq}</span>
                  {criticalityBadge(activity.criticality)}
                  {staffingBadge(activity.staffingStatus)}
                </SheetDescription>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit?.(activity)}
                >
                  <Edit3 className="mr-2 h-3.5 w-3.5" />
                  Edit Activity
                </Button>
                <Button size="sm" onClick={() => setSubmitOpen(true)}>
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Submit Change
                </Button>
              </div>
            </div>
          </SheetHeader>
        </div>

        <Tabs defaultValue="identity" className="px-6 pb-8 pt-4">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="identity">Identity</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="formula">Formula</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
          </TabsList>

          {/* SECTION 1 — IDENTITY */}
          <TabsContent value="identity" className="mt-4 space-y-4">
            <Card>
              <CardContent className="grid gap-4 p-4 md:grid-cols-2">
                <Field label="Activity name" value={activity.name} />
                <Field label="Activity code" value={activity.activityCode} mono />
                <Field
                  label="Description"
                  value={activity.description}
                  className="md:col-span-2"
                  multiline
                />
                <Field label="Linked business process" value={activity.processName} />
                <Field label="Process step" value={`Step ${activity.seq}`} />
                <Field
                  label="Previous activity"
                  value={activity.previousActivityName ?? "— Start of process"}
                />
                <Field
                  label="Next activity"
                  value={activity.nextActivityName ?? "— End of process"}
                />
                <Field label="Owning department" value={activity.department} />
                <Field label="Responsible position" value={activity.responsiblePosition} />
                <Field label="Linked KPI" value={activity.linkedKpi} />
                <Field
                  label="Activity criticality"
                  value={activity.criticality}
                  custom={criticalityBadge(activity.criticality)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                <p className="text-xs text-muted-foreground">
                  Activity belongs to <span className="font-semibold text-foreground">{activity.processName}</span>
                  {process?.bottleneck && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-[11px] font-medium text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      Bottleneck
                    </span>
                  )}
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/process/portfolio?process=${activity.processId}`}>
                    <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
                    Open Business Process
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECTION 2 — PEOPLE */}
          <TabsContent value="people" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b p-4">
                  <p className="text-sm font-semibold">
                    {activity.assignedHc} {activity.assignedHc === 1 ? "person" : "people"}{" "}
                    performing this activity
                  </p>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add Employee
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Employee</th>
                        <th className="px-3 py-2 text-left font-medium">Position</th>
                        <th className="px-3 py-2 text-right font-medium">Allocation</th>
                        <th className="px-3 py-2 text-right font-medium">Avail. cap</th>
                        <th className="px-3 py-2 text-right font-medium">From this</th>
                        <th className="px-3 py-2 text-right font-medium">Other load</th>
                        <th className="px-3 py-2 text-right font-medium">Util</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activity.assignedEmployees.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-3 py-8 text-center text-sm text-muted-foreground"
                          >
                            No employees assigned. Click <strong>Add Employee</strong> to staff this activity.
                          </td>
                        </tr>
                      )}
                      {activity.assignedEmployees.map((eid) => {
                        const emp = employeesAll.find((e) => e.id === eid);
                        if (!emp) return null;
                        const allocation = Math.round(100 / activity.assignedHc);
                        const fromThis = Math.round(
                          activity.adjustedWorkload / activity.assignedHc,
                        );
                        const otherLoad = Math.max(
                          0,
                          Math.round(
                            (emp.utilization / 100) * activity.effectiveCapacityPerFte -
                              fromThis,
                          ),
                        );
                        return (
                          <tr key={eid} className="border-t">
                            <td className="px-3 py-2">
                              <p className="font-medium">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.id}</p>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {emp.position}
                              <br />
                              <span className="text-xs">{emp.dept}</span>
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {allocation}%
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {Math.round(activity.effectiveCapacityPerFte)}h
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {fromThis}h
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">
                              {otherLoad}h
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-semibold tabular-nums ${utilColor(emp.utilization)}`}
                            >
                              {emp.utilization}%
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                              >
                                <Link href={`/organization/employees/${emp.id}`}>
                                  View
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECTION 3 — INPUTS */}
          <TabsContent value="inputs" className="mt-4 space-y-4">
            <Card>
              <CardContent className="grid gap-4 p-4 md:grid-cols-2">
                <Field label="Frequency type" value={activity.frequencyType} />
                <Field
                  label="Frequency value"
                  value={`${activity.frequencyValue} executions / month`}
                />
                <Field
                  label="Average duration"
                  value={`${activity.duration} ${activity.durationUnit}`}
                />
                <Field
                  label="Complexity level"
                  value={`${activity.complexityLevel} (×${activity.complexityMultiplier})`}
                />
                <Field
                  label="Rework rate"
                  value={`${(activity.reworkRate * 100).toFixed(1)}%`}
                />
                <Field
                  label="Quality review factor"
                  value={`×${activity.qualityReviewFactor}`}
                />
                <Field
                  label="Seasonal peak factor"
                  value={`×${activity.seasonalPeakFactor}`}
                />
                <Field
                  label="Standard monthly capacity"
                  value={`${activity.monthlyCapacity} h / FTE`}
                />
                <Field
                  label="Productivity factor"
                  value={`×${activity.productivityFactor}`}
                />
                <Field
                  label="Effective capacity / FTE"
                  value={`${Math.round(activity.effectiveCapacityPerFte)} h / month`}
                  highlight
                />
                <Field label="Assigned HC" value={`${activity.assignedHc} FTE`} />
                <Field
                  label="Employee allocation"
                  value={
                    activity.assignedHc > 0
                      ? `${Math.round(100 / activity.assignedHc)}% per assignee`
                      : "—"
                  }
                />
              </CardContent>
            </Card>

            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">
                  All inputs above feed the workload formula. Edit values via{" "}
                  <strong>Edit Activity</strong> to recalculate Required HC, Utilization
                  and Staffing Status.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECTION 4 — FORMULA */}
          <TabsContent value="formula" className="mt-4 space-y-4">
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Workload calculation formula</p>
                </div>

                <FormulaLine
                  label="Base Workload"
                  formula={`${activity.frequencyValue} × ${activity.duration}h`}
                  result={`${activity.baseWorkload} h / month`}
                />
                <FormulaLine
                  label="Adjusted Workload"
                  formula={`${activity.baseWorkload} × ${activity.complexityMultiplier} × ${activity.qualityReviewFactor} × ${activity.seasonalPeakFactor} × ${(1 + activity.reworkRate).toFixed(2)}`}
                  result={`${activity.adjustedWorkload.toFixed(2)} h / month`}
                  primary
                />
                <FormulaLine
                  label="Effective Capacity / FTE"
                  formula={`${activity.monthlyCapacity} × ${activity.productivityFactor}`}
                  result={`${Math.round(activity.effectiveCapacityPerFte)} h / month`}
                />
                <FormulaLine
                  label="Required HC"
                  formula={`${activity.adjustedWorkload.toFixed(2)} ÷ ${Math.round(activity.effectiveCapacityPerFte)}`}
                  result={`${activity.requiredHc.toFixed(2)} FTE`}
                  primary
                />
                <FormulaLine
                  label="Utilization"
                  formula={`${activity.adjustedWorkload.toFixed(2)} ÷ (${activity.assignedHc} × ${Math.round(activity.effectiveCapacityPerFte)})`}
                  result={`${activity.utilization}%`}
                  primary
                />

                <Separator className="my-2" />

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Reference example (Procurement Validation)
                  </p>
                  <code className="block whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
{`Frequency = 120/mo · Duration = 0.75h
Base = 90h · Complexity 1.25 · Quality 1.10 · Seasonal 1.20 · Rework 8%
Adjusted = 160.38h · Effective Cap = 136h
Required HC = 1.18 · Assigned 1.0 · Util 118% → Overloaded`}
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECTION 5 — OUTPUT & STATUS */}
          <TabsContent value="output" className="mt-4 space-y-4">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              <KpiTile label="Base Workload" value={`${activity.baseWorkload} h`} />
              <KpiTile
                label="Adjusted Workload"
                value={`${activity.adjustedWorkload.toFixed(0)} h`}
                highlight
              />
              <KpiTile label="Required HC" value={`${activity.requiredHc.toFixed(2)}`} />
              <KpiTile label="Assigned HC" value={`${activity.assignedHc.toFixed(0)}`} />
              <KpiTile
                label="HC Gap"
                value={
                  activity.hcGap > 0
                    ? `+${activity.hcGap.toFixed(2)}`
                    : activity.hcGap.toFixed(2)
                }
                tone={activity.hcGap > 0 ? "danger" : "success"}
              />
              <KpiTile
                label="Utilization"
                value={`${activity.utilization}%`}
                tone={
                  activity.utilization > 110
                    ? "danger"
                    : activity.utilization >= 90
                      ? "success"
                      : "warning"
                }
              />
              <KpiTile
                label="Staffing Status"
                value={activity.staffingStatus}
                tone={
                  activity.staffingStatus === "Balanced"
                    ? "success"
                    : activity.staffingStatus === "Overloaded" ||
                        activity.staffingStatus === "Understaffed"
                      ? "danger"
                      : "warning"
                }
                small
              />
              <KpiTile
                label="Criticality"
                value={activity.criticality}
                tone={
                  activity.criticality === "Critical" || activity.criticality === "High"
                    ? "danger"
                    : "neutral"
                }
                small
              />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Demand vs Capacity
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Demand{" "}
                    <span className="font-semibold text-foreground">
                      {activity.adjustedWorkload.toFixed(0)} h
                    </span>{" "}
                    · Capacity{" "}
                    <span className="font-semibold text-foreground">
                      {Math.round(activity.assignedHc * activity.effectiveCapacityPerFte)} h
                    </span>
                  </p>
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Adjusted demand</span>
                        <span className="font-semibold tabular-nums">
                          {activity.adjustedWorkload.toFixed(0)} h
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, Math.max(0, (activity.adjustedWorkload / Math.max(0.001, activity.adjustedWorkload + activity.assignedHc * Math.max(1, activity.effectiveCapacityPerFte))) * 200))}
                        className="h-2.5"
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Assigned capacity</span>
                        <span className="font-semibold tabular-nums">
                          {Math.round(activity.assignedHc * Math.max(1, activity.effectiveCapacityPerFte))} h
                        </span>
                      </div>
                      <Progress
                        value={Math.min(100, Math.max(0, ((activity.assignedHc * Math.max(1, activity.effectiveCapacityPerFte)) / Math.max(0.001, activity.adjustedWorkload + activity.assignedHc * Math.max(1, activity.effectiveCapacityPerFte))) * 200))}
                        className="h-2.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Utilization gauge
                  </p>
                  <UtilGauge value={activity.utilization} />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Required vs Assigned HC
                  </p>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={capacityCompare} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Monthly workload trend
                  </p>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} unit="%" />
                      <Tooltip
                        contentStyle={{
                          background: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="util"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SECTION 6 — LINKS */}
          <TabsContent value="links" className="mt-4 space-y-4">
            <Card>
              <CardContent className="grid gap-2 p-4">
                <SystemLink
                  icon={<ArrowLeftRight className="h-4 w-4" />}
                  label="Source business process"
                  value={`${activity.processCode} · ${activity.processName}`}
                  href={`/process/portfolio?process=${activity.processId}`}
                />
                <SystemLink
                  icon={<Users className="h-4 w-4" />}
                  label="Responsible position"
                  value={activity.responsiblePosition}
                  href={`/organization/positions`}
                />
                <SystemLink
                  icon={<Target className="h-4 w-4" />}
                  label="Linked KPI"
                  value={activity.linkedKpi}
                  href={`/dashboard/kpi`}
                />
                <SystemLink
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Scenario Builder HC simulation"
                  value={`Required ${activity.requiredHc.toFixed(2)} FTE`}
                  href={`/scenario/builder`}
                />
                <SystemLink
                  icon={<ActivityIcon className="h-4 w-4" />}
                  label="Utilization Dashboard"
                  value={`Current ${activity.utilization}%`}
                  href={`/workload/utilization`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="text-sm font-semibold">Push to Workforce Planning</p>
                  <p className="text-xs text-muted-foreground">
                    Sends required HC ({activity.requiredHc.toFixed(2)} FTE) for{" "}
                    {activity.role} into the Workforce Planning module.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHcReqOpen(true)}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Create HC Request
                  </Button>
                  <Button size="sm" onClick={() => setSentToWfp(true)}>
                    <Send className="mr-2 h-3.5 w-3.5" />
                    {sentToWfp ? "Sent" : "Send Required HC"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer actions bar — sticky */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t bg-background/95 px-6 py-3 backdrop-blur">
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onDelete?.(activity)}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Recalculate
            </Button>
            <Button size="sm" variant="outline">
              <Save className="mr-2 h-3.5 w-3.5" />
              Save Changes
            </Button>
            <Button size="sm" onClick={() => setSubmitOpen(true)}>
              Submit for Approval
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Submit for Approval dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit change for approval</DialogTitle>
            <DialogDescription>
              The change to <strong>{activity.name}</strong> ({activity.activityCode})
              will be routed to <strong>Workflow &amp; Governance</strong> for
              approval. Required HC of {activity.requiredHc.toFixed(2)} FTE will be
              re-published once approved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSubmitOpen(false)}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create HC request dialog */}
      <Dialog open={hcReqOpen} onOpenChange={setHcReqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create HC request</DialogTitle>
            <DialogDescription>
              An HC request for {Math.max(0, activity.hcGap).toFixed(2)} additional
              FTE in role <strong>{activity.role}</strong> ({activity.department})
              will be created in Workforce Planning.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHcReqOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setHcReqOpen(false)}>Create request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- */
/* small primitives                                                  */
/* ---------------------------------------------------------------- */

function Field({
  label,
  value,
  className = "",
  mono = false,
  multiline = false,
  highlight = false,
  custom,
}: {
  label: string;
  value: string;
  className?: string;
  mono?: boolean;
  multiline?: boolean;
  highlight?: boolean;
  custom?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {custom ? (
        custom
      ) : (
        <p
          className={[
            "text-sm",
            mono ? "font-mono" : "font-medium",
            multiline ? "leading-relaxed" : "",
            highlight ? "rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary" : "",
          ].join(" ")}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function FormulaLine({
  label,
  formula,
  result,
  primary = false,
}: {
  label: string;
  formula: string;
  result: string;
  primary?: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5",
        primary ? "border-primary/30 bg-primary/5" : "bg-muted/20",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <code className="block break-all text-[11px] text-muted-foreground">
          {formula}
        </code>
      </div>
      <span
        className={[
          "rounded-md px-2 py-1 text-sm font-bold tabular-nums",
          primary ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground",
        ].join(" ")}
      >
        {result}
      </span>
    </div>
  );
}

function KpiTile({
  label,
  value,
  tone = "neutral",
  highlight = false,
  small = false,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  highlight?: boolean;
  small?: boolean;
}) {
  const toneClass: Record<typeof tone, string> = {
    neutral: "text-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-destructive",
  };
  return (
    <Card className={highlight ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={[
            small ? "text-base" : "text-xl",
            "font-bold tabular-nums leading-tight",
            toneClass[tone],
          ].join(" ")}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function SystemLink({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-lg border p-3 transition hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function UtilGauge({ value }: { value: number }) {
  const clamped = Math.min(150, Math.max(0, value));
  const angle = (clamped / 150) * 180 - 90;
  const tone =
    value > 110
      ? "stroke-destructive"
      : value >= 90
        ? "stroke-emerald-500"
        : value >= 70
          ? "stroke-amber-500"
          : "stroke-blue-500";
  return (
    <div className="relative mx-auto h-28 w-48">
      <svg viewBox="0 0 200 100" className="h-full w-full">
        {/* track */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          className="stroke-muted"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* fill */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          className={tone}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 150) * 282.7} 282.7`}
        />
        {/* needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 70 * Math.cos((angle * Math.PI) / 180)}
          y2={100 + 70 * Math.sin((angle * Math.PI) / 180)}
          className="stroke-foreground"
          strokeWidth="2"
        />
        <circle cx="100" cy="100" r="5" className="fill-foreground" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className={`text-2xl font-bold tabular-nums ${utilColor(value)}`}>
          {value}%
        </p>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          utilization
        </p>
      </div>
    </div>
  );
}
