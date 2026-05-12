# OMS Product Specification

## 1. Ringkasan Produk

**Organization Management System (OMS)**, diberi label produk **OM+**, adalah aplikasi untuk membantu manajemen melihat dan merancang struktur organisasi secara terhubung dengan proses bisnis, workload aktivitas, kapasitas karyawan, biaya tenaga kerja, skenario perubahan organisasi, dan rekomendasi AI.

Produk ini bukan hanya org chart. Nilai utamanya adalah menghubungkan pertanyaan manajemen:

- Apakah struktur organisasi sesuai dengan beban kerja aktual?
- Proses mana yang bottleneck dan siapa owner-nya?
- Jabatan mana yang kosong, overload, underutilized, atau mahal?
- Apa dampak biaya dan KPI jika organisasi diubah?
- Posisi baru apa yang perlu dibuat berdasarkan data lintas modul?

## 2. Target Pengguna

- **Executive / Board / Direktur**: melihat health organisasi, biaya, KPI, risiko, dan action center.
- **Human Capital / Organization Development**: mengelola tree organisasi, jabatan, karyawan, job grade, reporting line, dan headcount gap.
- **Business Process Owner**: melihat process chain, process directory, activity breakdown, SLA, KPI, owner, dan dependency.
- **Workforce Planner**: menghitung workload, required HC, assigned HC, utilization, dan assignment.
- **Finance / Cost Controller**: memonitor biaya tenaga kerja per organisasi, posisi, employee, proses, dan skenario.
- **Transformation / Strategy Team**: membuat dan membandingkan skenario struktur organisasi.
- **AI / Analytics User**: meninjau insight, rekomendasi posisi, evidence, dan proyeksi impact.

## 3. Tujuan Produk

1. Menyediakan single workspace untuk organisasi, proses, workload, biaya, scenario planning, dan AI recommendation.
2. Membuat hubungan antar-domain eksplisit: posisi -> employee -> activity -> process -> KPI -> cost.
3. Membantu pengambilan keputusan organisasi berbasis data, bukan hanya struktur statis.
4. Mempercepat proses desain posisi baru dengan bukti workload, biaya, proses, dan KPI.
5. Memberikan simulasi dampak sebelum perubahan organisasi diajukan atau disetujui.

## 4. Non-Goal Saat Ini

Berdasarkan kode yang ada, hal berikut belum menjadi kapabilitas nyata:

- Backend persistence.
- API integration.
- Login, role-based access control, dan audit user sebenarnya.
- Approval workflow server-side.
- Import file yang benar-benar memproses file.
- AI model live. AI saat ini berbasis mock data dan state lokal.
- Database enterprise HRIS/ERP.

## 5. Modul Produk

### 5.1 Executive OMS Dashboard

Route: `/`

Dashboard menjadi landing page eksekutif. Isinya:

- KPI coverage.
- Jumlah business process.
- Jumlah aktivitas workload.
- Average workforce utilization.
- Overloaded employees.
- Total workforce cost.
- KPI -> process coverage.
- Process flow snapshot.
- Workload distribution.
- Cost by division/process.
- AI insight panel.
- Action center.
- Organization snapshot.

Dashboard mengarahkan user ke modul detail melalui kartu dan action button.

### 5.2 Organization Management

Routes:

- `/organization/tree`
- `/organization/positions`
- `/organization/positions/create`
- `/organization/positions/[id]`
- `/organization/positions/[id]/edit`
- `/organization/employees`
- `/organization/employees/[id]`

Kapabilitas:

- Melihat company hierarchy PT Pelabuhan Indonesia (Persero).
- Expand/collapse company, directorate, department, position, dan employee.
- Overlay cost atau utilization pada tree.
- Directory posisi dengan filter department, grade, status, search, sort.
- Detail posisi: incumbent, activity, workload per person, cost, business process, KPI.
- Create/edit position sebagai form frontend dengan submit/draft dialog.
- Employee directory dengan filter dan slide detail panel.
- Employee full profile dengan posisi, manager, compensation, workload, KPI, dan link ke modul terkait.

### 5.3 Business Process Management

Routes:

- `/business-process/process-chain`
- `/business-process/process-directory`
- `/business-process/process-directory/[processId]`

Kapabilitas:

- Melihat process chain end-to-end.
- Switch chain/grid view.
- Filter proses berdasarkan search, department, category, status.
- Melihat orphan process yang tidak masuk chain.
- Process directory tabular dengan expand row.
- Detail process mencakup profile, chain context, activities, people, linked KPI, workload summary, cost, dan action dialog.
- Process I/O mapping, dependencies, dan KPI mapping tersedia di data layer.

### 5.4 Workload & Activity Management

Routes:

- `/workload-activity/activity-directory`
- `/workload-activity/activity-directory/[activityId]`
- `/workload-activity/utilization-dashboard`
- `/workload-activity/assignment-management`
- `/workload-activity/workload-engine` redirect ke assignment management.

Kapabilitas:

- Activity directory dari process activity yang sudah diturunkan menjadi workload activity.
- Filter activity berdasarkan department, process, KPI, responsible position, staffing status, dan search.
- Grouping activity per business process.
- CSV export dari browser.
- Dialog create, edit, duplicate, delete, recalculate, sync, bulk upload, send HC request.
- Detail activity: profile, linked process, people assigned, calculation inputs, workload output, cost, assignment/capacity, KPI impact, system links, audit/change history.
- Utilization dashboard untuk melihat distribusi workload per department, role, employee, status.
- Assignment management berbentuk kanban/status capacity untuk mengelola staffing aktivitas.

### 5.5 Financial & Cost Management

Routes:

- `/financial/overview`
- `/financial/breakdown`

Kapabilitas:

- Cost overview dengan konfigurasi include vacant/contract/overtime dan komponen salary/allowance/benefit/bonus.
- Aggregation mode: organization, role, process.
- Cost trend historical + forecast.
- Cost vs utilization analysis.
- Cost density heatmap department x role level.
- Overcost detection engine.
- Scenario impact.
- Cost composition.
- AI financial insights.
- Cost breakdown granular dengan Org, Position, Employee view.
- Drilldown cost per department/level/position/employee.

### 5.6 Scenario Planning

Routes:

- `/scenario/directory`
- `/scenario/builder`
- `/scenario/comparison`
- `/scenario` redirect ke directory.

Kapabilitas:

- Scenario directory: search, create draft, duplicate, delete, submit approval.
- Scenario builder: edit struktur department dan position secara lokal, ubah asumsi hiring speed, attrition, growth, salary, benefits, bonus.
- Calculation engine menghitung delta headcount, cost, utilization, KPI.
- Scenario status: Balanced, At Risk, Critical.
- Scenario comparison: bandingkan dua scenario, lihat metric chart, radar, recommendation, structure delta, dan submit/rebase.

### 5.7 AI Module

Routes:

- `/ai/insights`
- `/ai/job-position`
- `/ai/job-position/[positionId]`
- `/ai` redirect ke insights.

Kapabilitas:

- AI organizational insights dengan filter department, category, severity, scenario, horizon, search.
- Scope analysis: workload, position gap, process, activity, financial, scenario.
- Insight detail drawer dengan evidence, impact projection, recommendation, source modules.
- Aksi dari insight ke generated job position, related process, activity detail, dan scenario draft.
- AI Job Position module untuk generate, review, simulate, submit, export, dan edit posisi rekomendasi AI.
- Generated position berisi job family, job level, reporting line, responsibilities, deliverables, linked process/KPI/activity, workload analysis, cost estimate, competency requirements, impact analysis, implementation plan, risk if not created.

## 6. Business Rules Utama

### 6.1 Workload Calculation

Formula yang dipakai di data dan form activity:

```text
Base Workload Hours = Frequency x Duration
Adjusted Workload = Base x Complexity x Quality x Seasonal x (1 + Rework)
Effective Capacity per FTE = Standard Monthly Capacity x Productivity Factor
Required HC = Adjusted Workload / Effective Capacity per FTE
Utilization = Adjusted Workload / Total Assigned Effective Capacity
```

Konstanta utama:

- Standard monthly capacity: `160` jam.
- Productivity factor: `0.85`.
- Effective capacity per employee: `136` jam/bulan.
- Complexity multiplier: Low `1.0`, Medium `1.25`, High `1.5`, Critical `1.75`.

### 6.2 Staffing Status

Status activity/workload ditentukan dari required HC, assigned HC, dan utilization:

- `Understaffed`: required HC lebih besar dari assigned HC dan utilization > 100%.
- `Overloaded`: utilization > 110%.
- `Balanced`: utilization 90%-110%.
- `Underutilized`: utilization 70%-90%.
- `Significantly Underutilized`: utilization < 70%.

### 6.3 Scenario Status

Scenario builder menandai scenario:

- `Critical`: utilization terlalu tinggi atau KPI terlalu rendah.
- `At Risk`: utilization tinggi, KPI menurun, atau cost delta besar.
- `Balanced`: masih dalam batas sehat.

## 7. Data Baseline Produk

Baseline yang muncul di `lib/om-metrics.ts`:

- Total employees: 568.
- Total positions: 642.
- Filled positions: 568.
- Vacant positions: 74.
- Departments: 12.
- Business processes: 24 baseline metric, dengan 22 process records aktif di `processList`.
- Activities: 180 baseline metric, dengan 110 generated activity rows dari 22 process x 5 template.
- Average utilization: 91.6%.
- Total monthly workforce cost: Rp 24.8B.
- Active scenarios: 12 baseline metric, dengan 22 scenario records di `scenarios`.
- AI insights baseline metric: 24, dengan 12 concrete AI insight records di `ai-mock-data.ts`.

## 8. Prinsip Produk

1. **Traceability**: setiap rekomendasi harus bisa dilacak ke process, activity, workload, KPI, dan cost.
2. **Decision before execution**: perubahan organisasi disimulasikan dulu sebelum disubmit.
3. **Executive-first**: dashboard menampilkan sinyal utama dan action center.
4. **Cross-module navigation**: user dapat berpindah dari dashboard ke process, dari activity ke employee/position, dari AI ke scenario.
5. **Evidence-based AI**: AI tidak hanya memberi saran, tetapi membawa evidence dan impact projection.

## 9. Acceptance Criteria Produk

Produk dianggap siap minimum bila:

- Struktur organisasi dapat dilihat dari company sampai employee.
- Position dan employee directory dapat difilter dan dibuka detailnya.
- Business process dapat dilihat sebagai chain dan directory.
- Activity memiliki formula workload transparan.
- Cost dapat dianalisis per org, position, employee, dan process.
- Scenario dapat menghitung impact headcount, cost, utilization, dan KPI.
- AI insight dapat menjelaskan evidence dan menghasilkan rekomendasi posisi.
- Semua aksi perubahan penting memiliki persistence, approval, audit trail, dan permission yang jelas.
