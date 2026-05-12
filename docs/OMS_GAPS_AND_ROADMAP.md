# OMS Gaps and Roadmap

## 1. Status Singkat

OMS saat ini sudah kuat sebagai interactive product prototype. Struktur fitur luas, data saling terhubung, dan UI sudah menunjukkan arah produk enterprise. Namun untuk production, gap terbesar adalah persistence, source of truth, auth, approval, dan integrasi data.

## 2. Gap Produk

### 2.1 Persistence

Masalah:

- Create/edit/delete scenario hanya mengubah state lokal.
- Create/edit position tidak menulis ke database.
- AI generated position yang dibuat user tidak persisted.
- Assignment changes tidak persisted.

Dampak:

- User bisa melihat flow, tetapi belum bisa menjalankan proses bisnis nyata.
- Refresh halaman menghapus perubahan lokal.

Rekomendasi:

- Tambah backend untuk scenario, position proposal, activity assignment, dan approval event.
- Gunakan optimistic UI hanya setelah API contract jelas.

### 2.2 Approval Workflow

Masalah:

- Banyak tombol submit/approval hanya dialog, toast, atau alert.
- Tidak ada status transition server-side.
- Tidak ada reviewer, SLA, comments, audit event.

Dampak:

- Produk belum bisa dipakai untuk governance organisasi formal.

Rekomendasi:

- Definisikan workflow entity: request, requester, approver, status, comment, submittedAt, approvedAt, rejectedAt.
- Terapkan workflow untuk position proposal, scenario submission, HC request, assignment change, dan process change.

### 2.3 Authentication dan Authorization

Masalah:

- Tidak ditemukan login, user session, role, permission, atau middleware.

Dampak:

- Semua user secara konsep dapat melihat dan menekan semua action.
- Data compensation dan org change tidak aman untuk production.

Rekomendasi:

- Tambah role: Executive, HC Admin, Process Owner, Finance, Workforce Planner, Viewer.
- Batasi compensation, edit org, submit approval, dan AI action berdasarkan role.

### 2.4 Canonical Data Model

Masalah:

- Ada beberapa sumber data paralel:
  - `lib/oms-data.ts`
  - `lib/om-metrics.ts`
  - `lib/ai-mock-data.ts`
  - `data/omData.ts`
  - `lib/enterprise-dataset.ts`
- Beberapa angka baseline metric berbeda dari jumlah concrete record.

Dampak:

- Sulit memastikan mana data source resmi.
- Risiko inkonsistensi saat fitur bertambah.

Rekomendasi:

- Pilih satu canonical schema.
- Pecah domain data menjadi `organization`, `position`, `employee`, `process`, `activity`, `cost`, `scenario`, `ai`.
- Jadikan metric sebagai derived layer, bukan mixed source.

### 2.5 AI Live Capability

Masalah:

- AI insight dan generated position berasal dari mock data.
- AI generation membuat objek baru dari template posisi pertama.
- Tidak ada model call, retrieval, confidence calculation live, atau audit prompt.

Dampak:

- Produk tampak AI-powered, tetapi belum benar-benar menganalisis data runtime.

Rekomendasi:

- Buat AI service yang menerima snapshot data: org, activity, process, KPI, cost, scenario.
- Simpan evidence dan reasoning.
- Simpan generated recommendation sebagai reviewable object.
- Tampilkan source data dan confidence secara konsisten.

### 2.6 Import/Export

Masalah:

- Beberapa tombol import/export masih placeholder.
- CSV export activity directory ada, tetapi export lain belum jelas.
- Bulk upload route/form belum memproses file nyata.

Dampak:

- Migrasi data enterprise belum bisa dilakukan.

Rekomendasi:

- Definisikan template upload position, employee, process, activity.
- Tambah validation report untuk import.
- Export ke XLSX/PDF untuk executive report, process register, workload report, dan position proposal.

### 2.7 Audit Trail

Masalah:

- Ada UI audit/change history, tetapi bukan event log asli.

Dampak:

- Tidak bisa dipakai untuk compliance.

Rekomendasi:

- Tambah audit events untuk create/update/delete/submit/approve/reject/simulate/export.
- Simpan actor, timestamp, previous value, next value, reason.

## 3. Gap Teknis

### 3.1 Ukuran Data Layer

`lib/oms-data.ts` terlalu besar dan multi-domain. File ini berisi data, business logic, generated employees, workload derivation, navigation, dan export lain.

Rekomendasi:

- Pecah menjadi:
  - `lib/data/organization.ts`
  - `lib/data/positions.ts`
  - `lib/data/employees.ts`
  - `lib/data/processes.ts`
  - `lib/data/workload.ts`
  - `lib/data/cost.ts`
  - `lib/data/scenarios.ts`
  - `lib/data/navigation.ts`
  - `lib/domain/workload-calculation.ts`
  - `lib/domain/org-rollup.ts`

### 3.2 Client-Side State

Mayoritas halaman client component. Ini wajar untuk prototype, tetapi production perlu pemisahan:

- server data loading.
- client interactivity.
- API mutation.
- cache invalidation.

### 3.3 Route and Data Consistency

Beberapa route adalah redirect alias. Ini baik untuk compatibility, tetapi perlu didokumentasikan:

- `/scenario` -> `/scenario/directory`
- `/ai` -> `/ai/insights`
- `/position/[id]` -> `/organization/positions/[id]`
- `/workload-activity/workload-engine` -> `/workload-activity/assignment-management`

### 3.4 Validation

Saat ini ada validation helper di `om-metrics` dan `data/omData`, tetapi belum menjadi test suite.

Rekomendasi:

- Tambah unit test untuk:
  - org tree totals.
  - position fill/gap.
  - workload formula.
  - process KPI mapping.
  - scenario calculation.
  - AI generated position required fields.

## 4. Roadmap Prioritas

### Phase 1: Stabilkan Prototype sebagai Product Demo

Tujuan: demo konsisten, data tidak kontradiktif, dan dokumentasi jelas.

Pekerjaan:

- Rapikan canonical source of truth.
- Samakan baseline metric dengan record aktual atau beri label eksplisit.
- Hilangkan placeholder alert yang membingungkan.
- Tambah README dan command docs.
- Tambah smoke checks untuk route utama.

### Phase 2: Persistence untuk Workflow Kritis

Tujuan: user bisa menyimpan kerja.

Pekerjaan:

- Database schema untuk organization, position, employee, process, activity, KPI, scenario, AI recommendation.
- API untuk scenario save/submit.
- API untuk position proposal.
- API untuk activity assignment.
- Audit event minimum.

### Phase 3: Governance dan Permission

Tujuan: OMS bisa dipakai oleh role berbeda.

Pekerjaan:

- Authentication.
- Role-based access.
- Approval workflow.
- Commenting dan attachment.
- Status transition.
- Notification hooks.

### Phase 4: Enterprise Data Integration

Tujuan: OMS memakai data nyata.

Pekerjaan:

- HRIS employee/position sync.
- Payroll/finance cost sync.
- BPM/process repository sync.
- Import validation reports.
- Data reconciliation dashboard.

### Phase 5: AI Productionization

Tujuan: AI menjadi decision support yang auditable.

Pekerjaan:

- Live AI analysis service.
- Evidence retrieval.
- Prompt/version audit.
- Recommendation lifecycle: draft, reviewed, accepted, rejected, simulated, implemented.
- Human approval before org changes.

## 5. Risiko Produk Bila Langsung Diproduksikan

- User mengira perubahan sudah tersimpan padahal hanya state lokal.
- Compensation data terbuka tanpa permission.
- AI recommendation dianggap benar tanpa live evidence.
- Scenario calculation dipakai untuk keputusan finansial tanpa validasi finance.
- Multiple data sources membuat angka executive dashboard dipertanyakan.

## 6. Quick Wins

1. Tambah label "Demo data" atau "Prototype mode" di environment non-production.
2. Buat canonical data decision.
3. Tambah README developer.
4. Tambah tests untuk workload formula.
5. Ubah placeholder action menjadi disabled dengan tooltip atau modal "Coming soon".
6. Tambah persistence minimal untuk scenario builder.
7. Tambah export PDF/XLSX untuk generated position proposal.

## 7. Product Readiness Score

| Area | Score | Catatan |
|---|---:|---|
| UX prototype | 8/10 | Modul luas dan flow kuat. |
| Domain coverage | 8/10 | Org, process, workload, cost, scenario, AI sudah terhubung. |
| Data consistency | 5/10 | Banyak sumber data dan beberapa angka baseline berbeda. |
| Production architecture | 3/10 | Belum ada backend, auth, persistence. |
| Governance readiness | 3/10 | Approval masih UI-level. |
| AI readiness | 4/10 | AI UX kuat, engine masih mock/template. |
| Documentation before this work | 1/10 | Tidak ada README/docs lokal yang ditemukan. |
