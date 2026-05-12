# Product Specification OMS Pelindo untuk Portaverse

## 1. Product Framing

**Organization Management System (OMS)** adalah **Organization Change & Workforce Evidence Workbench** untuk Pelindo. OMS membantu HC, business owner, operations, finance, legal, dan executive membuat keputusan perubahan organisasi berbasis evidence.

OMS bukan HRIS replacement dan bukan legal org master. OMS adalah system of record untuk:

- proposal perubahan organisasi;
- scenario organisasi;
- workload evidence;
- manpower planning evidence;
- AI recommendation;
- approval trail;
- integration handoff setelah approval.

## 2. Problem Prioritas

1. **Governance organisasi HC**
   - Struktur organisasi, jabatan, dan perubahan formasi harus bisa diajukan, ditinjau, disetujui, dan diaudit dengan jelas.
2. **Workforce planning operasional pelabuhan**
   - Kebutuhan FTE harus dikaitkan dengan workload nyata, terutama untuk terminal petikemas dan marine/vessel service.
3. **Executive decision support**
   - Executive butuh visibility terhadap dampak organisasi, FTE, biaya, risiko, dan operational readiness.
4. **Portaverse talent extension**
   - Perubahan organisasi harus terhubung ke talent profile, competency, learning, career, performance, dan KPI context.

## 3. Target Pengguna

- HC Organization Design / Organization Development.
- HC Workforce Planning.
- Business Unit / Function Owner.
- Terminal Operations Owner.
- Marine/Vessel Service Owner.
- HRIS / Master Data Admin.
- Portaverse Talent Owner.
- Legal / Corporate Secretary.
- Finance / Budget Owner.
- Executive Sponsor / Approver.

## 4. Enterprise Scope

OMS harus mampu merepresentasikan:

- Holding.
- Subholding.
- Anak Perusahaan.
- Afiliasi/Terafiliasi.
- Kantor Pusat.
- Regional/Sub Regional.
- Cabang/Terminal/Pelabuhan.
- Direktorat.
- Group.
- Divisi.
- Departemen.
- Unit Pendukung.
- Jabatan.
- Position variant.
- Incumbent assignment.

## 5. MVP dan Pilot Scope

Pilot awal mencakup:

- Kantor Pusat.
- Satu terminal petikemas yang data-ready dan punya pain point nyata.
- Marine/vessel service sebagai fungsi operasional kritis.

MVP capabilities:

1. Enterprise organization baseline viewer.
2. Organization change proposal.
3. Workload evidence corporate bulanan.
4. Workload evidence operational harian/shift.
5. Manpower planning.
6. Scenario comparison.
7. AI recommendation.
8. Risk-based approval.
9. Executive dashboard sebagai reporting layer.

Out of scope MVP:

- Rollout seluruh anak perusahaan.
- Full automation update ke HRIS/master legal org.
- Seluruh fungsi operasional pelabuhan.
- Full competency/learning/performance optimization.
- Cost simulation enterprise yang terlalu detail.

## 6. Core Modules

### 6.1 Enterprise Organization Registry

Read-only mirror untuk baseline enterprise organization.

Isi:

- company hierarchy;
- organization hierarchy;
- position master;
- position variant;
- incumbent assignment;
- source metadata dan effective date.

### 6.2 Organization Change Proposal

Module utama untuk membuat, mereview, dan mengajukan proposal perubahan.

Change types:

- Company entity CRUD.
- Organization unit CRUD.
- Reporting line change.
- Position/job CRUD.
- Position variant/formasi change.
- Job grade/job family/competency requirement change.

### 6.3 Workload Evidence Engine

Dua mode:

- Corporate monthly workload untuk Kantor Pusat.
- Operational daily/shift workload untuk terminal petikemas dan marine/vessel service.

Evidence dapat berasal dari:

- volume transaksi/layanan;
- SLA;
- shift activity;
- utilization;
- overtime;
- backlog;
- productivity indicator;
- manual evidence dengan approval note.

### 6.4 Manpower Planning

Menghasilkan:

- required FTE;
- actual FTE;
- FTE gap;
- criticality;
- assumptions;
- evidence link;
- recommended action.

### 6.5 Scenario & Business Case

Membandingkan:

- baseline structure;
- proposed structure;
- alternative scenario.

Dampak yang ditampilkan:

- FTE;
- cost;
- span of control;
- vacancy;
- competency gap;
- approval risk;
- operational readiness.

### 6.6 Approval & Governance

Approval routing ditentukan oleh:

- jenis perubahan;
- level organisasi terdampak;
- dampak FTE;
- dampak biaya;
- dampak legal/perdir;
- dampak operasional;
- lintas company/subholding/regional.

### 6.7 AI Recommendation & Evidence Assistant

AI memberi rekomendasi berbasis evidence, bukan keputusan otomatis.

Use cases:

- workload-to-FTE recommendation;
- organization risk detection;
- scenario comparison;
- proposal drafting;
- approval risk prediction;
- competency/talent impact;
- data quality/source conflict detection.

## 7. Main Product Output

Output utama OMS adalah **Organization Change Proposal**.

Lampiran/evidence utama:

- Manpower Plan.
- Scenario Business Case.
- Workload Evidence.
- AI Recommendation.
- Legal Document Reference.
- Approval Trail.

## 8. Pilot Success KPI

KPI utama:

- Waktu penyusunan proposal lebih cepat.
- Proposal lebih lengkap secara evidence dan audit trail.
- Workload-to-FTE calculation lebih dapat dipertanggungjawabkan.
- Approval lebih jelas berdasarkan risk/impact.

KPI pendukung:

- Executive visibility membaik.
- AI recommendation adoption rate.
- Revision cycle berkurang.
- Data issue antar-source system teridentifikasi.

## 9. Product Non-Goals

OMS tidak bertujuan menjadi:

- HRIS pengganti.
- Legal org master pengganti Perdir/SK.
- Operational system pengganti terminal/marine systems.
- Full talent suite pengganti Portaverse Talent.
- Auto-approval engine.
- AI-only decision system.
