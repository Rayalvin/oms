"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  Activity as ActivityIcon,
  Users,
  Clock,
  Building2,
  GitBranch,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TopBar } from "@/components/oms/topbar";
import { AiAssistant } from "@/components/oms/ai-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  workloadActivities,
  employeesAll,
  processList,
  WORKLOAD_CONSTANTS,
  _freqPerMonth,
} from "@/lib/oms-data";

const FREQUENCY_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Semi-Annual",
  "Annual",
  "Continuous",
];

function statusColor(util: number) {
  if (util > 100) return "text-destructive";
  if (util >= 70) return "text-emerald-600 dark:text-emerald-400";
  return "text-amber-600 dark:text-amber-400";
}

function statusLabel(util: number) {
  if (util > 100) return "Overloaded";
  if (util >= 70) return "Balanced";
  return "Underutilized";
}

function statusBg(util: number) {
  if (util > 100) return "bg-destructive";
  if (util >= 70) return "bg-emerald-500";
  return "bg-amber-500";
}

export default function ActivityDetailPage({
  params,
}: {
  params: Promise<{ activityId: string }>;
}) {
  const { activityId } = use(params);
  const router = useRouter();
  const baseActivity = workloadActivities.find((a) => a.id === activityId);

  // editable state — initialised from the source-of-truth activity.
  const [name, setName] = useState(baseActivity?.name ?? "");
  const [description, setDescription] = useState(
    baseActivity ? `${baseActivity.processName} — sequence ${baseActivity.seq}` : "",
  );
  const [processId, setProcessId] = useState(baseActivity?.processId ?? "");
  const [frequency, setFrequency] = useState(baseActivity?.frequency ?? "Monthly");
  const [duration, setDuration] = useState<number>(baseActivity?.duration ?? 1);
  const [position, setPosition] = useState(baseActivity?.role ?? "");
  const [assigned, setAssigned] = useState<string[]>(
    baseActivity?.assignedEmployees ?? [],
  );

  const [savedDialog, setSavedDialog] = useState(false);
  const [planningDialog, setPlanningDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [recalcDialog, setRecalcDialog] = useState(false);

  // recalc on every render — pure functions of state.
  const calc = useMemo(() => {
    const execPerMonth = _freqPerMonth[frequency] ?? 1;
    const demand = Math.round(duration * execPerMonth * 100) / 100;
    const requiredHc = Math.max(
      1,
      Math.round((demand / WORKLOAD_CONSTANTS.monthlyHours) * 10) / 10,
    );
    const assignedHc = assigned.length;
    const utilization =
      assignedHc > 0
        ? Math.round((demand / (assignedHc * WORKLOAD_CONSTANTS.monthlyHours)) * 100)
        : 0;
    const gap = Math.round((requiredHc - assignedHc) * 10) / 10;
    return { demand, requiredHc, assignedHc, utilization, gap };
  }, [frequency, duration, assigned]);

  if (!baseActivity) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <TopBar
          title="Activity not found"
          breadcrumb={["Workload & Activities", "Activity Directory", "Detail"]}
        />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <p className="text-sm font-medium">No activity matches that ID.</p>
              <Button asChild>
                <Link href="/workload-activity/activity-directory">Back to directory</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const candidatePool = employeesAll
    .filter((e) => e.status === "Active")
    .slice(0, 30);

  const employeeRows = assigned.map((eid) => {
    const e = employeesAll.find((x) => x.id === eid);
    if (!e) return null;
    const perPersonLoad =
      assigned.length > 0 ? calc.demand / assigned.length : 0;
    const cap =
      WORKLOAD_CONSTANTS.monthlyHours * WORKLOAD_CONSTANTS.productivityFactor;
    const util = Math.round((perPersonLoad / cap) * 100);
    return { ...e, currentLoad: Math.round(perPersonLoad), capacity: Math.round(cap), utilization: util };
  }).filter(Boolean) as Array<
    (typeof employeesAll)[number] & {
      currentLoad: number;
      capacity: number;
      utilization: number;
    }
  >;

  const chartData = [
    { name: "Demand", value: Math.round(calc.demand), fill: "hsl(var(--chart-1))" },
    {
      name: "Capacity",
      value:
        Math.round(
          calc.assignedHc * WORKLOAD_CONSTANTS.monthlyHours,
        ) || 0,
      fill: "hsl(var(--chart-2))",
    },
  ];

  function toggleAssign(eid: string) {
    setAssigned((prev) =>
      prev.includes(eid) ? prev.filter((x) => x !== eid) : [...prev, eid],
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        title={name || "Activity Detail"}
        breadcrumb={["Workload & Activities", "Activity Directory", baseActivity.processCode]}
      />

      <main className="flex-1 overflow-auto p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to directory
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setRecalcDialog(true)}>
              <Calculator className="mr-2 h-4 w-4" />
              Recalculate
            </Button>
            <Button variant="outline" onClick={() => setPlanningDialog(true)}>
              <Send className="mr-2 h-4 w-4" />
              Send to Workforce Planning
            </Button>
            <Button variant="outline" onClick={() => setApprovalDialog(true)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
            <Button onClick={() => setSavedDialog(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* INPUT SECTION (left) */}
          <Card className="xl:col-span-4">
            <CardHeader>
              <CardTitle className="text-sm">Activity definition</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Activity name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Process (BPM)</label>
                <Select value={processId} onValueChange={setProcessId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {processList.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium">Frequency</label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium">Duration (hrs)</label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Responsible position</label>
                <Input
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Assigned employees</label>
                <div className="max-h-56 overflow-y-auto rounded-lg border">
                  {candidatePool.map((e) => (
                    <label
                      key={e.id}
                      className="flex cursor-pointer items-center gap-2 border-b px-3 py-2 last:border-b-0 hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={assigned.includes(e.id)}
                        onCheckedChange={() => toggleAssign(e.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{e.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {e.position} · {e.dept}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{e.id}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {assigned.length} selected · capacity{" "}
                  {Math.round(assigned.length * WORKLOAD_CONSTANTS.monthlyHours)}{" "}
                  hrs/month
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PROCESSING + OUTPUT (center) */}
          <div className="space-y-4 xl:col-span-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  Calculation engine
                  <Badge variant="outline" className="font-normal">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Output
                    icon={<Clock className="h-4 w-4" />}
                    label="Workload"
                    value={`${Math.round(calc.demand)} h`}
                    sub="hrs/month"
                  />
                  <Output
                    icon={<Users className="h-4 w-4" />}
                    label="Required HC"
                    value={`${calc.requiredHc}`}
                    sub="FTE"
                  />
                  <Output
                    icon={<Users className="h-4 w-4" />}
                    label="Assigned HC"
                    value={`${calc.assignedHc}`}
                    sub="people"
                  />
                  <Output
                    icon={<AlertTriangle className="h-4 w-4" />}
                    label="HC gap"
                    value={`${calc.gap > 0 ? "+" : ""}${calc.gap}`}
                    sub={calc.gap > 0 ? "shortage" : calc.gap < 0 ? "surplus" : "balanced"}
                    valueClass={
                      calc.gap > 0
                        ? "text-destructive"
                        : calc.gap < 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    }
                  />
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Utilization
                    </p>
                    <span className={`text-2xl font-bold ${statusColor(calc.utilization)}`}>
                      {calc.utilization}%
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all ${statusBg(calc.utilization)}`}
                      style={{ width: `${Math.min(calc.utilization, 150)}%` }}
                    />
                    <div
                      className="absolute inset-y-0 w-px bg-foreground/40"
                      style={{ left: "70%" }}
                      aria-hidden
                    />
                    <div
                      className="absolute inset-y-0 w-px bg-foreground/40"
                      style={{ left: "100%" }}
                      aria-hidden
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                    <span>0%</span>
                    <span>70% · balanced</span>
                    <span>100% · capacity</span>
                    <span>150%</span>
                  </div>
                  <Badge className={`mt-3 ${statusColor(calc.utilization)} bg-transparent border`}>
                    {statusLabel(calc.utilization)}
                  </Badge>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Demand vs capacity
                  </p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 6,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((d, i) => (
                          <Cell key={i} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Formula breakdown</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <FormulaRow
                  label="workload_demand"
                  formula={`${duration} h × ${(_freqPerMonth[frequency] ?? 1).toFixed(2)} exec/month`}
                  result={`${Math.round(calc.demand)} h`}
                />
                <FormulaRow
                  label="required_HC"
                  formula={`${Math.round(calc.demand)} h ÷ ${WORKLOAD_CONSTANTS.monthlyHours} h`}
                  result={`${calc.requiredHc} FTE`}
                />
                <FormulaRow
                  label="utilization"
                  formula={`${Math.round(calc.demand)} h ÷ (${calc.assignedHc} × ${WORKLOAD_CONSTANTS.monthlyHours} h)`}
                  result={`${calc.utilization}%`}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL — EMPLOYEE DETAILS */}
          <Card className="xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-sm">Assigned employees</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {employeeRows.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-6 text-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No employees assigned yet.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {employeeRows.map((e) => (
                    <div key={e.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{e.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {e.position}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-semibold tabular-nums ${statusColor(e.utilization)}`}
                        >
                          {e.utilization}%
                        </span>
                      </div>
                      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>{e.currentLoad} h load</span>
                        <span>{e.capacity} h cap</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${statusBg(e.utilization)}`}
                          style={{ width: `${Math.min(e.utilization, 150)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Linked context */}
        <Card className="mt-4">
          <CardContent className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
            <Linked
              icon={<GitBranch className="h-4 w-4" />}
              label="Process"
              value={`${baseActivity.processCode} — ${baseActivity.processName}`}
            />
            <Linked
              icon={<Building2 className="h-4 w-4" />}
              label="Department"
              value={baseActivity.department}
            />
            <Linked
              icon={<ActivityIcon className="h-4 w-4" />}
              label="Sequence"
              value={`Step ${baseActivity.seq}`}
            />
            <Linked
              icon={<Clock className="h-4 w-4" />}
              label="Original frequency"
              value={baseActivity.frequency}
            />
          </CardContent>
        </Card>
      </main>

      <Dialog open={savedDialog} onOpenChange={setSavedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changes saved</DialogTitle>
            <DialogDescription>
              Workload demand and required HC have been updated. Downstream
              modules (Workforce Planning, Dashboard) will reflect these values
              on next refresh.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSavedDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={recalcDialog} onOpenChange={setRecalcDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recalculation complete</DialogTitle>
            <DialogDescription>
              Live engine results: <span className="font-medium">{Math.round(calc.demand)} h/month</span>{" "}
              demand · {calc.requiredHc} required HC · {calc.utilization}% utilization.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setRecalcDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={planningDialog} onOpenChange={setPlanningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sent to Workforce Planning</DialogTitle>
            <DialogDescription>
              Required HC of <span className="font-medium">{calc.requiredHc} FTE</span>{" "}
              has been added to the workforce planning queue for{" "}
              {baseActivity.department}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild variant="outline">
              <Link href="/scenario/builder">Open Scenario Builder</Link>
            </Button>
            <Button onClick={() => setPlanningDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submitted for approval</DialogTitle>
            <DialogDescription>
              Your activity changes are pending approval from the process owner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild variant="outline">
              <Link href="/scenario/directory">View scenarios</Link>
            </Button>
            <Button onClick={() => setApprovalDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AiAssistant />
    </div>
  );
}

function Output({
  icon,
  label,
  value,
  sub,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-xl font-bold tabular-nums ${valueClass ?? ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function FormulaRow({
  label,
  formula,
  result,
}: {
  label: string;
  formula: string;
  result: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex-1 text-center">{formula}</span>
      <span className="font-semibold text-foreground">= {result}</span>
    </div>
  );
}

function Linked({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
