type DivisionName =
  | "Operations"
  | "Commercial & Sales"
  | "Finance & Governance"
  | "Human Capital"
  | "Technology & Digital"
  | "Supply Chain & Logistics"
  | "Strategy & Transformation";

type Frequency = "Daily" | "Weekly" | "Monthly";
type KpiStatus = "On Track" | "At Risk" | "Overdue";

const MONTHLY_HOURS = 160;

const divisionBlueprint: Array<{
  id: string;
  name: DivisionName;
  departments: Array<{ id: string; name: string; code: string }>;
}> = [
  {
    id: "DV01",
    name: "Operations",
    departments: [
      { id: "D101", name: "Plant Operations", code: "OPS-PLT" },
      { id: "D102", name: "Service Operations", code: "OPS-SVC" },
    ],
  },
  {
    id: "DV02",
    name: "Commercial & Sales",
    departments: [
      { id: "D201", name: "Enterprise Sales", code: "COM-ENT" },
      { id: "D202", name: "Channel Sales", code: "COM-CHN" },
    ],
  },
  {
    id: "DV03",
    name: "Finance & Governance",
    departments: [
      { id: "D301", name: "Finance Control", code: "FIN-CTL" },
      { id: "D302", name: "Risk & Compliance", code: "FIN-RSK" },
    ],
  },
  {
    id: "DV04",
    name: "Human Capital",
    departments: [
      { id: "D401", name: "Talent Acquisition", code: "HC-TA" },
      { id: "D402", name: "People Operations", code: "HC-OPS" },
    ],
  },
  {
    id: "DV05",
    name: "Technology & Digital",
    departments: [
      { id: "D501", name: "Product Engineering", code: "TECH-ENG" },
      { id: "D502", name: "Data & AI", code: "TECH-DATA" },
    ],
  },
  {
    id: "DV06",
    name: "Supply Chain & Logistics",
    departments: [
      { id: "D601", name: "Procurement", code: "SC-PROC" },
      { id: "D602", name: "Warehouse & Distribution", code: "SC-WH" },
    ],
  },
  {
    id: "DV07",
    name: "Strategy & Transformation",
    departments: [
      { id: "D701", name: "Corporate Strategy", code: "STR-CO" },
      { id: "D702", name: "Transformation Office", code: "STR-TR" },
    ],
  },
];

const levelBlueprint = [
  { level: "Executive", count: 1, salary: 72000, allowanceRate: 0.22, bonusPct: 35 },
  { level: "VP", count: 1, salary: 42000, allowanceRate: 0.18, bonusPct: 28 },
  { level: "Manager", count: 1, salary: 23000, allowanceRate: 0.15, bonusPct: 20 },
  { level: "Lead", count: 1, salary: 17000, allowanceRate: 0.13, bonusPct: 15 },
  { level: "Senior Staff", count: 1, salary: 12000, allowanceRate: 0.1, bonusPct: 10 },
  { level: "Staff", count: 2, salary: 8500, allowanceRate: 0.08, bonusPct: 8 },
] as const;

const roleByDivision: Record<DivisionName, string[]> = {
  Operations: ["Operations", "Production", "Quality", "Service"],
  "Commercial & Sales": ["Sales", "Account", "Business", "Commercial"],
  "Finance & Governance": ["Finance", "Control", "Audit", "Compliance"],
  "Human Capital": ["Talent", "People", "HR", "Workforce"],
  "Technology & Digital": ["Engineering", "Platform", "Data", "Automation"],
  "Supply Chain & Logistics": ["Procurement", "Warehouse", "Logistics", "Planning"],
  "Strategy & Transformation": ["Strategy", "Transformation", "PMO", "Change"],
};

const firstNames = [
  "Andi", "Budi", "Citra", "Dewi", "Eka", "Fitri", "Gilang", "Hana", "Indra", "Joko",
  "Kevin", "Lestari", "Maya", "Nadia", "Oscar", "Putri", "Rina", "Satria", "Tania", "Umar",
  "Vania", "Wahyu", "Xavier", "Yuni", "Zidan", "Ari", "Bella", "Chandra", "Dimas", "Elisa",
  "Farhan", "Grace", "Hendra", "Intan", "Jason", "Kirana", "Lukman", "Mira", "Niko", "Olivia",
];

const lastNames = [
  "Saputra", "Pratama", "Wijaya", "Kusuma", "Rahman", "Santoso", "Lestari", "Nugroho", "Hartono", "Siregar",
  "Tan", "Lim", "Khan", "Patel", "Garcia", "Lee", "Smith", "Chen", "Halim", "Wibowo",
  "Purnomo", "Mulyani", "Setiawan", "Hidayat", "Anggraini", "Maharani", "Susanto", "Aditya", "Putra", "Dewantara",
];

const skillByDivision: Record<DivisionName, string[]> = {
  Operations: ["Lean", "SOP", "Root Cause", "Scheduling", "Safety"],
  "Commercial & Sales": ["Negotiation", "CRM", "Forecasting", "Pipeline", "Presentation"],
  "Finance & Governance": ["Budgeting", "Audit", "Risk", "Controls", "Regulatory"],
  "Human Capital": ["Recruiting", "Coaching", "HRIS", "Engagement", "Policy"],
  "Technology & Digital": ["TypeScript", "Cloud", "Data Modeling", "Automation", "Security"],
  "Supply Chain & Logistics": ["Procurement", "Inventory", "Distribution", "S&OP", "Vendor Mgmt"],
  "Strategy & Transformation": ["Roadmapping", "OKR", "PMO", "Change Mgmt", "Business Case"],
};

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

function frequencyPerMonth(freq: Frequency): number {
  if (freq === "Daily") return 22;
  if (freq === "Weekly") return 4;
  return 1;
}

const positions: Array<{
  id: string;
  positionName: string;
  divisionId: string;
  division: DivisionName;
  departmentId: string;
  department: string;
  reportsTo: string | null;
  level: string;
  headcountCapacity: number;
  currentFilledHc: number;
  vacancyCount: number;
  baseSalaryMonthly: number;
  allowancesMonthly: number;
  bonusPct: number;
  totalMonthlyCostPerHead: number;
  annualCostPerHead: number;
}> = [];

positions.push({
  id: "POS000",
  positionName: "Chief Executive Officer",
  divisionId: "CORP",
  division: "Strategy & Transformation",
  departmentId: "CORP",
  department: "Corporate",
  reportsTo: null,
  level: "CEO",
  headcountCapacity: 1,
  currentFilledHc: 1,
  vacancyCount: 0,
  baseSalaryMonthly: 95000,
  allowancesMonthly: 25000,
  bonusPct: 40,
  totalMonthlyCostPerHead: 123167,
  annualCostPerHead: 1478000,
});

let positionCounter = 1;
for (const division of divisionBlueprint) {
  for (const dept of division.departments) {
    const roleWords = roleByDivision[division.name];
    for (let i = 0; i < levelBlueprint.length; i++) {
      const levelDef = levelBlueprint[i];
      for (let slot = 0; slot < levelDef.count; slot++) {
        const id = `POS${String(positionCounter).padStart(3, "0")}`;
        const roleWord = pick(roleWords, i + slot);
        const positionName =
          levelDef.level === "Executive"
            ? `${dept.name} Director`
            : levelDef.level === "VP"
              ? `VP ${dept.name}`
              : `${levelDef.level} ${roleWord} ${slot + 1}`;
        const capBase = levelDef.level === "Staff" ? 4 : levelDef.level === "Senior Staff" ? 3 : 1;
        const headcountCapacity = capBase + ((positionCounter + slot) % 2);
        const vacancyCount = (positionCounter % 5 === 0 ? 1 : 0) + (levelDef.level === "Staff" && positionCounter % 7 === 0 ? 1 : 0);
        const currentFilledHc = Math.max(0, headcountCapacity - vacancyCount);
        const baseSalaryMonthly = levelDef.salary + (positionCounter % 6) * 350;
        const allowancesMonthly = Math.round(baseSalaryMonthly * levelDef.allowanceRate);
        const bonusMonthly = (baseSalaryMonthly * levelDef.bonusPct) / 100 / 12;
        const totalMonthlyCostPerHead = Math.round(baseSalaryMonthly + allowancesMonthly + bonusMonthly);
        const annualCostPerHead = totalMonthlyCostPerHead * 12;

        positions.push({
          id,
          positionName,
          divisionId: division.id,
          division: division.name,
          departmentId: dept.id,
          department: dept.name,
          reportsTo: levelDef.level === "Executive" ? "POS000" : null,
          level: levelDef.level,
          headcountCapacity,
          currentFilledHc,
          vacancyCount,
          baseSalaryMonthly,
          allowancesMonthly,
          bonusPct: levelDef.bonusPct,
          totalMonthlyCostPerHead,
          annualCostPerHead,
        });
        positionCounter += 1;
      }
    }
  }
}

const deptHeadByDepartment = new Map<string, string>();
for (const p of positions) {
  if (p.level === "Executive") deptHeadByDepartment.set(p.departmentId, p.id);
}
for (const p of positions) {
  if (p.id === "POS000" || p.level === "Executive") continue;
  p.reportsTo = deptHeadByDepartment.get(p.departmentId) ?? "POS000";
}

const employees: Array<{
  id: string;
  name: string;
  assignedPositionId: string;
  assignedPosition: string;
  departmentId: string;
  department: string;
  divisionId: string;
  division: DivisionName;
  salaryMonthly: number;
  annualCost: number;
  employmentStatus: "Active" | "Probation" | "On Leave";
  joinDate: string;
  performanceScore: number;
  utilizationPct: number;
  skillTags: string[];
}> = [];

let employeeCounter = 1;
for (const position of positions) {
  for (let i = 0; i < position.currentFilledHc; i++) {
    const id = `EMP${String(employeeCounter).padStart(4, "0")}`;
    const fn = pick(firstNames, employeeCounter + i);
    const ln = pick(lastNames, employeeCounter * 3 + i);
    const perf = 62 + ((employeeCounter * 7) % 36);
    const utilBase = 55 + ((employeeCounter * 11) % 60);
    const utilizationPct =
      position.level.includes("Staff") && employeeCounter % 10 === 0
        ? 108 + (employeeCounter % 9)
        : employeeCounter % 9 === 0
          ? 52 + (employeeCounter % 7)
          : utilBase;
    const skillPool = skillByDivision[position.division];
    const status: "Active" | "Probation" | "On Leave" =
      employeeCounter % 29 === 0 ? "On Leave" : employeeCounter % 13 === 0 ? "Probation" : "Active";
    const year = 2017 + (employeeCounter % 9);
    const month = String(1 + (employeeCounter % 12)).padStart(2, "0");
    const day = String(1 + (employeeCounter % 27)).padStart(2, "0");

    employees.push({
      id,
      name: `${fn} ${ln}`,
      assignedPositionId: position.id,
      assignedPosition: position.positionName,
      departmentId: position.departmentId,
      department: position.department,
      divisionId: position.divisionId,
      division: position.division,
      salaryMonthly: Math.round(position.baseSalaryMonthly * (0.95 + ((employeeCounter % 8) * 0.01))),
      annualCost: position.annualCostPerHead,
      employmentStatus: status,
      joinDate: `${year}-${month}-${day}`,
      performanceScore: perf,
      utilizationPct,
      skillTags: [pick(skillPool, employeeCounter), pick(skillPool, employeeCounter + 2), pick(skillPool, employeeCounter + 4)],
    });
    employeeCounter += 1;
  }
}

const kpis: Array<{
  id: string;
  name: string;
  ownerDepartmentId: string;
  target: number;
  actual: number;
  status: KpiStatus;
}> = [];

for (let i = 1; i <= 18; i++) {
  const dept = divisionBlueprint[i % divisionBlueprint.length].departments[i % 2];
  const status: KpiStatus = i <= 9 ? "On Track" : i <= 14 ? "At Risk" : "Overdue";
  const target = 85 + (i % 7);
  const actual = status === "On Track" ? target + (i % 5) : status === "At Risk" ? target - (3 + (i % 4)) : target - (8 + (i % 5));
  kpis.push({
    id: `KPI${String(i).padStart(3, "0")}`,
    name: `Enterprise KPI ${i}`,
    ownerDepartmentId: dept.id,
    target,
    actual,
    status,
  });
}

const processes: Array<{
  id: string;
  name: string;
  departmentOwnerId: string;
  departmentOwner: string;
  linkedKpiId: string;
  processLevel: "L1" | "L2" | "L3";
}> = [];

const processActivities: Array<{
  id: string;
  processId: string;
  processName: string;
  activityName: string;
  assignedPositionId: string;
  assignedPosition: string;
  frequency: Frequency;
  durationHours: number;
  workloadHoursMonthly: number;
  requiredHc: number;
}> = [];

for (let i = 1; i <= 24; i++) {
  const deptRef = divisionBlueprint[(i - 1) % divisionBlueprint.length].departments[(i - 1) % 2];
  const processId = `PRC${String(i).padStart(3, "0")}`;
  processes.push({
    id: processId,
    name: `${deptRef.name} Process ${i}`,
    departmentOwnerId: deptRef.id,
    departmentOwner: deptRef.name,
    linkedKpiId: kpis[(i - 1) % kpis.length].id,
    processLevel: i % 3 === 0 ? "L3" : i % 2 === 0 ? "L2" : "L1",
  });

  const deptPositions = positions.filter((p) => p.departmentId === deptRef.id);
  const activityCount = 5 + (i % 5);
  for (let a = 1; a <= activityCount; a++) {
    const freq: Frequency = a % 3 === 0 ? "Monthly" : a % 2 === 0 ? "Weekly" : "Daily";
    const durationHours = 1.5 + ((i + a) % 6) * 0.75;
    const workloadHoursMonthly = Math.round(frequencyPerMonth(freq) * durationHours * 10) / 10;
    const requiredHc = Math.round((workloadHoursMonthly / MONTHLY_HOURS) * 100) / 100;
    const assignedPosition = deptPositions[(a - 1) % deptPositions.length];
    processActivities.push({
      id: `ACT${String(processActivities.length + 1).padStart(4, "0")}`,
      processId,
      processName: `${deptRef.name} Process ${i}`,
      activityName: `Activity ${a} - ${deptRef.name}`,
      assignedPositionId: assignedPosition.id,
      assignedPosition: assignedPosition.positionName,
      frequency: freq,
      durationHours,
      workloadHoursMonthly,
      requiredHc,
    });
  }
}

const workloadByPosition = positions.map((position) => {
  const activities = processActivities.filter((a) => a.assignedPositionId === position.id);
  const totalWorkloadHours = Math.round(activities.reduce((sum, a) => sum + a.workloadHoursMonthly, 0) * 10) / 10;
  const requiredHc = Math.round((totalWorkloadHours / MONTHLY_HOURS) * 100) / 100;
  const currentHc = position.currentFilledHc;
  const gap = Math.round((currentHc - requiredHc) * 100) / 100;
  const staffingStatus = gap < -0.3 ? "Understaffed" : gap > 0.5 ? "Overstaffed" : "Balanced";
  return {
    positionId: position.id,
    positionName: position.positionName,
    departmentId: position.departmentId,
    department: position.department,
    totalWorkloadHours,
    requiredHc,
    currentHc,
    gap,
    staffingStatus,
  };
});

const employeeActivityAssignments = employees.map((employee, idx) => {
  const ownedActivities = processActivities.filter((a) => a.assignedPositionId === employee.assignedPositionId);
  const limit = Math.min(ownedActivities.length, 2 + (idx % 3));
  const assignedActivities = ownedActivities.slice(0, limit).map((a) => a.id);
  const assignedWorkloadHours = Math.round(
    ownedActivities.slice(0, limit).reduce((sum, a) => sum + a.workloadHoursMonthly, 0) * 10,
  ) / 10;
  const utilizationPct = Math.round((assignedWorkloadHours / MONTHLY_HOURS) * 100);
  return {
    employeeId: employee.id,
    employeeName: employee.name,
    assignedActivities,
    assignedWorkloadHours,
    utilizationPct,
  };
});

const costPerActivity = processActivities.map((activity) => {
  const pos = positions.find((p) => p.id === activity.assignedPositionId);
  const hourly = pos ? pos.totalMonthlyCostPerHead / MONTHLY_HOURS : 0;
  return {
    activityId: activity.id,
    processId: activity.processId,
    assignedPositionId: activity.assignedPositionId,
    costMonthly: Math.round(activity.workloadHoursMonthly * hourly),
  };
});

const costPerProcess = processes.map((process) => {
  const total = costPerActivity
    .filter((a) => a.processId === process.id)
    .reduce((sum, a) => sum + a.costMonthly, 0);
  return {
    processId: process.id,
    processName: process.name,
    monthlyCost: total,
    annualCost: total * 12,
  };
});

const departmentFinancials = divisionBlueprint.flatMap((d) =>
  d.departments.map((dept) => {
    const deptEmployees = employees.filter((e) => e.departmentId === dept.id);
    const monthlyWorkforceCost = deptEmployees.reduce((sum, e) => sum + e.salaryMonthly, 0);
    return {
      departmentId: dept.id,
      department: dept.name,
      divisionId: d.id,
      division: d.name,
      employeeCount: deptEmployees.length,
      monthlyWorkforceCost,
      annualWorkforceCost: monthlyWorkforceCost * 12,
    };
  }),
);

const positionFinancials = positions.map((position) => ({
  positionId: position.id,
  positionName: position.positionName,
  departmentId: position.departmentId,
  currentFilledHc: position.currentFilledHc,
  monthlyCostTotal: position.currentFilledHc * position.totalMonthlyCostPerHead,
  annualCostTotal: position.currentFilledHc * position.annualCostPerHead,
}));

const organizationFinancials = {
  monthlySalary: employees.reduce((sum, e) => sum + e.salaryMonthly, 0),
  annualEmployeeCost: employees.reduce((sum, e) => sum + e.annualCost, 0),
  totalPositionMonthlyCost: positionFinancials.reduce((sum, p) => sum + p.monthlyCostTotal, 0),
  totalDepartmentMonthlyCost: departmentFinancials.reduce((sum, d) => sum + d.monthlyWorkforceCost, 0),
};

const scenarios = [
  {
    id: "SCN001",
    name: "Terminal Expansion",
    changes: {
      newPositions: ["POS-NEW-TERM-01", "POS-NEW-TERM-02", "POS-NEW-TERM-03"],
      removedPositions: ["POS092"],
      headcountDelta: 18,
      activityAdjustments: ["Increase Daily gate handling", "Add weekly safety reconciliation"],
      processChanges: ["PRC005", "PRC006", "PRC017"],
    },
    impact: {
      workforceChange: 18,
      monthlyCostImpact: 248000,
      annualCostImpact: 2976000,
      workloadRedistribution: "Shift +12% workload to Supply Chain & Logistics",
      kpiDelta: { onTrack: 1, atRisk: 2, overdue: -1 },
    },
  },
  {
    id: "SCN002",
    name: "Cost Optimization",
    changes: {
      newPositions: ["POS-NEW-FIN-OPT-01"],
      removedPositions: ["POS045", "POS064"],
      headcountDelta: -11,
      activityAdjustments: ["Reduce manual weekly reporting", "Consolidate monthly controls"],
      processChanges: ["PRC009", "PRC010", "PRC011"],
    },
    impact: {
      workforceChange: -11,
      monthlyCostImpact: -172000,
      annualCostImpact: -2064000,
      workloadRedistribution: "Move repetitive work to shared services",
      kpiDelta: { onTrack: 0, atRisk: -2, overdue: 1 },
    },
  },
  {
    id: "SCN003",
    name: "Automation Initiative",
    changes: {
      newPositions: ["POS-NEW-AI-01", "POS-NEW-AI-02"],
      removedPositions: [],
      headcountDelta: 7,
      activityAdjustments: ["Convert 14 weekly tasks to automated jobs", "Lower duration on 22 activities"],
      processChanges: ["PRC013", "PRC014", "PRC018", "PRC021"],
    },
    impact: {
      workforceChange: 7,
      monthlyCostImpact: 93000,
      annualCostImpact: 1116000,
      workloadRedistribution: "Reduce manual workload in Technology & Digital by 19%",
      kpiDelta: { onTrack: 3, atRisk: -1, overdue: -2 },
    },
  },
  {
    id: "SCN004",
    name: "Customer Growth Push",
    changes: {
      newPositions: ["POS-NEW-SALES-01", "POS-NEW-SALES-02", "POS-NEW-SALES-03", "POS-NEW-SALES-04"],
      removedPositions: [],
      headcountDelta: 14,
      activityAdjustments: ["Increase daily lead qualification", "Add weekly customer expansion review"],
      processChanges: ["PRC003", "PRC004", "PRC022"],
    },
    impact: {
      workforceChange: 14,
      monthlyCostImpact: 161000,
      annualCostImpact: 1932000,
      workloadRedistribution: "Commercial & Sales utilization up by 16%",
      kpiDelta: { onTrack: 2, atRisk: 1, overdue: -1 },
    },
  },
];

export const enterpriseDataset = {
  company: {
    id: "ORG001",
    name: "Global Corp",
    ceoPositionId: "POS000",
    ceoEmployeeId: "EMP0001",
  },
  divisions: divisionBlueprint.map((d) => ({
    id: d.id,
    name: d.name,
    departmentIds: d.departments.map((x) => x.id),
  })),
  departments: divisionBlueprint.flatMap((d) =>
    d.departments.map((dept) => ({
      ...dept,
      divisionId: d.id,
      division: d.name,
    })),
  ),
  positions,
  employees,
  processes,
  activities: processActivities,
  kpis,
  workload: {
    monthlyHoursStandard: MONTHLY_HOURS,
    byPosition: workloadByPosition,
    byEmployee: employeeActivityAssignments,
  },
  financials: {
    byEmployee: employees.map((e) => ({
      employeeId: e.id,
      employeeName: e.name,
      monthlySalary: e.salaryMonthly,
      annualCost: e.annualCost,
      positionId: e.assignedPositionId,
    })),
    byPosition: positionFinancials,
    byDepartment: departmentFinancials,
    byActivity: costPerActivity,
    byProcess: costPerProcess,
    organization: organizationFinancials,
  },
  scenarios,
  uiReady: {
    tableRows: {
      positions: positions.length,
      employees: employees.length,
      activities: processActivities.length,
    },
    chartSeries: {
      departmentCost: departmentFinancials.map((d) => ({
        department: d.department,
        monthlyCost: d.monthlyWorkforceCost,
      })),
      workloadHeatmap: workloadByPosition.map((w) => ({
        department: w.department,
        position: w.positionName,
        utilization: Math.round((w.totalWorkloadHours / MONTHLY_HOURS) * 100),
      })),
      kpiStatusMix: [
        { status: "On Track", count: kpis.filter((k) => k.status === "On Track").length },
        { status: "At Risk", count: kpis.filter((k) => k.status === "At Risk").length },
        { status: "Overdue", count: kpis.filter((k) => k.status === "Overdue").length },
      ],
    },
    tree: {
      company: "ORG001",
      divisions: divisionBlueprint.map((d) => ({
        id: d.id,
        departments: d.departments.map((x) => x.id),
      })),
    },
  },
};

