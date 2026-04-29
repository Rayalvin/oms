"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  ChevronRight,
  DollarSign,
  Edit3,
  FileText,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { positionNeedDetections, departments, type PositionNeedDetection } from "@/lib/oms-data";

// ---- helpers ----
function confColor(c: number) {
  if (c >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (c >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-muted-foreground";
}
function fmt(n: number) {
  return `Rp ${(n / 1000000).toFixed(0)}M`;
}

// ---- AI Job Description mock generator ----
const GENERATED_JD = (pos: PositionNeedDetection) => `
POSITION TITLE: ${pos.recommendedPositionName}
DEPARTMENT: ${pos.department}
ROLE LEVEL: ${pos.suggestedRoleLevel}
REPORTING TO: ${pos.suggestedReportingLine.split("→").slice(-2, -1)[0]?.trim() ?? "Department Head"}

1. POSITION SUMMARY
The ${pos.recommendedPositionName} is responsible for leading ${pos.department.toLowerCase()} analytics, planning, and coordination activities that require specialized expertise currently not covered by existing roles. This position addresses a critical workload gap of ${pos.workloadHoursMonth} adjusted hours/month across ${pos.activityCount} activities.

2. ROLE PURPOSE
To provide dedicated ownership of ${pos.capabilityGap.requiredSkillCluster.split(",")[0].trim()} functions within ${pos.department}, ensuring process accountability, workload balance, and KPI target achievement.

3. KEY RESPONSIBILITIES
• Lead and own all ${pos.recommendedPositionName.split(" ").slice(-2).join(" ")} activities within ${pos.department}
• Monitor utilization metrics and proactively address capacity risks
• Coordinate with ${pos.relatedExistingRoles.join(", ")} to ensure seamless process handoffs
• Prepare regular performance and planning reports for department leadership
• Support HC planning and scenario analysis with data-driven insights
• Maintain process documentation and SOPs for all owned activities
• Represent ${pos.department} in cross-functional planning and governance meetings

4. MAIN ACTIVITIES
${pos.evidenceActivities.map((a) => `• ${a.activityName} (${a.frequency}, ${a.duration}h/execution)`).join("\n")}

5. BUSINESS PROCESS OWNERSHIP / SUPPORT
${pos.evidenceActivities.map((a) => `• ${a.linkedProcess}`).filter((v, i, s) => s.indexOf(v) === i).join("\n")}

6. KPI OWNERSHIP
• Utilization rate within 85–100% target band
• Activity completion SLA: ≥ 95%
• Process documentation coverage: 100%
• Workload hours accuracy: ± 5% vs forecast

7. REQUIRED COMPETENCIES
${pos.capabilityGap.requiredSkillCluster.split(",").map((s) => `• ${s.trim()}`).join("\n")}

8. TECHNICAL SKILLS
• Advanced proficiency in data analysis tools (Excel, Power BI, or equivalent)
• Experience with ERP / HRIS / planning systems
• Understanding of process mapping and workflow automation
• Reporting and dashboard development capability

9. BEHAVIORAL COMPETENCIES
• Analytical thinking and problem-solving
• Attention to detail and data accuracy
• Cross-functional collaboration
• Proactive communication
• Results orientation under tight deadlines

10. EXPERIENCE REQUIREMENTS
• Minimum 3–5 years of relevant experience in ${pos.capabilityGap.requiredSkillCluster.split(",")[0].trim()}
• Demonstrated experience managing comparable workload volumes
• Track record of process improvement or capacity optimization

11. EDUCATION REQUIREMENTS
• Bachelor's degree in relevant field (Business, Engineering, Finance, HR, or equivalent)
• Professional certification preferred (e.g., PMP, SHRM, CFA, or domain-specific)

12. REPORTING LINE
${pos.suggestedReportingLine}

13. INTERNAL COLLABORATION
${pos.relatedExistingRoles.map((r) => `• ${r}`).join("\n")}

14. SUCCESS METRICS
• Reduce current utilization from ${pos.utilizationPct}% to 85–95% within 6 months of hire
• Close ${pos.activityCount} unowned activity assignments within 60 days
• Achieve SLA compliance ≥ 95% across all owned processes

15. TOOLS / SYSTEMS USED
• Organization Management System (OMS)
• Business Process Management module
• Workload & Activity tracking
• Financial & Cost planning integration

16. WORKLOAD RATIONALE
Required HC: ${pos.suggestedHc} FTE based on ${pos.workloadHoursMonth} adjusted hours/month ÷ ${160 * 0.85} effective monthly capacity per FTE.

17. SUGGESTED GRADE / ROLE LEVEL
${pos.suggestedRoleLevel}

18. HIRING PRIORITY
High — current utilization at ${pos.utilizationPct}% with active SLA risk.

19. DEVELOPMENT PATH
• Year 1: Stabilize activity ownership and SLA compliance
• Year 2: Lead process improvement and automation initiatives
• Year 3: Potential promotion to Senior ${pos.recommendedPositionName.split(" ").pop()} or Team Lead

20. APPROVAL ROUTE
Workforce Planning Manager → OD Manager → Finance Controller → CHRO
`.trim();

// ====================================================================
// MAIN COMPONENT
// ====================================================================
export function PositionNeedDetection() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [jdGenerated, setJdGenerated] = useState<string | null>(null);
  const [jdGenerating, setJdGenerating] = useState(false);
  const [jdEditable, setJdEditable] = useState(false);
  const [jdContent, setJdContent] = useState("");
  const [explaining, setExplaining] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const visible = positionNeedDetections.filter((p) => !dismissed.has(p.id));
  const evidence = visible.find((p) => p.id === evidenceId);
  const proposal = visible.find((p) => p.id === proposalId) ?? positionNeedDetections.find((p) => p.id === proposalId);

  function handleGenerateJD() {
    if (!proposal) return;
    setJdGenerating(true);
    setTimeout(() => {
      const jd = GENERATED_JD(proposal);
      setJdContent(jd);
      setJdGenerated(proposal.id);
      setJdGenerating(false);
    }, 1800);
  }

  function handleSubmitProposal() {
    if (!proposalId) return;
    setSubmitted((s) => new Set([...s, proposalId]));
    setProposalId(null);
  }

  return (
    <>
      {/* ---- Card list ---- */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            All position need recommendations have been reviewed.
          </div>
        )}

        {visible.map((pnd) => (
          <Card
            key={pnd.id}
            className="border-l-4"
            style={{ borderLeftColor: pnd.aiConfidence >= 85 ? "var(--destructive)" : "var(--warning)" }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold">{pnd.recommendedPositionName}</p>
                      <Badge variant="outline" className="text-[10px]">{pnd.department}</Badge>
                      {submitted.has(pnd.id) && (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                          Proposal Submitted
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{pnd.trigger}</p>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Workload: </span>
                        <span className="font-semibold tabular-nums">{pnd.workloadHoursMonth} h/month</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Utilization: </span>
                        <span className="font-semibold tabular-nums text-destructive">{pnd.utilizationPct}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Activities: </span>
                        <span className="font-semibold tabular-nums">{pnd.activityCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Suggested HC: </span>
                        <span className="font-semibold tabular-nums">{pnd.suggestedHc} FTE</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monthly cost: </span>
                        <span className="font-semibold tabular-nums">{fmt(pnd.monthlyCostEstimate)}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">AI Confidence</span>
                      <Progress value={pnd.aiConfidence} className="h-1.5 w-24" />
                      <span className={`text-xs font-bold tabular-nums ${confColor(pnd.aiConfidence)}`}>
                        {pnd.aiConfidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDismissed((s) => new Set([...s, pnd.id]))}
                  className="flex-none rounded p-1 text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => setEvidenceId(pnd.id)}>
                  <FileText className="h-3.5 w-3.5" /> View Evidence
                </Button>
                <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => setProposalId(pnd.id)}>
                  <Plus className="h-3.5 w-3.5" /> Create Position Proposal
                </Button>
                <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={() => setExplaining(pnd.id)}>
                  <Sparkles className="h-3.5 w-3.5" /> Ask AI to Explain
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Evidence Panel (Sheet) ---- */}
      <Sheet open={!!evidenceId} onOpenChange={(o) => !o && setEvidenceId(null)}>
        <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto p-0">
          {evidence && (
            <>
              <SheetHeader className="sticky top-0 z-10 border-b bg-card px-6 py-4">
                <SheetTitle className="text-base">
                  Position Need Evidence — {evidence.recommendedPositionName}
                </SheetTitle>
                <p className="text-xs text-muted-foreground">{evidence.department} · {evidence.suggestedRoleLevel}</p>
              </SheetHeader>

              <div className="space-y-6 px-6 py-5">
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                    <TabsTrigger value="workload" className="text-xs">Workload</TabsTrigger>
                    <TabsTrigger value="risk" className="text-xs">Risk & Finance</TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Detection Summary */}
                  <TabsContent value="summary" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Recommended Position", value: evidence.recommendedPositionName },
                        { label: "Department", value: evidence.department },
                        { label: "Role Level", value: evidence.suggestedRoleLevel },
                        { label: "Suggested HC", value: `${evidence.suggestedHc} FTE` },
                        { label: "AI Confidence", value: `${evidence.aiConfidence}%` },
                        { label: "Trigger Source", value: evidence.triggerSource },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg border bg-muted/30 p-3">
                          <p className="text-[11px] text-muted-foreground">{item.label}</p>
                          <p className="mt-0.5 text-xs font-semibold">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border bg-amber-50 dark:bg-amber-900/10 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Detection Trigger</p>
                      <p className="mt-1 text-xs">{evidence.trigger}</p>
                    </div>

                    <Separator />
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Capability Gap</p>
                      <div className="space-y-2 text-xs">
                        <div><span className="text-muted-foreground">Missing competency: </span><span className="font-medium">{evidence.capabilityGap.missingCompetency}</span></div>
                        <div><span className="text-muted-foreground">Current role mismatch: </span><span className="font-medium">{evidence.capabilityGap.currentRoleMismatch}</span></div>
                        <div><span className="text-muted-foreground">Required skill cluster: </span><span className="font-medium">{evidence.capabilityGap.requiredSkillCluster}</span></div>
                        <div><span className="text-muted-foreground">Suggested level: </span><span className="font-medium">{evidence.capabilityGap.suggestedLevel}</span></div>
                      </div>
                    </div>

                    <Separator />
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organization Fit</p>
                      <div className="space-y-2 text-xs">
                        <div><span className="text-muted-foreground">Parent department: </span><span className="font-medium">{evidence.suggestedParentDept}</span></div>
                        <div><span className="text-muted-foreground">Reporting line: </span><span className="font-medium">{evidence.suggestedReportingLine}</span></div>
                        <div><span className="text-muted-foreground">Potential owner: </span><span className="font-medium">{evidence.potentialPositionOwner}</span></div>
                        <div><span className="text-muted-foreground">Related roles: </span><span className="font-medium">{evidence.relatedExistingRoles.join(", ")}</span></div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Workload Evidence */}
                  <TabsContent value="workload" className="mt-4">
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/40">
                            {["Activity", "Process", "Current Position", "Frequency", "Duration", "Adj. Hours", "Util Impact"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {evidence.evidenceActivities.map((a, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                              <td className="px-3 py-2 font-medium">{a.activityName}</td>
                              <td className="px-3 py-2 text-muted-foreground">{a.linkedProcess}</td>
                              <td className="px-3 py-2 text-muted-foreground">{a.currentPosition}</td>
                              <td className="px-3 py-2">{a.frequency}</td>
                              <td className="px-3 py-2 tabular-nums">{a.duration}h</td>
                              <td className="px-3 py-2 font-semibold tabular-nums text-destructive">{a.adjustedWorkloadHours}h</td>
                              <td className="px-3 py-2 tabular-nums">+{a.utilizationImpact}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex gap-4 rounded-lg border bg-muted/30 p-3 text-xs">
                      <div><span className="text-muted-foreground">Total adjusted hours: </span><span className="font-bold">{evidence.workloadHoursMonth}h/month</span></div>
                      <div><span className="text-muted-foreground">Current utilization: </span><span className="font-bold text-destructive">{evidence.utilizationPct}%</span></div>
                      <div><span className="text-muted-foreground">Required FTE: </span><span className="font-bold">{evidence.suggestedHc}</span></div>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Risk & Finance */}
                  <TabsContent value="risk" className="mt-4 space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financial Preview</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Salary Range", value: `${fmt(evidence.salaryRangeMin)} – ${fmt(evidence.salaryRangeMax)}` },
                          { label: "Benefits Estimate", value: fmt(evidence.benefitsEstimate) },
                          { label: "Monthly Cost", value: fmt(evidence.monthlyCostEstimate) },
                          { label: "Annual Cost", value: fmt(evidence.annualCostEstimate) },
                          { label: "Budget Impact", value: evidence.budgetImpact },
                          { label: "Cost Center", value: evidence.costCenter },
                        ].map((item) => (
                          <div key={item.label} className="rounded-lg border bg-muted/30 p-2.5">
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                            <p className="mt-0.5 text-xs font-semibold">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-destructive">Risk if Not Created</p>
                      <div className="space-y-2">
                        {[
                          { icon: AlertTriangle, label: "SLA Risk", value: evidence.slaRisk },
                          { icon: Users, label: "Overload Risk", value: evidence.overloadRisk },
                          { icon: Shield, label: "Process Ownership Gap", value: evidence.processOwnershipGap },
                          { icon: ChevronRight, label: "Recruitment Delay", value: evidence.recruitmentDelay },
                          { icon: XCircle, label: "Service Quality Impact", value: evidence.serviceQualityImpact },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-start gap-2 rounded-lg border bg-destructive/5 p-2.5">
                            <Icon className="mt-0.5 h-3.5 w-3.5 flex-none text-destructive" />
                            <div>
                              <p className="text-[11px] font-semibold text-destructive">{label}</p>
                              <p className="text-xs text-muted-foreground">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => { setEvidenceId(null); setProposalId(evidence.id); }}>
                    <FileText className="mr-1.5 h-3.5 w-3.5" /> Create Position Proposal
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Send to Scenario Planning
                  </Button>
                  <Button size="sm" variant="outline">
                    Export Evidence
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEvidenceId(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ---- Create Position Proposal (large dialog) ---- */}
      <Dialog open={!!proposalId} onOpenChange={(o) => !o && setProposalId(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Position Proposal</DialogTitle>
            <DialogDescription>
              This is a Workforce Planning proposal. It must be approved before becoming an official Organization Structure position.
            </DialogDescription>
          </DialogHeader>

          {proposal && (
            <Tabs defaultValue="identity" className="mt-2">
              <TabsList className="grid w-full grid-cols-6 h-8">
                {["identity", "justification", "workforce", "financial", "jd", "approval"].map((tab, i) => (
                  <TabsTrigger key={tab} value={tab} className="text-[11px] capitalize">
                    {i + 1}. {tab === "jd" ? "AI JD" : tab === "identity" ? "Identity" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Section 1 — Position Identity */}
              <TabsContent value="identity" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Proposed Position Name</Label>
                    <Input defaultValue={proposal.recommendedPositionName} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Position Code (auto)</Label>
                    <Input defaultValue={`POS-${proposal.departmentId}-${Date.now().toString().slice(-4)}`} readOnly className="h-8 text-xs bg-muted/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Department</Label>
                    <Select defaultValue={proposal.department}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.name} className="text-xs">{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Reporting Position</Label>
                    <Input defaultValue={proposal.suggestedReportingLine.split("→").slice(-2, -1)[0]?.trim() ?? ""} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Role Level</Label>
                    <Input defaultValue={proposal.suggestedRoleLevel} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Employment Type</Label>
                    <Select defaultValue="Permanent">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Permanent", "Contract", "Outsourced"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cost Center</Label>
                    <Input defaultValue={proposal.costCenter} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Effective Date</Label>
                    <Input type="date" defaultValue="2026-07-01" className="h-8 text-xs" />
                  </div>
                </div>
              </TabsContent>

              {/* Section 2 — Business Justification */}
              <TabsContent value="justification" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Trigger Source</Label>
                    <Select defaultValue={proposal.triggerSource}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Workload gap", "New business process", "KPI risk", "Scenario planning", "Manual request"].map((t) => (
                          <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hiring Priority</Label>
                    <Select defaultValue="High">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Critical", "High", "Medium", "Low"].map((p) => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Justification Narrative</Label>
                  <Textarea defaultValue={proposal.trigger} className="min-h-[80px] text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Linked Business Processes</Label>
                  <Input defaultValue={proposal.evidenceActivities.map((a) => a.linkedProcess).filter((v, i, s) => s.indexOf(v) === i).join(", ")} className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Linked Activities</Label>
                  <Input defaultValue={proposal.evidenceActivities.map((a) => a.activityName).join(", ")} className="h-8 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Expected Business Impact</Label>
                  <Textarea defaultValue={`Reduce utilization from ${proposal.utilizationPct}% to target 85–95%. Close ${proposal.activityCount} unowned activities. Mitigate: ${proposal.slaRisk}`} className="min-h-[60px] text-xs" />
                </div>
              </TabsContent>

              {/* Section 3 — Workforce Planning Details */}
              <TabsContent value="workforce" className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Suggested HC", value: String(proposal.suggestedHc) },
                    { label: "Workload Hours / Month", value: String(proposal.workloadHoursMonth) },
                    { label: "Current HC Available", value: "0" },
                    { label: "Gap Addressed", value: String(proposal.suggestedHc) },
                    { label: "Current Utilization", value: `${proposal.utilizationPct}%` },
                    { label: "Target Utilization", value: "90%" },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                      <Label className="text-xs">{f.label}</Label>
                      <Input defaultValue={f.value} className="h-8 text-xs" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hiring Timeline</Label>
                    <Select defaultValue="3 months">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Immediate", "3 months", "6 months", "12 months"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Internal Mobility Option</Label>
                    <Select defaultValue="Evaluate first">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Yes — promote internally", "Evaluate first", "External hire only"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Section 4 — Financial Preview */}
              <TabsContent value="financial" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Salary Range Min", value: fmt(proposal.salaryRangeMin) },
                    { label: "Salary Range Max", value: fmt(proposal.salaryRangeMax) },
                    { label: "Benefits Estimate", value: fmt(proposal.benefitsEstimate) },
                    { label: "Monthly Cost Estimate", value: fmt(proposal.monthlyCostEstimate) },
                    { label: "Annual Cost Projection", value: fmt(proposal.annualCostEstimate) },
                    { label: "Budget Availability", value: proposal.budgetImpact },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                      <Label className="text-xs">{f.label}</Label>
                      <Input defaultValue={f.value} className="h-8 text-xs" />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Section 5 — AI Job Description */}
              <TabsContent value="jd" className="mt-4 space-y-4">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Job Description Builder
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Position Title", value: proposal.recommendedPositionName },
                        { label: "Department", value: proposal.department },
                        { label: "Role Level", value: proposal.suggestedRoleLevel },
                        { label: "Reporting Line", value: proposal.suggestedReportingLine.split("→").slice(-2, -1)[0]?.trim() ?? "" },
                      ].map((f) => (
                        <div key={f.label} className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">{f.label}</Label>
                          <Input value={f.value} readOnly className="h-7 text-xs bg-background" />
                        </div>
                      ))}
                    </div>
                    <Button
                      className="gap-2"
                      onClick={handleGenerateJD}
                      disabled={jdGenerating}
                    >
                      {jdGenerating ? (
                        <><RotateCcw className="h-3.5 w-3.5 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-3.5 w-3.5" /> Generate Comprehensive Job Description</>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {jdGenerated === proposal.id && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold">Generated Job Description</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={handleGenerateJD}>
                          <RotateCcw className="h-3 w-3" /> Regenerate
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setJdEditable(!jdEditable)}>
                          <Edit3 className="h-3 w-3" /> {jdEditable ? "Lock" : "Edit Manually"}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      value={jdContent}
                      onChange={(e) => setJdContent(e.target.value)}
                      readOnly={!jdEditable}
                      className="min-h-[360px] font-mono text-[11px] leading-relaxed"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs">Save Job Description</Button>
                      <Button size="sm" className="h-7 text-xs">Attach to Proposal</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Section 6 — Approval Route */}
              <TabsContent value="approval" className="mt-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  The following approval chain is required before this position becomes official in the Organization Structure.
                </p>
                <div className="space-y-2">
                  {[
                    { step: 1, approver: "Workforce Planning Manager", sla: "2 business days", risk: "Low" },
                    { step: 2, approver: "Organization Development Manager", sla: "3 business days", risk: "Low" },
                    { step: 3, approver: "Finance Controller", sla: "3 business days", risk: "Medium — budget review" },
                    { step: 4, approver: "CHRO / Executive Approver", sla: "5 business days", risk: "Low" },
                  ].map((a) => (
                    <div key={a.step} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">
                        {a.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{a.approver}</p>
                        <p className="text-[11px] text-muted-foreground">SLA: {a.sla} · Risk: {a.risk}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">Pending</Badge>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <p className="font-semibold">Evidence Completeness</p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      { label: "Workload evidence", done: true },
                      { label: "Capability gap analysis", done: true },
                      { label: "Financial preview", done: true },
                      { label: "Job description", done: jdGenerated === proposal.id },
                      { label: "Org fit analysis", done: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.done ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        <span className={item.done ? "" : "text-amber-600"}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex flex-wrap gap-2 pt-4">
            <Button variant="outline" onClick={() => setProposalId(null)}>Cancel</Button>
            <Button variant="outline">Save Draft</Button>
            <Button variant="outline">
              <Send className="mr-1.5 h-3.5 w-3.5" /> Send to Scenario Planning
            </Button>
            <Button onClick={handleSubmitProposal}>
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Submit Position Proposal for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- AI Explain Dialog ---- */}
      <Dialog open={!!explaining} onOpenChange={(o) => !o && setExplaining(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Explanation
            </DialogTitle>
          </DialogHeader>
          {explaining && (() => {
            const pnd = positionNeedDetections.find((p) => p.id === explaining);
            if (!pnd) return null;
            return (
              <div className="space-y-3 text-sm">
                <p className="font-medium">{pnd.recommendedPositionName}</p>
                <p className="text-muted-foreground">
                  The AI detected this position need based on {pnd.activityCount} activities that are currently distributed
                  across existing roles without a dedicated owner, resulting in {pnd.utilizationPct}% utilization —
                  significantly above the 100% threshold.
                </p>
                <p className="text-muted-foreground">
                  The primary evidence is a total of <strong>{pnd.workloadHoursMonth} adjusted workload hours per month</strong>.
                  Based on an effective monthly capacity of {Math.round(160 * 0.85)} hours per FTE,
                  this equates to <strong>{pnd.suggestedHc} required FTEs</strong>.
                </p>
                <p className="text-muted-foreground">
                  Confidence score of <strong>{pnd.aiConfidence}%</strong> reflects the strength of the workload signal
                  and the degree to which existing roles are mismatched with required competencies:
                  &ldquo;{pnd.capabilityGap.currentRoleMismatch}&rdquo;.
                </p>
                <p className="text-muted-foreground">
                  If this position is not created, the system projects: {pnd.overloadRisk}.
                </p>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setExplaining(null)}>Close</Button>
            {explaining && (
              <Button onClick={() => { setProposalId(explaining); setExplaining(null); }}>
                Create Proposal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Missing Plus import — add it locally
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14M12 5v14" />
    </svg>
  );
}
