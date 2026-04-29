"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  processList,
  activityList,
  processIOMapping,
  processDependencies,
  processKPIMaps,
  processVersions,
  employees,
} from "@/lib/oms-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  Edit3,
  Send,
  Plus,
  Link2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  History,
  Users,
  Trash2,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ProcessDetailPanelProps {
  processId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    "On Track": "bg-chart-3/10 text-chart-3 border-chart-3/30",
    "At Risk": "bg-chart-4/10 text-chart-4 border-chart-4/30",
    Critical: "bg-chart-5/10 text-chart-5 border-chart-5/30",
    Bottleneck: "bg-chart-5/10 text-chart-5 border-chart-5/30",
    Active: "bg-chart-3/10 text-chart-3 border-chart-3/30",
  };
  return map[status] || "bg-muted text-foreground border-border";
};

const trendIcon = (trend: string) => {
  if (trend === "Up") return <TrendingUp className="w-3 h-3 text-chart-3" />;
  if (trend === "Down") return <TrendingDown className="w-3 h-3 text-chart-5" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export function ProcessDetailPanel({
  processId,
  open,
  onOpenChange,
}: ProcessDetailPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const process = useMemo(
    () => (processId ? processList.find((p) => p.id === processId) : null),
    [processId],
  );

  const activities = useMemo(
    () => (processId ? activityList.filter((a) => a.processId === processId) : []),
    [processId],
  );

  const kpiLinks = useMemo(
    () => (processId ? processKPIMaps.filter((k) => k.processId === processId) : []),
    [processId],
  );

  const ioInputs = useMemo(
    () => (processId ? processIOMapping.filter((io) => io.toProcess === processId) : []),
    [processId],
  );

  const ioOutputs = useMemo(
    () => (processId ? processIOMapping.filter((io) => io.fromProcess === processId) : []),
    [processId],
  );

  const dependencies = useMemo(
    () => (processId ? processDependencies.filter(
      (d) => d.fromProcess === processId || d.toProcess === processId,
    ) : []),
    [processId],
  );

  const versions = useMemo(
    () => (processId ? processVersions[processId] || [] : []),
    [processId],
  );

  if (!process) return null;

  const ownerEmployee = employees.find((e) => e.id === process.ownerId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {process.code}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${statusBadge(process.status)}`}
                >
                  {process.status}
                </Badge>
                {process.bottleneck && (
                  <Badge variant="outline" className="text-xs bg-chart-5/10 text-chart-5 border-chart-5/30">
                    Bottleneck
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-xl font-semibold leading-tight text-balance">
                {process.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-1">
                {process.dept} • {process.frequency} • {process.version}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => alert(`Edit ${process.code} — inline editing in detail panel`)}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="grid grid-cols-6 mx-6 mt-4 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs py-1.5">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs py-1.5">
              Activities
            </TabsTrigger>
            <TabsTrigger value="kpi" className="text-xs py-1.5">
              KPI
            </TabsTrigger>
            <TabsTrigger value="io" className="text-xs py-1.5">
              I/O
            </TabsTrigger>
            <TabsTrigger value="deps" className="text-xs py-1.5">
              Deps
            </TabsTrigger>
            <TabsTrigger value="versions" className="text-xs py-1.5">
              History
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 — OVERVIEW */}
          <TabsContent value="overview" className="px-6 py-4 space-y-4 mt-0">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {process.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Department" value={process.dept} />
              <Field label="Category" value={process.category} />
              <Field label="Frequency" value={process.frequency} />
              <Field label="Version" value={process.version} />
              <Field label="SLA Target" value={`${process.sla} days`} />
              <Field
                label="Actual Time"
                value={`${process.actualTime} days`}
                tone={process.slaMet ? "success" : "danger"}
              />
              <Field label="Last Updated" value={process.lastUpdated} />
              <Field label="KPI Score" value={`${process.kpiScore}%`} tone={process.kpiScore >= 80 ? "success" : process.kpiScore >= 60 ? "warning" : "danger"} />
            </div>

            <div className="space-y-1 pt-2 border-t">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Process Owner
              </p>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {process.owner
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {process.owner}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {process.ownerPosition} • {ownerEmployee?.dept}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => alert(`Edit ${process.code} — inline editing`)}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit Process
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => alert(`Submitted ${process.code} for approval workflow`)}
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Submit Changes
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => alert(`Duplicate ${process.code} — creates new draft`)}
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                Duplicate
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-chart-5 border-chart-5/30 hover:bg-chart-5/10"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            </div>

            {confirmDelete && (
              <div className="bg-chart-5/10 border border-chart-5/30 rounded-md p-3 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Delete {process.name}?
                </p>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone. All linked activities will be unlinked.
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-chart-5 text-white hover:bg-chart-5/90"
                    onClick={() => {
                      setConfirmDelete(false);
                      onOpenChange(false);
                      alert(`Deleted ${process.code} (demo)`);
                    }}
                  >
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2 — ACTIVITIES */}
          <TabsContent value="activities" className="px-6 py-4 space-y-3 mt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {activities.length} activities • Total{" "}
                {activities.reduce((s, a) => s + a.duration, 0)}h
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(`/workload-activity/activity-directory?processId=${process.id}&action=new`)
                }
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs h-9 w-8">#</TableHead>
                    <TableHead className="text-xs h-9">Activity</TableHead>
                    <TableHead className="text-xs h-9 text-right">Hrs</TableHead>
                    <TableHead className="text-xs h-9 text-center">Util%</TableHead>
                    <TableHead className="text-xs h-9 text-center">Staff</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((act) => (
                    <TableRow
                      key={act.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => router.push(`/workload-activity/activity-directory/${act.id}`)}
                    >
                      <TableCell className="text-xs text-muted-foreground py-2">
                        {act.seq}
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        <p className="font-medium text-foreground truncate">
                          {act.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {act.position}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right font-mono">
                        {act.duration}
                      </TableCell>
                      <TableCell className="text-xs py-2 text-center">
                        <span
                          className={`font-medium ${
                            act.utilization > 90
                              ? "text-chart-5"
                              : act.utilization > 75
                                ? "text-chart-4"
                                : "text-chart-3"
                          }`}
                        >
                          {act.utilization}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs py-2 text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${
                            act.staffingStatus === "Understaffed"
                              ? "text-chart-5 border-chart-5/30"
                              : act.staffingStatus === "Overstaffed"
                                ? "text-chart-4 border-chart-4/30"
                                : "text-chart-3 border-chart-3/30"
                          }`}
                        >
                          {act.staffingStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-muted/50 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Total HC</p>
                <p className="text-base font-semibold text-foreground">
                  {Array.from(
                    new Set(activities.flatMap((a) => a.assignedEmployees)),
                  ).length}
                </p>
              </div>
              <div className="bg-muted/50 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">
                  Workload (h/mo)
                </p>
                <p className="text-base font-semibold text-foreground">
                  {Math.round(activities.reduce((s, a) => s + a.workloadHours, 0))}
                </p>
              </div>
              <div className="bg-muted/50 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase">Avg Util</p>
                <p className="text-base font-semibold text-foreground">
                  {Math.round(
                    activities.reduce((s, a) => s + a.utilization, 0) /
                      Math.max(activities.length, 1),
                  )}
                  %
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => alert("Sent activity workload to Workload module")}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Send to Workload Module
            </Button>
          </TabsContent>

          {/* TAB 3 — KPI */}
          <TabsContent value="kpi" className="px-6 py-4 space-y-3 mt-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {kpiLinks.length} linked KPIs
              </p>
              <Button size="sm" variant="outline" onClick={() => alert("KPI selector opened")}>
                <Link2 className="w-3.5 h-3.5 mr-1" />
                Link KPI
              </Button>
            </div>

            {kpiLinks.length === 0 ? (
              <div className="border border-dashed rounded-md p-6 text-center">
                <p className="text-sm text-muted-foreground">No KPIs linked yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => alert("KPI selector opened")}
                >
                  <Link2 className="w-3.5 h-3.5 mr-1" />
                  Link First KPI
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {kpiLinks.map((k) => (
                  <div
                    key={`${k.processId}-${k.kpiId}`}
                    className="border rounded-md p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {k.kpiName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Weight {k.weightage}% • Impact {k.impact}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          k.actual >= k.target
                            ? "text-chart-3 border-chart-3/30"
                            : "text-chart-5 border-chart-5/30"
                        }`}
                      >
                        {k.actual >= k.target ? "On Target" : "Below"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Target
                        </p>
                        <p className="text-sm font-medium">{k.target}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Actual
                        </p>
                        <p className="text-sm font-medium">{k.actual}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">
                          Trend
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          {trendIcon(k.trend)}
                          {k.trend}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/business-process/process-directory")}
            >
              View Process Directory
            </Button>
          </TabsContent>

          {/* TAB 4 — INPUT/OUTPUT */}
          <TabsContent value="io" className="px-6 py-4 space-y-4 mt-0">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Inputs ({ioInputs.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => alert("Add input dialog")}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Input
                </Button>
              </div>
              {ioInputs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Source: {process.inputSource}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {ioInputs.map((io) => {
                    const fromProc = processList.find((p) => p.id === io.fromProcess);
                    return (
                      <div
                        key={io.id}
                        className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{io.input}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            from {fromProc?.code} • {io.dataType}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Outputs ({ioOutputs.length})
                </h4>
                <Button size="sm" variant="outline" onClick={() => alert("Add output dialog")}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Output
                </Button>
              </div>
              {ioOutputs.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  Deliverable: {process.outputDeliverable}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {ioOutputs.map((io) => {
                    const toProc = processList.find((p) => p.id === io.toProcess);
                    return (
                      <div
                        key={io.id}
                        className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{io.output}</p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            to {toProc?.code} • {io.dataType}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 5 — DEPENDENCIES */}
          <TabsContent value="deps" className="px-6 py-4 space-y-3 mt-0">
            {process.previousProcess && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Previous Process
                </p>
                <ProcessLinkCard processId={process.previousProcess} direction="prev" />
              </div>
            )}
            {process.nextProcess && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Next Process
                </p>
                <ProcessLinkCard processId={process.nextProcess} direction="next" />
              </div>
            )}

            {dependencies.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  All Dependencies
                </p>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs h-8">From</TableHead>
                        <TableHead className="text-xs h-8">To</TableHead>
                        <TableHead className="text-xs h-8">Criticality</TableHead>
                        <TableHead className="text-xs h-8 text-right">Delay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dependencies.map((d, i) => {
                        const from = processList.find((p) => p.id === d.fromProcess);
                        const to = processList.find((p) => p.id === d.toProcess);
                        return (
                          <TableRow key={i}>
                            <TableCell className="text-xs py-2 font-mono">
                              {from?.code}
                            </TableCell>
                            <TableCell className="text-xs py-2 font-mono">
                              {to?.code}
                            </TableCell>
                            <TableCell className="text-xs py-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  d.criticality === "Critical"
                                    ? "text-chart-5 border-chart-5/30"
                                    : d.criticality === "High"
                                      ? "text-chart-4 border-chart-4/30"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {d.criticality}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs py-2 text-right">
                              {d.delay}d
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => alert("Modify dependencies dialog opened")}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Modify Dependencies
            </Button>
          </TabsContent>

          {/* TAB 6 — VERSIONS */}
          <TabsContent value="versions" className="px-6 py-4 space-y-3 mt-0">
            <p className="text-xs text-muted-foreground">
              {versions.length} version{versions.length !== 1 ? "s" : ""} • Current{" "}
              {process.version}
            </p>

            {versions.length === 0 ? (
              <div className="border border-dashed rounded-md p-6 text-center">
                <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No version history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((v, i) => (
                  <div
                    key={v.version}
                    className={`border rounded-md p-3 ${
                      i === 0 ? "border-primary/40 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {v.version}
                          </Badge>
                          {i === 0 && (
                            <Badge className="text-[10px] bg-primary text-primary-foreground">
                              Active
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {v.date}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mb-1">{v.changes}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {v.author}
                        </p>
                      </div>
                      {i !== 0 && (
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => alert(`Restored ${v.version}`)}
                          >
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={() =>
                              alert(`Comparing ${v.version} with current`)
                            }
                          >
                            Compare
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-chart-3"
      : tone === "warning"
        ? "text-chart-4"
        : tone === "danger"
          ? "text-chart-5"
          : "text-foreground";
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-sm font-medium ${toneClass}`}>{value}</p>
    </div>
  );
}

function ProcessLinkCard({
  processId,
  direction,
}: {
  processId: string;
  direction: "prev" | "next";
}) {
  const proc = processList.find((p) => p.id === processId);
  if (!proc) return null;
  return (
    <Link
      href={`/process/directory?id=${proc.id}`}
      className="flex items-center gap-3 p-3 border rounded-md hover:bg-muted/40 transition-colors"
    >
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
          direction === "prev"
            ? "bg-muted text-muted-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        <ArrowRight
          className={`w-4 h-4 ${direction === "prev" ? "rotate-180" : ""}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{proc.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {proc.code} • {proc.dept}
        </p>
      </div>
      <Badge
        variant="outline"
        className={`text-[10px] ${statusBadge(proc.status)}`}
      >
        {proc.status}
      </Badge>
    </Link>
  );
}
