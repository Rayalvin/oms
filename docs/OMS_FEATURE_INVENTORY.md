# OMS Feature Inventory

## 1. Navigasi Utama

Menu sidebar berasal dari `navModules`:

| Modul | Submodul | Route |
|---|---|---|
| Organization Management | Organization Tree | `/organization/tree` |
| Organization Management | Position Directory | `/organization/positions` |
| Organization Management | Employee Directory | `/organization/employees` |
| Business Process Management | Process Chain | `/business-process/process-chain` |
| Business Process Management | Process Directory | `/business-process/process-directory` |
| Workload & Activity Management | Activity Directory | `/workload-activity/activity-directory` |
| Workload & Activity Management | Utilization Dashboard | `/workload-activity/utilization-dashboard` |
| Workload & Activity Management | Alignment/Assignment Management | `/workload-activity/assignment-management` |
| Scenario Planning | Scenario Directory | `/scenario/directory` |
| Scenario Planning | Scenario Builder | `/scenario/builder` |
| Scenario Planning | Scenario Comparison | `/scenario/comparison` |
| Financial | Cost Overview | `/financial/overview` |
| Financial | Cost Breakdown | `/financial/breakdown` |
| AI Module | AI Insights | `/ai/insights` |
| AI Module | AI Job Position | `/ai/job-position` |

## 2. Dashboard

Route: `/`

Fitur:

- Executive KPI cards.
- KPI coverage visualization.
- Process flow snapshot.
- Workload distribution chart/list.
- Cost by division and cost per process.
- Process efficiency insights.
- AI insights panel.
- Action center.
- Organization snapshot.
- Signature flow linking KPI, process, activities, and employee.

Data:

- `unifiedProcessKPIMaps`
- `unifiedKpiList`
- `unifiedEmployeesAll`
- `unifiedCostAnalysis`
- `unifiedProcessList`
- `unifiedWorkloadActivities`
- `unifiedAIInsights`
- `baselineCompanyMetrics`

## 3. Organization Tree

Route: `/organization/tree`

Fitur:

- Company hierarchy PT Pelabuhan Indonesia (Persero).
- Directorates, departments, positions, employees.
- Expand all/collapse all.
- Search across directorate, department, position, employee.
- Overlay mode: default, cost, utilization.
- Link ke position detail dan employee detail.

Data:

- `organizationUnits`
- `unifiedPositions`
- `unifiedEmployeesAll`
- `buildOrganizationTree`

## 4. Position Directory

Route: `/organization/positions`

Fitur:

- KPI strip: total positions, filled positions, open positions, fill rate.
- Search by title/department.
- Filter department, grade, status.
- Sort title, department, grade.
- Table position: filled, planned, gap, salary range, reporting/head, status.
- Actions: view, edit, delete dialog.
- Link create position dan bulk upload route.
- Department distribution chart.

Data:

- `positions`
- `departments`

## 5. Position Detail

Route: `/organization/positions/[id]`

Fitur:

- Detail posisi.
- Incumbent employees.
- Related activities.
- Workload per person.
- Cost summary.
- Business process and KPI linkage.
- Actions: edit position, simulate in scenario.
- Links ke employee, assignment management, scenario.

Data:

- `positions`
- `employees`
- `activityList`
- `processList`
- helper dari `lib/oms-activities.ts`

## 6. Position Create/Edit

Routes:

- `/organization/positions/create`
- `/organization/positions/[id]/edit`

Fitur:

- Form jabatan: title, department, level, grade, salary range, competencies, description.
- Draft/submit approval style interaction.
- Dialog konfirmasi submit.
- Edit form untuk existing position.

Catatan:

- Saat ini perubahan tidak persisted ke data source.

## 7. Employee Directory dan Detail

Routes:

- `/organization/employees`
- `/organization/employees/[id]`

Fitur directory:

- Search.
- Filter department, grade, status.
- KPI/summary cards.
- Employee table/list.
- Slide panel detail.
- Contact, position info, compensation, KPI, workload trend, timeline.

Fitur detail:

- Full employee profile.
- Manager/position link.
- Compensation dan workload.
- Link ke position, utilization dashboard, business process.

Data:

- `employees`
- `departments`
- `positions`
- workload/activity helpers.

## 8. Process Chain

Route: `/business-process/process-chain`

Fitur:

- Chain view dan grid view.
- Filter search, department, category, status.
- Process chains:
  - Strategic-Operational.
  - Talent Lifecycle.
  - Product Pipeline.
  - Marketing-to-Sales.
- Orphan process handling.
- Link ke process directory/detail.

Data:

- `unifiedProcessList`
- `unifiedProcessChains`
- `unifiedActivityList`

## 9. Process Directory

Route: `/business-process/process-directory`

Fitur:

- Search by process name, code, owner, department.
- Filter category, department, status, bottleneck only.
- Sort code/name/dept/owner/KPI/SLA/actual/efficiency.
- Expand rows untuk activity, assigned employees, workload.
- Import/export buttons.
- Create process placeholder.
- Link ke process detail.

Data:

- `unifiedProcessList`
- `unifiedActivityList`
- `unifiedDepartments`

## 10. Process Detail

Route: `/business-process/process-directory/[processId]`

Fitur:

- Process profile.
- Process chain context.
- Activities.
- People and positions involved.
- Linked KPI.
- Process workload summary.
- Process cost.
- Dialog actions: edit, add activity, link KPI, simulate, export.
- Links ke activity detail, position detail, employee detail, financial breakdown.

Data:

- `unifiedProcessList`
- `unifiedWorkloadActivities`
- `unifiedEmployeesAll`
- `unifiedPositions`
- `unifiedProcessKPIMaps`
- `WORKLOAD_CONSTANTS`

## 11. Activity Directory

Route: `/workload-activity/activity-directory`

Fitur:

- Search by activity/process/code.
- Filter department, process, KPI, position, staffing status.
- Group activity by process.
- Create activity dialog.
- Bulk upload dialog.
- Sync from BPM dialog.
- Export CSV.
- Edit/duplicate/delete/recalculate/send HC request dialogs.
- Link to activity detail.

Data:

- `unifiedWorkloadActivities`
- `unifiedProcessList`
- `unifiedDepartments`
- `unifiedKpiList`

## 12. Activity Detail

Route: `/workload-activity/activity-directory/[activityId]`

Fitur:

- Activity profile.
- Linked business process.
- People assigned.
- Workload calculation inputs.
- Workload output.
- Activity cost.
- Assignment and capacity analysis.
- KPI impact.
- System links.
- Audit and change history.
- Dialogs for edit, assign, recalc, scenario, export, formula, breakdown.

Data:

- `workloadActivities`
- `processList`
- `employeesAll`
- `positions`
- cost/workload constants.

## 13. Utilization Dashboard

Route: `/workload-activity/utilization-dashboard`

Fitur:

- Department, role, status filters.
- Utilization distribution.
- Department workload heatmap.
- Role/employee utilization.
- Trend months Nov 25-Apr 26.
- Link to activity detail.

Data:

- `unifiedWorkloadByDepartment`
- `unifiedWorkloadByRole`
- `unifiedWorkloadHeatmap`
- `unifiedWorkloadActivities`

## 14. Assignment Management

Route: `/workload-activity/assignment-management`

Fitur:

- Kanban/status grouping untuk aktivitas.
- Filter search dan department.
- Employee capacity list.
- Assign/reassign UI.
- Create assignment dialog.
- Link ke activity detail.

Data:

- `unifiedWorkloadActivities`
- `unifiedEmployeesAll`
- `unifiedDepartments`

## 15. Cost Overview

Route: `/financial/overview`

Fitur:

- Cost configuration.
- Cost components toggle.
- Aggregation mode Org/Role/Process.
- Top cost entities.
- Cost trend analysis.
- Cost vs utilization scatter.
- Cost density heatmap.
- Overcost detection engine.
- Scenario impact.
- Cost composition chart.
- AI insights.
- Cost by department table.
- Employee detail table.

Data:

- `unifiedEmployeesAll`
- `unifiedDepartments`
- `unifiedPositions`
- `unifiedWorkloadActivities`
- `unifiedCostMonthlyTrend`
- `unifiedScenarios`

## 16. Cost Breakdown

Route: `/financial/breakdown`

Fitur:

- View mode: Org, Position, Employee.
- Filter organization, position, scenario.
- Expand/collapse org tree.
- Drilldown panel.
- Top earners.
- Planned vs actual cost.
- Active employee cost calculation.

Data:

- `unifiedEmployeesAll`
- `unifiedDepartments`
- `unifiedPositions`
- `unifiedScenarios`

## 17. Scenario Directory

Route: `/scenario/directory`

Fitur:

- Search scenario.
- Filter status/type/owner-like fields.
- Stats cards.
- Create scenario modal.
- Duplicate, delete, submit for approval.
- Link ke builder dan comparison.

Data:

- `unifiedScenarios`

## 18. Scenario Builder

Route: `/scenario/builder`

Fitur:

- Load scenario by query `id`.
- Editable department and position state.
- Create/edit/delete department.
- Create/edit/duplicate/delete position.
- Assumptions: hiring speed, attrition, growth, salary change, benefits, bonus.
- Calculated baseline vs scenario metrics.
- Scenario status.
- Charts: HC by department, cost, workload.
- Save/submit/reset as local UI actions.

Data:

- `unifiedDepartments`
- `unifiedPositions`
- `unifiedScenarios`
- `unifiedProcesses`

## 19. Scenario Comparison

Route: `/scenario/comparison`

Fitur:

- Select scenario A and B.
- Compare headcount, cost, utilization, KPI.
- Recommendation logic.
- Metric chart and radar data.
- Structure delta display.
- Submit recommended scenario.
- Rebase/create from selected scenario.

Data:

- `unifiedScenarios`
- `unifiedDepartments`

## 20. AI Insights

Route: `/ai/insights`

Fitur:

- AI filter panel.
- Analysis scope toggles.
- AI Detection Engine steps.
- Insight cards.
- Priority recommendations.
- Insight detail drawer.
- Generate position from insight.
- Send to scenario toast.
- Open related process/activity.

Data:

- `unifiedAIInsights`
- `unifiedAIDepartments`
- `unifiedAIScenarios`
- `unifiedAIGeneratedPositions`
- `unifiedProcessList`
- `unifiedWorkloadActivities`

## 21. AI Job Position

Routes:

- `/ai/job-position`
- `/ai/job-position/[positionId]`

Fitur:

- AI Position Generator form.
- Position library.
- Generated position card.
- Position detail drawer.
- Add to Organization confirmation.
- Scenario draft modal.
- Export modal.
- Link process/activity.
- Generated position detail page.

Data:

- `unifiedAIGeneratedPositions`
- `unifiedAIInsights`
- `unifiedAIScenarios`
- `unifiedProcessList`
- `unifiedWorkloadActivities`

## 22. Cross-Module Behaviors

- Dashboard action cards route to process, workload, financial, and org pages.
- Process detail links to activity, employee, position, and financial modules.
- Activity detail links to business process, employee, position, and financial breakdown.
- Position detail links to scenario simulation and assignment management.
- AI insight links to generated job position, process detail, activity detail, and scenario.
- Scenario comparison links back to builder and directory.
