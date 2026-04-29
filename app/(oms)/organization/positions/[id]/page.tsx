"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ChevronRight, Edit2, Plus, ArrowLeft, Briefcase, Users,
  TrendingUp, DollarSign, AlertCircle, CheckCircle, Star,
  MapPin, BookOpen, X,
} from "lucide-react";
import { positions, employees, vacancies, departments } from "@/lib/oms-data";
import { ActivitiesWorkloadSection } from "@/components/oms/activities-workload-section";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, CartesianGrid,
} from "recharts";

export default function PositionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const position = positions.find((p) => p.id === id);
  const [deleteDialog, setDeleteDialog] = useState(false);

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Position not found.</p>
        <Link href="/organization/positions">
          <Button variant="outline" size="sm" className="gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Back to Positions</Button>
        </Link>
      </div>
    );
  }

  const dept = departments.find((d) => d.id === position.deptId);
  const positionEmployees = employees.filter((e) => e.position === position.title);
  const positionVacancies = vacancies.filter((v) => v.positionId === position.id);
  const gap = position.planned - position.filled;

  const utilisationHistory = [
    { month: "Nov", util: position.filled - 1 > 0 ? Math.round((( position.filled - 0.5) / position.planned) * 100) : 0 },
    { month: "Dec", util: Math.round((position.filled / position.planned) * 95) },
    { month: "Jan", util: Math.round((position.filled / position.planned) * 97) },
    { month: "Feb", util: Math.round((position.filled / position.planned) * 98) },
    { month: "Mar", util: Math.round((position.filled / position.planned) * 100) },
    { month: "Apr", util: Math.round((position.filled / position.planned) * 100) },
  ];

  const kpiScoreData = positionEmployees.map((e) => ({
    name: e.name.split(" ")[0],
    score: e.kpiScore,
    utilization: e.utilization,
  }));

  return (
    <div className="flex gap-6 min-h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-5 min-w-0">

        {/* Header */}
        <div>
          <nav className="flex items-center gap-1.5 text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
            <Link href="/organization/positions" className="hover:underline">Position Directory</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "var(--primary)" }} className="font-medium">{position.title}</span>
          </nav>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary-light)" }}>
                <Briefcase className="w-7 h-7" style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{position.title}</h1>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>{position.grade}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: position.status === "Open" ? "#FEE2E2" : "#DCFCE7",
                      color: position.status === "Open" ? "var(--destructive)" : "var(--success)",
                    }}
                  >{position.status}</span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{position.dept}</span>
                  <span>·</span>
                  <span>Department Head: {dept?.head ?? "N/A"}</span>
                  <span>·</span>
                  <span>{position.id}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/organization/positions/${id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5"><Edit2 className="w-3.5 h-3.5" /> Edit Position</Button>
              </Link>
              <Link href="/organization/positions/create">
                <Button size="sm" className="gap-1.5" style={{ background: "var(--primary)", color: "white" }}>
                  <Plus className="w-3.5 h-3.5" /> Add Similar
                </Button>
              </Link>
              <Button
                variant="outline" size="sm" className="gap-1.5"
                style={{ color: "var(--destructive)", borderColor: "var(--destructive)" }}
                onClick={() => setDeleteDialog(true)}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Filled", value: `${position.filled} / ${position.planned}`, icon: Users, color: "var(--primary)", bg: "var(--primary-light)" },
            { label: "HC Gap", value: gap > 0 ? `-${gap}` : "0", icon: AlertCircle, color: gap > 0 ? "var(--destructive)" : "var(--success)", bg: gap > 0 ? "#FEE2E2" : "#DCFCE7" },
            { label: "Avg KPI Score", value: positionEmployees.length ? `${Math.round(positionEmployees.reduce((s, e) => s + e.kpiScore, 0) / positionEmployees.length)}%` : "—", icon: Star, color: "var(--success)", bg: "#DCFCE7" },
            { label: "Salary Range", value: `$${(position.salaryMin / 1000).toFixed(0)}K–$${(position.salaryMax / 1000).toFixed(0)}K`, icon: DollarSign, color: "var(--accent)", bg: "#E0F0FF" },
            { label: "Open Vacancies", value: positionVacancies.length, icon: TrendingUp, color: positionVacancies.length > 0 ? "var(--warning)" : "var(--success)", bg: positionVacancies.length > 0 ? "#FEF3C7" : "#DCFCE7" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
                <k.icon className="w-4.5 h-4.5" style={{ color: k.color }} />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight" style={{ color: k.color }}>{k.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Fill Rate Trend */}
          <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Fill Rate Trend</p>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>6-month headcount fill percentage</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={utilisationHistory}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v}%`, "Fill Rate"]} />
                <Line dataKey="util" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3, fill: "var(--primary)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Employee KPI Scores */}
          <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Employee KPI Scores</p>
            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Current incumbents performance</p>
            {kpiScoreData.length > 0 ? (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={kpiScoreData} barSize={16}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="score" name="KPI Score" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-36 flex items-center justify-center text-xs" style={{ color: "var(--muted-foreground)" }}>No incumbents currently assigned</div>
            )}
          </div>
        </div>

        {/* Activities, Workload & Performance */}
        <ActivitiesWorkloadSection
          kind="position"
          positionId={position.id}
          filled={Math.max(1, position.filled || 1)}
        />

        {/* Competencies */}
        <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4" style={{ color: "var(--primary)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Required Competencies</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(position.competencies ?? []).map((c) => (
              <span key={c} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ background: "var(--primary-light)", color: "var(--primary)", borderColor: "var(--primary)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Employees Table */}
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Current Incumbents ({positionEmployees.length})</p>
            <Link href="/organization/employees">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5" style={{ color: "var(--primary)" }}>
                View All Employees <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["Employee", "Grade", "Status", "KPI Score", "Utilization", "Tenure", "Location"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positionEmployees.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-xs" style={{ color: "var(--muted-foreground)" }}>No employees currently in this position.</td></tr>
              )}
              {positionEmployees.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(el) => { (el.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
                  onMouseLeave={(el) => { (el.currentTarget as HTMLElement).style.background = ""; }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                        {e.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{e.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{e.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>{e.grade}</span></td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: e.status === "Active" ? "#DCFCE7" : "#FEF3C7", color: e.status === "Active" ? "var(--success)" : "var(--warning)" }}>{e.status}</span>
                  </td>
                  <td className="py-3 px-4 text-xs font-bold" style={{ color: e.kpiScore >= 90 ? "var(--success)" : e.kpiScore >= 80 ? "var(--primary)" : "var(--warning)" }}>{e.kpiScore}%</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                        <div className="h-full rounded-full" style={{ width: `${e.utilization}%`, background: e.utilization >= 90 ? "var(--destructive)" : "var(--primary)" }} />
                      </div>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{e.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: "var(--muted-foreground)" }}>{e.tenure}y</td>
                  <td className="py-3 px-4 text-xs" style={{ color: "var(--muted-foreground)" }}>{e.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vacancies Table */}
        {positionVacancies.length > 0 && (
          <div className="rounded-xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Open Vacancies ({positionVacancies.length})</p>
              <Link href="/organization/positions?status=Open">
                <Button variant="ghost" size="sm" className="text-xs gap-1.5" style={{ color: "var(--primary)" }}>
                  Open Positions <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  {["ID", "Priority", "Stage", "Days Open", "Candidates", "Recruiter", "Target Date"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positionVacancies.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="py-3 px-4 text-xs font-mono" style={{ color: "var(--primary)" }}>{v.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: v.priority === "Critical" ? "#FEE2E2" : "#FEF3C7", color: v.priority === "Critical" ? "var(--destructive)" : "var(--warning)" }}>{v.priority}</span>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--primary)" }}>{v.status}</td>
                    <td className="py-3 px-4 text-xs font-bold" style={{ color: v.daysOpen > 45 ? "var(--destructive)" : "var(--foreground)" }}>{v.daysOpen}d</td>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--foreground)" }}>{v.candidates}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--muted-foreground)" }}>{v.recruiter}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--muted-foreground)" }}>{v.targetDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>Position Info</p>
          {[
            { label: "Department", value: position.dept },
            { label: "Department Code", value: dept?.code ?? "—" },
            { label: "Location", value: dept?.location ?? "—" },
            { label: "Salary Min", value: `$${(position.salaryMin / 1000).toFixed(0)}K` },
            { label: "Salary Max", value: `$${(position.salaryMax / 1000).toFixed(0)}K` },
            { label: "Department Head", value: dept?.head ?? "N/A" },
          ].map((f) => (
            <div key={f.label} className="flex justify-between py-2 border-b text-xs" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted-foreground)" }}>{f.label}</span>
              <span className="font-medium text-right" style={{ color: "var(--foreground)" }}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--muted-foreground)" }}>Quick Actions</p>
          <div className="flex flex-col gap-2">
            <Link href={`/organization/positions/${id}/edit`}>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <Edit2 className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} /> Edit Position
              </Button>
            </Link>
            <Link href="/organization/positions?status=Open">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <AlertCircle className="w-3.5 h-3.5" style={{ color: "var(--destructive)" }} /> Open Positions
              </Button>
            </Link>
            <Link href="/organization/employees">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <Users className="w-3.5 h-3.5" style={{ color: "var(--success)" }} /> View Employees
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--muted-foreground)" }}>HC Snapshot</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
              <div className="h-full rounded-full" style={{ width: `${(position.filled / position.planned) * 100}%`, background: "var(--primary)" }} />
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>{Math.round((position.filled / position.planned) * 100)}%</span>
          </div>
          <div className="flex justify-between mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <span>{position.filled} filled</span>
            <span>{position.planned} planned</span>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Position</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{position.title}</strong>? This will remove all linked employees, vacancies, and workforce planning data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Link href="/organization/positions">
              <Button style={{ background: "var(--destructive)", color: "white" }}>Confirm Delete</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
