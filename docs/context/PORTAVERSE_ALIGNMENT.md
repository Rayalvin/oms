# Portaverse Alignment untuk OMS

OMS adalah bagian dari Portaverse. Karena itu, arah produk, data model, design system, dan navigation harus mengikuti pola Portaverse/PMS, bukan berdiri sebagai aplikasi terpisah.

## 1. Prinsip Integrasi

OMS harus diposisikan sebagai **Portaverse workspace module**:

- Masuk dari navigation/landing Portaverse.
- Memakai visual system Portaverse.
- Memakai canonical organization vocabulary dari PMS/Portaverse.
- Menyimpan domain OMS hanya untuk workflow perubahan organisasi.
- Menggunakan adapter layer sebelum terhubung ke staging/production backend.

## 2. Design System

Source utama:

- `/Users/alfredoteja/Documents/pmsv7-v1.3/DESIGN.md`

Implikasi untuk OMS:

- Gunakan light-first enterprise workspace.
- Gunakan mist surfaces, sky command action, amber analytical chart ramp, dan semantic green/amber/red untuk decision state.
- Layar OMS harus dense, scannable, audit-friendly, dan evidence-led.
- Hindari hero besar, marketing layout, decorative card grid, glassmorphism default, dan whitespace dekoratif.
- Gunakan pattern drawer, sheet, table, badge, segmented control, filter bar, dan audit panel seperti PMS.

OMS saat ini masih memakai gaya OM+ yang lebih indigo-heavy. Target refactor UI adalah mendekatkan OMS ke Portaverse PMS tanpa kehilangan fokus domain organization/workforce.

## 3. Navigation

Pola ideal:

```text
Portaverse
  My Performance
  My Team
  KPI Dictionary
  Performance Tree
  Organization Management
  Performance HQ
```

Rekomendasi route:

```text
/organization-management
/organization-management/registry
/organization-management/proposals
/organization-management/workload-evidence
/organization-management/manpower-plan
/organization-management/scenarios
/organization-management/approvals
/organization-management/ai-recommendations
```

Alternatif route pendek:

```text
/oms
/oms/registry
/oms/proposals
/oms/workload-evidence
/oms/manpower-plan
/oms/scenarios
/oms/approvals
/oms/ai
```

Keputusan final route harus mempertimbangkan naming convention Portaverse dan module entitlement.

## 4. Shell Integration

Source pattern:

- `/Users/alfredoteja/Documents/pmsv7-v1.3/src/components/shell/AppShell.tsx`
- `/Users/alfredoteja/Documents/pmsv7-v1.3/src/components/shell/Sidebar.tsx`
- `/Users/alfredoteja/Documents/pmsv7-v1.3/src/components/shell/Layout.tsx`

Pendekatan ideal:

- OMS memakai shell Portaverse.
- OMS tidak memakai full-height sidebar terpisah saat berjalan di dalam Portaverse.
- Jika OMS butuh navigasi internal, gunakan secondary rail/tabs di content area.
- Page metadata OMS masuk ke route metadata map Portaverse.
- Global drawer/modal behavior mengikuti shell PMS.

## 5. Data Model Alignment

Source pattern:

- `/Users/alfredoteja/Documents/pmsv7-v1.3/src/lib/entities/index.ts`
- `/Users/alfredoteja/Documents/pmsv7-v1.3/docs/DATA_DOMAIN_MODEL.md`
- `/Users/alfredoteja/Documents/pmsv7-v1.3/docs/STAGING_BE_DATA_MODEL_BENCHMARK.md`

OMS harus memakai entity Portaverse/PMS sebagai vocabulary integrasi:

- `Company`
- `Organization`
- `PositionMaster`
- `PositionVariant`
- `Employee`
- `PositionAssignment`

OMS-owned entities:

- `OrganizationChangeRequest`
- `OrganizationChangeItem`
- `WorkloadEvidence`
- `ManpowerPlan`
- `OrganizationScenario`
- `AIRecommendation`
- `ApprovalWorkflow`
- `ApprovalDecision`
- `IntegrationHandoff`
- `AuditLog`
- `LegalDocumentReference`

## 6. API Strategy

Source pattern:

- `/Users/alfredoteja/Documents/pmsv7-v1.3/docs/STAGING_BE_API_BENCHMARK.md`

Rekomendasi:

- Jangan bind UI langsung ke raw staging DTO.
- Buat adapter contract per module.
- FE boleh memakai view model yang stabil.
- Adapter menerjemahkan field, ID, enum, dan status dari BE.
- Simpan metadata source untuk semua data mirror: `source_system`, `source_record_id`, `source_version`, `last_synced_at`.

## 7. Migration Path

1. Dokumentasikan alignment OMS-Portaverse.
2. Buat `DESIGN.md` OMS yang mengacu ke PMS.
3. Normalisasi route dan navigation naming.
4. Refactor shell OMS agar bisa hidup di dalam Portaverse shell.
5. Buat data adapter untuk master mirror dan OMS-owned workflow data.
6. Integrasikan approval/handoff setelah model proposal stabil.
