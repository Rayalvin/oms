"use client";

import { useMemo, useState } from "react";
import {
  Building2, ChevronDown, ChevronRight, Plus, Users, Briefcase,
  AlertCircle, TrendingUp, MapPin, Filter, Download, Maximize2, Minimize2,
  Search, DollarSign, Activity, AlertTriangle, UserPlus,
} from "lucide-react";
import { departments, employees, positions } from "@/lib/oms-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

type Employee = (typeof employees)[number];
type OverlayMode = "none" | "cost" | "kpi" | "vacancy";

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`;

function getCostTier(cost: number): "low" | "med" | "high" {
  if (cost >= 200_000) return "high";
  if (cost >= 100_000) return "med";
  return "low";
}

function getKpiTier(kpi: number): "high" | "med" | "low" {
  if (kpi >= 85) return "high";
  if (kpi >= 75) return "med";
  return "low";
}

function getDept(deptId: string) {
  return departments.find((d) => d.id === deptId);
}

// ─── Tree Node ──────────────────────────────────────────────────────────────

type TreeNodeProps = {
  emp: Employee;
  children: Employee[];
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  selected: string | null;
  onSelect: (id: string) => void;
  byManager: Map<string, Employee[]>;
  filterFn: (e: Employee) => boolean;
  searchQuery: string;
  overlay: OverlayMode;
};

function getOverlayColor(emp: Employee, dept: ReturnType<typeof getDept>, overlay: OverlayMode) {
  if (overlay === "cost") {
    const tier = getCostTier(emp.cost);
    if (tier === "high") return "#ef4444";
    if (tier === "med") return "#f59e0b";
    return "#10b981";
  }
  if (overlay === "kpi") {
    const tier = getKpiTier(emp.kpiScore);
    if (tier === "high") return "#10b981";
    if (tier === "med") return "#f59e0b";
    return "#ef4444";
  }
  if (overlay === "vacancy") {
    const v = dept?.vacancies ?? 0;
    if (v >= 3) return "#ef4444";
    if (v >= 1) return "#f59e0b";
    return "#10b981";
  }
  return dept?.color ?? "#64748b";
}

function TreeNode(props: TreeNodeProps) {
  const { emp, children, depth, expanded, onToggle, selected, onSelect, byManager, filterFn, searchQuery, overlay } = props;
  const isExpanded = expanded.has(emp.id);
  const isSelected = selected === emp.id;
  const dept = getDept(emp.deptId);
  const accentColor = getOverlayColor(emp, dept, overlay);
  const hasChildren = children.length > 0;

  const matchesSearch =
    !searchQuery ||
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.dept.toLowerCase().includes(searchQuery.toLowerCase());

  const visibleChildren = children.filter(filterFn);

  return (
    <div className="flex flex-col items-center">
      {/* Connector line from parent */}
      {depth > 0 && (
        <div className="w-px h-6" style={{ background: "var(--border)" }} />
      )}

      {/* Node card */}
      <div
        onClick={() => onSelect(emp.id)}
        className={cn(
          "relative rounded-xl border bg-card cursor-pointer transition-all px-4 py-3 min-w-[220px] max-w-[260px]",
          "hover:shadow-md hover:-translate-y-0.5",
          isSelected && "ring-2 ring-offset-2",
          !matchesSearch && searchQuery && "opacity-30",
        )}
        style={{
          borderTopWidth: 3,
          borderTopColor: accentColor,
          ...(isSelected ? { boxShadow: `0 0 0 2px ${accentColor}` } : {}),
        }}
      >
        {/* Status dot */}
        <div className="absolute top-2 right-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background:
                emp.status === "Active" ? "var(--success)" :
                emp.status === "On Leave" ? "var(--warning)" : "var(--muted-foreground)",
            }}
          />
        </div>

        {/* Avatar circle */}
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ background: accentColor }}
          >
            {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{emp.name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{emp.position}</div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">
            {emp.grade}
          </Badge>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">
            {dept?.code ?? emp.dept}
          </Badge>
          {dept && dept.vacancies > 0 && overlay !== "vacancy" && (
            <Badge className="text-[9px] px-1.5 py-0 h-4 font-normal bg-orange-100 text-orange-700 border-0">
              {dept.vacancies} open
            </Badge>
          )}
        </div>

        {/* Overlay value */}
        {overlay !== "none" && (
          <div className="mt-2 pt-2 border-t flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">
              {overlay === "cost" ? "Annual Cost" : overlay === "kpi" ? "KPI Score" : "Dept Vacancies"}
            </span>
            <span className="font-semibold" style={{ color: accentColor }}>
              {overlay === "cost" ? `$${fmtMoney(emp.cost * 12)}` : overlay === "kpi" ? `${emp.kpiScore}%` : `${dept?.vacancies ?? 0}`}
            </span>
          </div>
        )}

        {/* Direct reports count + expand toggle */}
        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(emp.id);
            }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border bg-card hover:bg-muted flex items-center justify-center shadow-sm"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <span className="absolute -top-1 -right-1 text-[9px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-semibold">
              {children.length}
            </span>
          </button>
        )}
      </div>

      {/* Children */}
      {isExpanded && visibleChildren.length > 0 && (
        <div className="relative mt-6">
          {/* Vertical drop line */}
          <div className="absolute left-1/2 -top-3 w-px h-3" style={{ background: "var(--border)" }} />
          {/* Horizontal connector across children */}
          {visibleChildren.length > 1 && (
            <div
              className="absolute top-0 h-px"
              style={{
                background: "var(--border)",
                left: "calc(50% / " + visibleChildren.length + ")",
                right: "calc(50% / " + visibleChildren.length + ")",
              }}
            />
          )}
          <div className="flex items-start gap-6 pt-0">
            {visibleChildren.map((child) => (
              <TreeNode
                key={child.id}
                emp={child}
                children={byManager.get(child.id) ?? []}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                selected={selected}
                onSelect={onSelect}
                byManager={byManager}
                filterFn={filterFn}
                searchQuery={searchQuery}
                overlay={overlay}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function OrgTreePage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["E001", "E002", "E003"]));
  const [selected, setSelected] = useState<string | null>("E001");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [overlay, setOverlay] = useState<OverlayMode>("none");
  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showAssignEmp, setShowAssignEmp] = useState(false);

  // Build hierarchy index (managerId → children)
  const byManager = useMemo(() => {
    const m = new Map<string, Employee[]>();
    for (const e of employees) {
      const key = e.managerId ?? "ROOT";
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(e);
    }
    return m;
  }, []);

  const root = employees.find((e) => e.managerId === null);

  // Filter function applied to each node
  const filterFn = (e: Employee) => {
    if (filterDept !== "all" && e.deptId !== filterDept) return false;
    if (filterLocation !== "all" && e.location !== filterLocation) return false;
    if (filterLevel !== "all" && e.level !== filterLevel) return false;
    return true;
  };

  // Locations & levels (derived)
  const locations = useMemo(() => Array.from(new Set(employees.map((e) => e.location))).sort(), []);
  const levels = useMemo(() => Array.from(new Set(employees.map((e) => e.level))).sort(), []);

  // Selected employee details
  const selectedEmp = selected ? employees.find((e) => e.id === selected) : null;
  const selectedDept = selectedEmp ? getDept(selectedEmp.deptId) : null;
  const directReports = selected ? byManager.get(selected) ?? [] : [];
  const selectedManager = selectedEmp?.managerId ? employees.find((e) => e.id === selectedEmp.managerId) : null;

  // Counts
  const totalHc = employees.length;
  const totalCost = employees.reduce((s, e) => s + e.cost * 12, 0);
  const avgUtil = Math.round(employees.reduce((s, e) => s + e.utilization, 0) / employees.length);
  const totalVacancies = departments.reduce((s, d) => s + d.vacancies, 0);

  const expandAll = () => setExpanded(new Set(employees.map((e) => e.id)));
  const collapseAll = () => setExpanded(new Set([root?.id ?? ""]));
  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!root) {
    return <div className="p-6">No root executive found.</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-card shrink-0">
        <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5" style={{ color: "var(--primary)" }} />
              Organization Tree
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Interactive hierarchical view of {totalHc} employees across {departments.length} departments
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => setShowAddDept(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Department
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => setShowAddPosition(true)}>
              <Briefcase className="w-3.5 h-3.5" /> Add Position
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => setShowAssignEmp(true)}>
              <UserPlus className="w-3.5 h-3.5" /> Assign Employee
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[
            { label: "Total Headcount", value: totalHc, icon: Users, color: "#3b82f6" },
            { label: "Annual Cost", value: `$${fmtMoney(totalCost)}`, icon: DollarSign, color: "#10b981" },
            { label: "Avg Utilization", value: `${avgUtil}%`, icon: Activity, color: "#f59e0b" },
            { label: "Open Vacancies", value: totalVacancies, icon: AlertTriangle, color: "#ef4444" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-lg border bg-card px-3 py-2 flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${kpi.color}15` }}
              >
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{kpi.label}</div>
                <div className="text-base font-bold leading-tight">{kpi.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name, position, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="h-8 text-xs w-[150px]">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Dept" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="h-8 text-xs w-[130px]">
              <MapPin className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border mx-1" />

          {/* Overlay toggles */}
          <div className="flex items-center rounded-md border bg-muted/30 p-0.5">
            {([
              { mode: "none", label: "Default" },
              { mode: "cost", label: "Cost", icon: DollarSign },
              { mode: "kpi", label: "KPI", icon: TrendingUp },
              { mode: "vacancy", label: "Vacancy", icon: AlertCircle },
            ] as const).map((o) => (
              <button
                key={o.mode}
                onClick={() => setOverlay(o.mode)}
                className={cn(
                  "h-7 px-2.5 text-[11px] rounded font-medium transition-all flex items-center gap-1",
                  overlay === o.mode ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {"icon" in o && o.icon ? <o.icon className="w-3 h-3" /> : null}
                {o.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={expandAll}>
            <Maximize2 className="w-3 h-3" /> Expand All
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={collapseAll}>
            <Minimize2 className="w-3 h-3" /> Collapse All
          </Button>
        </div>
      </div>

      {/* Body: Tree + Analytics */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tree canvas */}
        <div className="flex-1 overflow-auto bg-muted/20">
          <div className="min-w-max p-8 flex justify-center">
            <TreeNode
              emp={root}
              children={byManager.get(root.id) ?? []}
              depth={0}
              expanded={expanded}
              onToggle={toggle}
              selected={selected}
              onSelect={setSelected}
              byManager={byManager}
              filterFn={filterFn}
              searchQuery={searchQuery}
              overlay={overlay}
            />
          </div>
        </div>

        {/* Analytics panel */}
        <aside className="w-[340px] border-l bg-card overflow-y-auto shrink-0">
          {selectedEmp ? (
            <AnalyticsPanel
              emp={selectedEmp}
              dept={selectedDept}
              manager={selectedManager}
              directReports={directReports}
              onSelectEmp={setSelected}
            />
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Select a node to view details
            </div>
          )}
        </aside>
      </div>

      {/* Modals */}
      <AddDepartmentDialog open={showAddDept} onOpenChange={setShowAddDept} />
      <AddPositionDialog open={showAddPosition} onOpenChange={setShowAddPosition} />
      <AssignEmployeeDialog open={showAssignEmp} onOpenChange={setShowAssignEmp} />
    </div>
  );
}

// ─── Analytics Panel ────────────────────────────────────────────────────────

function AnalyticsPanel({
  emp,
  dept,
  manager,
  directReports,
  onSelectEmp,
}: {
  emp: Employee;
  dept: ReturnType<typeof getDept> | null;
  manager: Employee | null | undefined;
  directReports: Employee[];
  onSelectEmp: (id: string) => void;
}) {
  const annualCost = emp.cost * 12;
  const span = directReports.length;
  const teamCost = directReports.reduce((s, r) => s + r.cost * 12, 0) + annualCost;
  const avgTeamUtil = directReports.length
    ? Math.round((directReports.reduce((s, r) => s + r.utilization, 0) + emp.utilization) / (directReports.length + 1))
    : emp.utilization;

  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b" style={{ background: `linear-gradient(135deg, ${dept?.color ?? "#64748b"}10, transparent)` }}>
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: dept?.color ?? "#64748b" }}
          >
            {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold leading-tight">{emp.name}</h3>
            <div className="text-xs text-muted-foreground mt-0.5">{emp.position}</div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-normal">{emp.grade}</Badge>
              <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-normal">{emp.level}</Badge>
              <Badge
                className="text-[9px] h-4 px-1.5 font-normal border-0 text-white"
                style={{ background: dept?.color ?? "#64748b" }}
              >
                {dept?.code}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Key stats */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Annual Cost" value={`$${fmtMoney(annualCost)}`} icon={DollarSign} color="#10b981" />
          <Stat label="Utilization" value={`${emp.utilization}%`} icon={Activity} color="#f59e0b" />
          <Stat label="KPI Score" value={`${emp.kpiScore}%`} icon={TrendingUp} color="#3b82f6" />
          <Stat label="Span of Control" value={span} icon={Users} color="#8b5cf6" />
        </div>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <Row label="Email" value={emp.email} />
        <Row label="Phone" value={emp.phone} />
        <Row label="Location" value={emp.location} />
        <Row label="Hire Date" value={emp.hireDate} />
        <Row label="Tenure" value={`${emp.tenure} years`} />
        <Row
          label="Status"
          value={
            <Badge
              className="text-[9px] h-4 px-1.5 font-normal border-0"
              style={{
                background:
                  emp.status === "Active" ? "#10b98120" :
                  emp.status === "On Leave" ? "#f59e0b20" : "#64748b20",
                color:
                  emp.status === "Active" ? "#059669" :
                  emp.status === "On Leave" ? "#d97706" : "#64748b",
              }}
            >
              {emp.status}
            </Badge>
          }
        />
      </Section>

      {/* Department */}
      {dept && (
        <Section title="Department">
          <Row label="Department" value={dept.name} />
          <Row label="Head" value={dept.head} />
          <Row label="Total HC" value={`${dept.hc} / ${dept.headPlan}`} />
          <Row
            label="Open Roles"
            value={
              <span className={dept.vacancies > 0 ? "text-orange-600 font-semibold" : ""}>
                {dept.vacancies}
              </span>
            }
          />
          <Row label="Dept Budget" value={`$${fmtMoney(dept.budget)}`} />
          <Row label="Avg Tenure" value={`${dept.avgTenure} yrs`} />
        </Section>
      )}

      {/* Team */}
      {(span > 0 || manager) && (
        <Section title="Reporting Structure">
          {manager && (
            <div className="mb-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Reports To</div>
              <button
                onClick={() => onSelectEmp(manager.id)}
                className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 text-left"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                  style={{ background: getDept(manager.deptId)?.color ?? "#64748b" }}
                >
                  {manager.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{manager.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{manager.position}</div>
                </div>
              </button>
            </div>
          )}
          {span > 0 && (
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                Direct Reports ({span})
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {directReports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSelectEmp(r.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                      style={{ background: getDept(r.deptId)?.color ?? "#64748b" }}
                    >
                      {r.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{r.position}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Risk */}
      {emp.riskScore > 30 && (
        <Section title="Risk Indicators">
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-orange-50 border border-orange-200">
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-orange-900">
                Risk Score: {emp.riskScore}/100
              </div>
              <div className="text-[10px] text-orange-700">
                {emp.riskScore > 50 ? "High flight risk — schedule retention review" : "Moderate risk — monitor engagement"}
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Team Cost (if span > 0) */}
      {span > 0 && (
        <Section title="Team Aggregate">
          <Row label="Team Cost (Annual)" value={`$${fmtMoney(teamCost)}`} />
          <Row label="Team Avg Utilization" value={`${avgTeamUtil}%`} />
          <Row label="Total Reports" value={span} />
        </Section>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: React.ReactNode; icon: any; color: string }) {
  return (
    <div className="rounded-lg border bg-card p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-base font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border-b">
      <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right truncate min-w-0">{value}</span>
    </div>
  );
}

// ─── Modals ─────────────────────────────────────────────────────────────────

function AddDepartmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [head, setHead] = useState("");
  const [location, setLocation] = useState("Jakarta");
  const [hcPlan, setHcPlan] = useState("");
  const [budget, setBudget] = useState("");

  const reset = () => { setName(""); setCode(""); setHead(""); setHcPlan(""); setBudget(""); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>Create a new department in the organization structure.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <FormField label="Department Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Customer Success" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Code">
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. CS" maxLength={6} />
            </FormField>
            <FormField label="Location">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jakarta">Jakarta</SelectItem>
                  <SelectItem value="Bandung">Bandung</SelectItem>
                  <SelectItem value="Surabaya">Surabaya</SelectItem>
                  <SelectItem value="Medan">Medan</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Department Head">
            <Select value={head} onValueChange={setHead}>
              <SelectTrigger><SelectValue placeholder="Select head" /></SelectTrigger>
              <SelectContent>
                {employees.filter((e) => e.level === "VP" || e.level === "Executive" || e.level === "C-Suite").map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Headcount Plan">
              <Input type="number" value={hcPlan} onChange={(e) => setHcPlan(e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Budget ($)">
              <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="0" />
            </FormField>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onOpenChange(false); reset(); }}>Create Department</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPositionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [deptId, setDeptId] = useState(departments[0]?.id ?? "");
  const [grade, setGrade] = useState("G5");
  const [planned, setPlanned] = useState("1");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const reset = () => { setTitle(""); setPlanned("1"); setSalaryMin(""); setSalaryMax(""); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Position</DialogTitle>
          <DialogDescription>Define a new position to be filled within a department.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <FormField label="Position Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Product Manager" />
          </FormField>
          <FormField label="Department">
            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Grade">
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Planned Headcount">
              <Input type="number" value={planned} onChange={(e) => setPlanned(e.target.value)} placeholder="1" min={1} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Salary Min ($)">
              <Input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="60000" />
            </FormField>
            <FormField label="Salary Max ($)">
              <Input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="90000" />
            </FormField>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onOpenChange(false); reset(); }}>Create Position</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssignEmployeeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [posId, setPosId] = useState(positions[0]?.id ?? "");
  const [managerId, setManagerId] = useState("");
  const [hireDate, setHireDate] = useState("");

  const reset = () => { setName(""); setHireDate(""); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Employee</DialogTitle>
          <DialogDescription>Add an employee and place them in the org structure.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <FormField label="Full Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya Pratiwi" />
          </FormField>
          <FormField label="Position">
            <Select value={posId} onValueChange={setPosId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.title} — {p.dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Reports To">
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {employees.filter((e) => ["Manager", "Lead", "VP", "Executive", "C-Suite"].includes(e.level)).map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name} — {e.position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Hire Date">
            <Input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onOpenChange(false); reset(); }}>Assign Employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
