// ---------------------------------------------------------------------
// ACTIVITY CATALOG + WORKLOAD/UTILIZATION/KPI LINKAGE DERIVATION
// Source-of-truth bridge between Org (positions/employees), Business
// Processes, Workload, and KPIs. All numbers are deterministic from the
// position/employee id so re-renders are stable.
// ---------------------------------------------------------------------

import { positions, employees, processes, kpiList } from "@/lib/oms-data";

// ---------------------------------------------------------------------
// CATALOG — 25 activity templates with full process + KPI linkage.
// ---------------------------------------------------------------------
export type ActivityTemplate = {
  id: string;
  name: string;
  processId: string;
  processName: string;
  kpiId: string;
  kpiName: string;
  freq: number;        // occurrences / month
  duration: number;    // hours / occurrence
  depts: string[] | "all";
  minLevelRank: number; // 1 = junior+, 5 = vp+
};

const LEVEL_RANK: Record<string, number> = {
  "Junior Staff": 1, Junior: 1, "Coordinator": 1,
  "Specialist": 2, "Analyst": 2, "Staff": 2, Mid: 2,
  "Senior Staff": 3, "Senior": 3, "Lead": 3, "Consultant": 3, "Supervisor": 3,
  "Manager": 4,
  "Director": 5, "VP": 5, "Executive": 6, "C-Suite": 7, "C-Level": 7,
};

export const ACTIVITY_CATALOG: ActivityTemplate[] = [
  // Talent
  { id: "A01", name: "Resume Screening",            processId: "P001", processName: "Hiring",             kpiId: "K003", kpiName: "Avg Time to Hire",  freq: 20, duration: 0.5, depts: ["Human Resources","Human Capital"], minLevelRank: 2 },
  { id: "A02", name: "Interview Coordination",      processId: "P001", processName: "Hiring",             kpiId: "K003", kpiName: "Avg Time to Hire",  freq: 10, duration: 1.5, depts: ["Human Resources","Human Capital"], minLevelRank: 2 },
  { id: "A03", name: "Offer Negotiation",           processId: "P001", processName: "Hiring",             kpiId: "K007", kpiName: "Cost per Hire",     freq: 4,  duration: 2.0, depts: ["Human Resources","Human Capital"], minLevelRank: 3 },
  { id: "A04", name: "New Hire Setup",              processId: "P002", processName: "Onboarding",         kpiId: "K006", kpiName: "Employee Satisfaction", freq: 4, duration: 3.0, depts: ["Human Resources","Human Capital"], minLevelRank: 1 },
  { id: "A05", name: "Welcome Session Delivery",    processId: "P002", processName: "Onboarding",         kpiId: "K006", kpiName: "Employee Satisfaction", freq: 2, duration: 4.0, depts: ["Human Resources","Human Capital"], minLevelRank: 2 },
  // Performance / Culture (cross-cutting)
  { id: "A06", name: "Goal Setting Review",         processId: "P003", processName: "Performance Review", kpiId: "K008", kpiName: "Retention Rate",    freq: 1,  duration: 4.0, depts: "all", minLevelRank: 4 },
  { id: "A07", name: "Performance Calibration",     processId: "P003", processName: "Performance Review", kpiId: "K008", kpiName: "Retention Rate",    freq: 1,  duration: 8.0, depts: "all", minLevelRank: 4 },
  { id: "A24", name: "Stakeholder Update Meeting",  processId: "P003", processName: "Performance Review", kpiId: "K008", kpiName: "Retention Rate",    freq: 4,  duration: 1.0, depts: "all", minLevelRank: 3 },
  { id: "A25", name: "Team 1:1 Coaching",           processId: "P003", processName: "Performance Review", kpiId: "K006", kpiName: "Employee Satisfaction", freq: 8, duration: 1.0, depts: "all", minLevelRank: 4 },
  // Procurement / Operations / Tech
  { id: "A08", name: "Vendor Evaluation",           processId: "P004", processName: "Procurement",        kpiId: "K004", kpiName: "Process Efficiency", freq: 4,  duration: 2.0, depts: ["Procurement","Operations","Supply Chain"], minLevelRank: 2 },
  { id: "A09", name: "PO Processing",               processId: "P004", processName: "Procurement",        kpiId: "K004", kpiName: "Process Efficiency", freq: 12, duration: 0.5, depts: ["Procurement","Operations","Supply Chain","Finance"], minLevelRank: 1 },
  { id: "A10", name: "Sprint Planning",             processId: "P004", processName: "Procurement",        kpiId: "K004", kpiName: "Process Efficiency", freq: 2,  duration: 4.0, depts: ["Technology","Engineering","IT & Digital"], minLevelRank: 2 },
  { id: "A11", name: "Code Review",                 processId: "P004", processName: "Procurement",        kpiId: "K004", kpiName: "Process Efficiency", freq: 16, duration: 1.0, depts: ["Technology","Engineering","IT & Digital"], minLevelRank: 2 },
  { id: "A12", name: "Customer Issue Resolution",   processId: "P004", processName: "Procurement",        kpiId: "K004", kpiName: "Process Efficiency", freq: 12, duration: 1.5, depts: ["Customer Service","Operations","IT & Digital"], minLevelRank: 1 },
  { id: "A13", name: "Production Monitoring",       processId: "P004", processName: "Procurement",        kpiId: "K004", kpiName: "Process Efficiency", freq: 20, duration: 0.5, depts: ["Technology","Engineering","IT & Digital","Operations"], minLevelRank: 2 },
  { id: "A21", name: "Campaign Performance Review", processId: "P004", processName: "Procurement",        kpiId: "K004", kpiName: "Process Efficiency", freq: 4,  duration: 2.0, depts: ["Marketing","Sales & Marketing"], minLevelRank: 3 },
  // Governance / Approval / Compliance
  { id: "A14", name: "Contract Approval",           processId: "P005", processName: "Approval Workflow",  kpiId: "K005", kpiName: "Audit Compliance",  freq: 8,  duration: 1.0, depts: ["Legal","Legal & Compliance","Procurement","Finance"], minLevelRank: 4 },
  { id: "A15", name: "Document Review",             processId: "P005", processName: "Approval Workflow",  kpiId: "K005", kpiName: "Audit Compliance",  freq: 12, duration: 0.5, depts: ["Legal","Legal & Compliance"], minLevelRank: 2 },
  { id: "A16", name: "Quality Audit",               processId: "P005", processName: "Approval Workflow",  kpiId: "K005", kpiName: "Audit Compliance",  freq: 2,  duration: 6.0, depts: ["Operations","Legal & Compliance","Finance"], minLevelRank: 3 },
  { id: "A17", name: "Compliance Reporting",        processId: "P005", processName: "Approval Workflow",  kpiId: "K005", kpiName: "Audit Compliance",  freq: 1,  duration: 8.0, depts: ["Legal & Compliance","Finance","Legal"], minLevelRank: 3 },
  { id: "A22", name: "Content Approval",            processId: "P005", processName: "Approval Workflow",  kpiId: "K005", kpiName: "Audit Compliance",  freq: 8,  duration: 0.5, depts: ["Marketing","Sales & Marketing","Legal"], minLevelRank: 3 },
  // Financial
  { id: "A18", name: "Budget Review",               processId: "P005", processName: "Approval Workflow",  kpiId: "K002", kpiName: "Budget Utilization", freq: 4,  duration: 2.0, depts: ["Finance","Strategy","Strategy & Transformation","Executive Office"], minLevelRank: 4 },
  { id: "A19", name: "Financial Reporting",         processId: "P005", processName: "Approval Workflow",  kpiId: "K002", kpiName: "Budget Utilization", freq: 1,  duration: 16.0, depts: ["Finance"], minLevelRank: 3 },
  { id: "A20", name: "Forecast Update",             processId: "P005", processName: "Approval Workflow",  kpiId: "K002", kpiName: "Budget Utilization", freq: 2,  duration: 8.0, depts: ["Finance","Strategy","Strategy & Transformation"], minLevelRank: 3 },
  // Strategic
  { id: "A23", name: "Strategic Planning",          processId: "P003", processName: "Performance Review", kpiId: "K001", kpiName: "Workforce Coverage", freq: 1,  duration: 6.0, depts: "all", minLevelRank: 5 },
];

// ---------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------
const STANDARD_HOURS = 160; // monthly capacity per FTE

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function levelRank(level?: string): number {
  if (!level) return 2;
  return LEVEL_RANK[level] ?? 2;
}

// Stable per-(positionId, templateId) jitter ±25 % so each row looks unique.
function jitter(seed: number, base: number, pct = 0.25): number {
  const v = ((seed % 1000) / 1000) * 2 - 1; // -1..1
  return Math.max(0.25, base * (1 + v * pct));
}

// ---------------------------------------------------------------------
// PUBLIC SHAPES
// ---------------------------------------------------------------------
export type PositionActivity = {
  id: string;
  name: string;
  processId: string;
  processName: string;
  kpiId: string;
  kpiName: string;
  frequency: number;       // per month (rounded to 1 decimal where needed)
  duration: number;        // hours per occurrence
  workloadHours: number;   // freq * duration  (TOTAL across the team)
  assignedEmployees: number;
  perEmployeeHours: number;
  utilization: number;     // % using STANDARD_HOURS * employees
  status: "Overloaded" | "Balanced" | "Underutilized";
};

export type EmployeeActivity = Omit<PositionActivity, "assignedEmployees" | "perEmployeeHours" | "utilization" | "status"> & {
  allocationPct: number;   // % of this employee's time
  perEmployeeHours: number;
  utilization: number;     // % of THIS employee's 160 hrs (= allocation)
  status: "Overloaded" | "Balanced" | "Underutilized";
};

export type KpiContribution = {
  kpiId: string;
  kpiName: string;
  target: number;
  actual: number;
  unit: string;
  contributionPct: number; // share of workload tied to this KPI
  status: string;
};

// ---------------------------------------------------------------------
// CORE DERIVATIONS
// ---------------------------------------------------------------------
export function statusFromUtil(util: number): "Overloaded" | "Balanced" | "Underutilized" {
  if (util > 110) return "Overloaded";
  if (util >= 90) return "Balanced";
  return "Underutilized";
}

export function getActivitiesForPosition(positionId: string): PositionActivity[] {
  const pos = positions.find((p) => p.id === positionId);
  if (!pos) return [];
  const seed = hash(positionId);
  const rank = levelRank((pos as { level?: string }).level);
  // pool of catalog rows that match dept and minimum level
  const pool = ACTIVITY_CATALOG.filter((t) =>
    (t.depts === "all" || t.depts.includes(pos.dept)) && rank >= t.minLevelRank
  );
  // pick 5–7 (deterministic) — fall back to first N if pool is small
  const count = Math.min(pool.length, 5 + (seed % 3));
  const picked = pool
    .map((t, i) => ({ t, key: hash(`${positionId}-${t.id}-${i}`) }))
    .sort((a, b) => a.key - b.key)
    .slice(0, count)
    .map(({ t }) => t);

  const filled = Math.max(1, pos.filled || 1);

  return picked.map((t) => {
    const tSeed = hash(`${positionId}-${t.id}`);
    const frequency = Math.round(jitter(tSeed, t.freq, 0.20) * 10) / 10;
    const duration  = Math.round(jitter(tSeed >> 1, t.duration, 0.20) * 10) / 10;
    const workloadHours = Math.round(frequency * duration * 10) / 10;
    const perEmployeeHours = Math.round((workloadHours / filled) * 10) / 10;
    const util = Math.round((workloadHours / (filled * STANDARD_HOURS)) * 1000) / 10;
    return {
      id: t.id,
      name: t.name,
      processId: t.processId,
      processName: t.processName,
      kpiId: t.kpiId,
      kpiName: t.kpiName,
      frequency,
      duration,
      workloadHours,
      assignedEmployees: filled,
      perEmployeeHours,
      utilization: util,
      status: statusFromUtil(util),
    };
  });
}

export function getActivitiesForEmployee(employeeId: string): EmployeeActivity[] {
  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) return [];
  // find the matching position (by title)
  const pos = positions.find((p) => p.title === emp.position);
  // base catalog: derive from the position when found, else from a generic dept-level fit
  const base: PositionActivity[] = pos
    ? getActivitiesForPosition(pos.id)
    : (() => {
        const rank = levelRank(emp.level);
        const pool = ACTIVITY_CATALOG.filter((t) =>
          (t.depts === "all" || t.depts.includes(emp.dept)) && rank >= t.minLevelRank
        );
        const seed = hash(employeeId);
        const count = Math.min(pool.length, 5 + (seed % 3));
        return pool
          .map((t, i) => ({ t, key: hash(`${employeeId}-${t.id}-${i}`) }))
          .sort((a, b) => a.key - b.key)
          .slice(0, count)
          .map((x) => {
            const tSeed = hash(`${employeeId}-${x.t.id}`);
            const frequency = Math.round(jitter(tSeed, x.t.freq, 0.20) * 10) / 10;
            const duration  = Math.round(jitter(tSeed >> 1, x.t.duration, 0.20) * 10) / 10;
            const workloadHours = Math.round(frequency * duration * 10) / 10;
            return {
              id: x.t.id, name: x.t.name,
              processId: x.t.processId, processName: x.t.processName,
              kpiId: x.t.kpiId, kpiName: x.t.kpiName,
              frequency, duration, workloadHours,
              assignedEmployees: 1, perEmployeeHours: workloadHours,
              utilization: Math.round((workloadHours / STANDARD_HOURS) * 1000) / 10,
              status: statusFromUtil((workloadHours / STANDARD_HOURS) * 100),
            };
          });
      })();

  // share each activity per-employee with deterministic ±15 % spread
  return base.map((a) => {
    const eSeed = hash(`${employeeId}-${a.id}`);
    const share = jitter(eSeed, 1, 0.15); // 0.85..1.15 of equal share
    const myHours = Math.round(((a.workloadHours / Math.max(1, a.assignedEmployees)) * share) * 10) / 10;
    const allocationPct = Math.round((myHours / STANDARD_HOURS) * 1000) / 10;
    return {
      id: a.id, name: a.name,
      processId: a.processId, processName: a.processName,
      kpiId: a.kpiId, kpiName: a.kpiName,
      frequency: a.frequency, duration: a.duration, workloadHours: a.workloadHours,
      perEmployeeHours: myHours,
      allocationPct,
      utilization: allocationPct,
      status: statusFromUtil(allocationPct),
    };
  });
}

// ---------------------------------------------------------------------
// AGGREGATE METRICS
// ---------------------------------------------------------------------
export function aggregatePositionUtilization(activities: PositionActivity[], filled: number): number {
  const total = activities.reduce((s, a) => s + a.workloadHours, 0);
  if (filled <= 0) return 0;
  return Math.round((total / (filled * STANDARD_HOURS)) * 1000) / 10;
}

export function aggregateEmployeeUtilization(activities: EmployeeActivity[]): number {
  const total = activities.reduce((s, a) => s + a.perEmployeeHours, 0);
  return Math.round((total / STANDARD_HOURS) * 1000) / 10;
}

export function getKpiContributions(
  activities: { kpiId: string; kpiName: string; workloadHours?: number; perEmployeeHours?: number }[],
  basis: "team" | "self"
): KpiContribution[] {
  const totals = new Map<string, { name: string; hours: number }>();
  for (const a of activities) {
    const h = basis === "team" ? (a.workloadHours ?? 0) : (a.perEmployeeHours ?? 0);
    const cur = totals.get(a.kpiId) ?? { name: a.kpiName, hours: 0 };
    cur.hours += h;
    totals.set(a.kpiId, cur);
  }
  const grand = Array.from(totals.values()).reduce((s, v) => s + v.hours, 0) || 1;
  return Array.from(totals.entries())
    .map(([kpiId, v]) => {
      const ref = kpiList.find((k) => k.id === kpiId);
      return {
        kpiId,
        kpiName: v.name,
        target: ref?.target ?? 0,
        actual: ref?.actual ?? 0,
        unit: ref?.unit ?? "",
        contributionPct: Math.round((v.hours / grand) * 1000) / 10,
        status: ref?.status ?? "—",
      };
    })
    .sort((a, b) => b.contributionPct - a.contributionPct);
}

export function getProcessSplit(
  activities: { processId: string; processName: string; workloadHours?: number; perEmployeeHours?: number }[],
  basis: "team" | "self"
): { processId: string; processName: string; hours: number; pct: number }[] {
  const totals = new Map<string, { name: string; hours: number }>();
  for (const a of activities) {
    const h = basis === "team" ? (a.workloadHours ?? 0) : (a.perEmployeeHours ?? 0);
    const cur = totals.get(a.processId) ?? { name: a.processName, hours: 0 };
    cur.hours += h;
    totals.set(a.processId, cur);
  }
  const grand = Array.from(totals.values()).reduce((s, v) => s + v.hours, 0) || 1;
  return Array.from(totals.entries())
    .map(([processId, v]) => ({
      processId,
      processName: v.name,
      hours: Math.round(v.hours * 10) / 10,
      pct: Math.round((v.hours / grand) * 1000) / 10,
    }))
    .sort((a, b) => b.hours - a.hours);
}

// re-export so consumers don't need a separate import
export { processes as _processes, kpiList as _kpiList };
export const STANDARD_MONTHLY_HOURS = STANDARD_HOURS;
