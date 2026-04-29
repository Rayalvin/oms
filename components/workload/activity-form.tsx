"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMPLEXITY_MULTIPLIERS,
  WORKLOAD_CONSTANTS,
  departments,
  employeesAll,
  kpiList,
  processList,
  type ComplexityLevel,
  type WorkloadActivity,
} from "@/lib/oms-data";

const FREQUENCY_TYPES = ["Daily", "Weekly", "Monthly", "Event-based"] as const;
const FREQUENCY_DEFAULT_VALUES: Record<string, number> = {
  Daily: 22,
  Weekly: 4,
  Monthly: 1,
  "Event-based": 4,
};

interface ActivityFormProps {
  initial?: WorkloadActivity;
  editing?: boolean;
  onCancel?: () => void;
}

export function ActivityForm({ initial, editing }: ActivityFormProps) {
  /* Identity */
  const [name, setName] = useState(initial?.name ?? "");
  const [code, setCode] = useState(
    initial?.activityCode ?? `ACT-NEW-${Date.now().toString().slice(-4)}`,
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [processId, setProcessId] = useState(
    initial?.processId ?? processList[0].id,
  );
  const [step, setStep] = useState(initial?.seq ?? 1);
  const [deptId, setDeptId] = useState(initial?.departmentId ?? "D01");
  const [position, setPosition] = useState(
    initial?.responsiblePosition ?? "Operations Analyst",
  );
  const [kpiId, setKpiId] = useState(initial?.linkedKpiId ?? kpiList[0].id);

  /* Workload inputs */
  const [frequencyType, setFrequencyType] = useState<
    (typeof FREQUENCY_TYPES)[number]
  >((initial?.frequencyType as (typeof FREQUENCY_TYPES)[number]) ?? "Monthly");
  const [frequencyValue, setFrequencyValue] = useState<number>(
    initial?.frequencyValue ?? 1,
  );
  const [duration, setDuration] = useState<number>(initial?.duration ?? 4);
  const [complexity, setComplexity] = useState<ComplexityLevel>(
    initial?.complexityLevel ?? "Medium",
  );
  const [reworkRate, setReworkRate] = useState<number>(
    Math.round((initial?.reworkRate ?? 0.08) * 100),
  );
  const [qualityFactor, setQualityFactor] = useState<number>(
    initial?.qualityReviewFactor ?? 1.1,
  );
  const [seasonalFactor, setSeasonalFactor] = useState<number>(
    initial?.seasonalPeakFactor ?? 1.2,
  );
  const [stdCapacity, setStdCapacity] = useState<number>(
    initial?.monthlyCapacity ?? WORKLOAD_CONSTANTS.monthlyHours,
  );
  const [productivity, setProductivity] = useState<number>(
    initial?.productivityFactor ?? WORKLOAD_CONSTANTS.productivityFactor,
  );

  /* Assignment */
  const [assigned, setAssigned] = useState<string[]>(
    initial?.assignedEmployees ?? [],
  );
  const [allocation, setAllocation] = useState<number>(100);

  // ---- Calculations -------------------------------------------------
  const calc = useMemo(() => {
    const baseWorkload = duration * frequencyValue;
    const adjustedWorkload =
      baseWorkload *
      COMPLEXITY_MULTIPLIERS[complexity] *
      qualityFactor *
      seasonalFactor *
      (1 + reworkRate / 100);
    const effCap = stdCapacity * productivity;
    const requiredHc = effCap > 0 ? adjustedWorkload / effCap : 0;
    const assignedHc = assigned.length * (allocation / 100);
    const totalAssignedCap = assigned.length * effCap * (allocation / 100);
    const utilization =
      totalAssignedCap > 0
        ? Math.round((adjustedWorkload / totalAssignedCap) * 100)
        : 0;
    const status =
      requiredHc > assignedHc + 0.05 && utilization > 100
        ? "Understaffed"
        : utilization > 110
          ? "Overloaded"
          : utilization >= 90
            ? "Balanced"
            : utilization >= 70
              ? "Underutilized"
              : "Significantly Underutilized";
    return {
      baseWorkload,
      adjustedWorkload,
      effCap,
      requiredHc,
      assignedHc,
      utilization,
      status,
    };
  }, [
    duration,
    frequencyValue,
    complexity,
    qualityFactor,
    seasonalFactor,
    reworkRate,
    stdCapacity,
    productivity,
    assigned,
    allocation,
  ]);

  // ---- Before / After (only for edit) -------------------------------
  const before = initial
    ? {
        adjustedWorkload: initial.adjustedWorkload,
        requiredHc: initial.requiredHc,
        utilization: initial.utilization,
        status: initial.staffingStatus,
      }
    : null;

  const candidates = useMemo(() => {
    return employeesAll
      .filter((e) => e.status === "Active")
      .filter(
        (e) =>
          deptId === "D00" ||
          e.deptId === deptId ||
          e.dept === departments.find((d) => d.id === deptId)?.name,
      )
      .slice(0, 30);
  }, [deptId]);

  function toggleAssignee(id: string) {
    setAssigned((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  function applyFrequencyDefault(t: (typeof FREQUENCY_TYPES)[number]) {
    setFrequencyType(t);
    setFrequencyValue(FREQUENCY_DEFAULT_VALUES[t] ?? 1);
  }

  return (
    <div className="grid gap-4">
      {/* SECTION 1 — IDENTITY */}
      <SectionTitle index={1} title="Activity Identity" />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2">
          <FormRow label="Activity name" full>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Validate Purchase Request"
            />
          </FormRow>
          <FormRow label="Activity code">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono"
            />
          </FormRow>
          <FormRow label="Process step #">
            <Input
              type="number"
              min={1}
              max={99}
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
            />
          </FormRow>
          <FormRow label="Description" full>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this activity involve?"
              rows={2}
            />
          </FormRow>
          <FormRow label="Linked business process">
            <Select value={processId} onValueChange={setProcessId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {processList.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Owning department">
            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Responsible position">
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </FormRow>
          <FormRow label="Linked KPI">
            <Select value={kpiId} onValueChange={setKpiId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kpiList.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </CardContent>
      </Card>

      {/* SECTION 2 — WORKLOAD INPUTS */}
      <SectionTitle index={2} title="Workload Calculation Inputs" />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          <FormRow label="Frequency type">
            <Select
              value={frequencyType}
              onValueChange={(v) =>
                applyFrequencyDefault(v as (typeof FREQUENCY_TYPES)[number])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_TYPES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Frequency value (per month)">
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={frequencyValue}
              onChange={(e) => setFrequencyValue(Number(e.target.value))}
            />
          </FormRow>
          <FormRow label="Duration / execution (h)">
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </FormRow>
          <FormRow label="Complexity level">
            <Select
              value={complexity}
              onValueChange={(v) => setComplexity(v as ComplexityLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(COMPLEXITY_MULTIPLIERS) as ComplexityLevel[]).map(
                  (c) => (
                    <SelectItem key={c} value={c}>
                      {c} (×{COMPLEXITY_MULTIPLIERS[c]})
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Rework rate (%)">
            <Input
              type="number"
              min={0}
              max={50}
              step={1}
              value={reworkRate}
              onChange={(e) => setReworkRate(Number(e.target.value))}
            />
          </FormRow>
          <FormRow label="Quality review factor (×)">
            <Input
              type="number"
              min={1}
              max={2}
              step={0.05}
              value={qualityFactor}
              onChange={(e) => setQualityFactor(Number(e.target.value))}
            />
          </FormRow>
          <FormRow label="Seasonal peak factor (×)">
            <Input
              type="number"
              min={1}
              max={2}
              step={0.05}
              value={seasonalFactor}
              onChange={(e) => setSeasonalFactor(Number(e.target.value))}
            />
          </FormRow>
          <FormRow label="Standard capacity (h)">
            <Input
              type="number"
              min={80}
              max={200}
              value={stdCapacity}
              onChange={(e) => setStdCapacity(Number(e.target.value))}
            />
          </FormRow>
          <FormRow label="Productivity factor (×)">
            <Input
              type="number"
              min={0.5}
              max={1}
              step={0.05}
              value={productivity}
              onChange={(e) => setProductivity(Number(e.target.value))}
            />
          </FormRow>
        </CardContent>
      </Card>

      {/* SECTION 3 — ASSIGNMENT */}
      <SectionTitle index={3} title="Assignment" />
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <FormRow label="Assigned position">
              <Input value={position} disabled />
            </FormRow>
            <FormRow label="Allocation per assignee (%)">
              <Input
                type="number"
                min={10}
                max={100}
                value={allocation}
                onChange={(e) => setAllocation(Number(e.target.value))}
              />
            </FormRow>
            <FormRow label="Currently assigned">
              <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                {assigned.length} {assigned.length === 1 ? "person" : "people"}
              </p>
            </FormRow>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-md border">
            {candidates.length === 0 && (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                No active employees in this department.
              </p>
            )}
            {candidates.map((c) => {
              const isOn = assigned.includes(c.id);
              return (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center justify-between gap-3 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggleAssignee(c.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.position} · {c.dept}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {c.utilization}% util
                  </span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4 — PREVIEW */}
      <SectionTitle index={4} title="Calculation Preview" icon={<Calculator className="h-4 w-4" />} />
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <PreviewTile
            label="Base workload"
            value={`${calc.baseWorkload.toFixed(1)} h`}
          />
          <PreviewTile
            label="Adjusted workload"
            value={`${calc.adjustedWorkload.toFixed(1)} h`}
            primary
          />
          <PreviewTile
            label="Required HC"
            value={`${calc.requiredHc.toFixed(2)} FTE`}
          />
          <PreviewTile
            label="Assigned HC"
            value={`${calc.assignedHc.toFixed(2)} FTE`}
          />
          <PreviewTile
            label="HC Gap"
            value={
              calc.requiredHc - calc.assignedHc > 0
                ? `+${(calc.requiredHc - calc.assignedHc).toFixed(2)}`
                : (calc.requiredHc - calc.assignedHc).toFixed(2)
            }
            tone={calc.requiredHc - calc.assignedHc > 0 ? "danger" : "success"}
          />
          <PreviewTile
            label="Utilization"
            value={`${calc.utilization}%`}
            tone={
              calc.utilization > 110
                ? "danger"
                : calc.utilization >= 90
                  ? "success"
                  : "warning"
            }
          />
          <PreviewTile
            label="Effective cap"
            value={`${Math.round(calc.effCap)} h`}
          />
          <PreviewTile
            label="Staffing status"
            value={calc.status}
            tone={
              calc.status === "Balanced"
                ? "success"
                : calc.status === "Overloaded" || calc.status === "Understaffed"
                  ? "danger"
                  : "warning"
            }
            small
          />
        </CardContent>
      </Card>

      {/* BEFORE / AFTER for editing */}
      {editing && before && (
        <>
          <SectionTitle
            index={5}
            title="Change Impact"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-4">
              <DiffTile
                label="Adjusted workload"
                before={`${before.adjustedWorkload.toFixed(1)} h`}
                after={`${calc.adjustedWorkload.toFixed(1)} h`}
              />
              <DiffTile
                label="Required HC"
                before={before.requiredHc.toFixed(2)}
                after={calc.requiredHc.toFixed(2)}
              />
              <DiffTile
                label="Utilization"
                before={`${before.utilization}%`}
                after={`${calc.utilization}%`}
              />
              <DiffTile
                label="Status"
                before={before.status}
                after={calc.status}
              />
            </CardContent>
          </Card>
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex items-center gap-3 p-3">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <p className="text-xs">
                Approval is required because this change updates Required HC by{" "}
                <strong>
                  {(calc.requiredHc - before.requiredHc).toFixed(2)} FTE
                </strong>
                . Workforce Planning will be notified upon approval.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        <ChevronRight className="inline h-3 w-3" /> All calculations follow the
        Spec formula: Adjusted = Base × Complexity × Quality × Seasonal × (1 +
        Rework). Effective Capacity = Standard × Productivity. Required HC =
        Adjusted ÷ Effective Capacity.
      </p>
    </div>
  );
}

/* helpers */

function SectionTitle({
  index,
  title,
  icon,
}: {
  index: number;
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
        {index}
      </span>
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
    </div>
  );
}

function FormRow({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`grid gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function PreviewTile({
  label,
  value,
  primary = false,
  tone = "neutral",
  small = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
  tone?: "neutral" | "success" | "warning" | "danger";
  small?: boolean;
}) {
  const toneClass = {
    neutral: "text-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-destructive",
  }[tone];
  return (
    <div
      className={`rounded-lg border p-3 ${primary ? "border-primary bg-primary/10" : "bg-background"}`}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`${small ? "text-base" : "text-lg"} font-bold tabular-nums ${toneClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function DiffTile({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) {
  const changed = before !== after;
  return (
    <div className="rounded-lg border p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground line-through">{before}</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span
          className={`font-semibold ${changed ? "text-primary" : "text-foreground"}`}
        >
          {after}
        </span>
      </div>
    </div>
  );
}
