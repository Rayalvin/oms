# OMS MVP dan Pilot Roadmap

## 1. Roadmap Principle

OMS tidak perlu langsung rollout enterprise penuh. Pilot harus membuktikan dua hal paling penting:

1. Governance proposal perubahan organisasi lebih cepat, jelas, dan audit-ready.
2. Workload-to-FTE evidence lebih akurat dan dapat dipertanggungjawabkan.

Executive dashboard menjadi reporting layer, bukan KPI utama pilot.

## 2. Pilot Scope

Area pilot:

- Kantor Pusat.
- Satu terminal petikemas yang data-ready dan punya pain point nyata.
- Marine/vessel service.

Kriteria area pilot:

- Data workload tersedia atau bisa diekstrak.
- Pain point nyata dan disepakati business owner.
- Ada sponsor HC dan operations.
- Ada struktur baseline yang jelas.
- Ada proses approval yang bisa diuji.

## 3. Phase 0: Documentation and Context Alignment

Tujuan:

- Repo rapi untuk dikonsumsi agent dan product team.
- Source of truth jelas.
- OMS didefinisikan sebagai Portaverse module.

Deliverables:

- `AGENTS.md`.
- `docs/context/SOURCE_OF_TRUTH.md`.
- `docs/context/PORTAVERSE_ALIGNMENT.md`.
- Product spec Pelindo-Portaverse.
- Data model dan integration architecture.

Exit criteria:

- Semua stakeholder membaca dokumen yang sama.
- Scope MVP dan pilot tidak ambigu.

## 4. Phase 1: Portaverse Data Model Alignment

Tujuan:

- OMS memakai vocabulary Portaverse/PMS.
- Data lokal OMS tidak lagi menjadi pseudo-production model.

Work items:

- Mapping current OMS entities ke `Company`, `Organization`, `PositionMaster`, `PositionVariant`, `Employee`, `PositionAssignment`.
- Definisi OMS-owned entities.
- Adapter/view-model boundary.
- Source metadata standard.
- Gap list antara current OMS mock data dan target model.

Exit criteria:

- Tidak ada entity production baru yang menduplikasi Portaverse master.
- Proposal/evidence/scenario model siap diimplementasikan.

## 5. Phase 2: Portaverse Shell, Design System, and Navigation

Tujuan:

- OMS terasa sebagai bagian dari Portaverse.

Work items:

- Buat `DESIGN.md` OMS yang mengacu ke PMS `DESIGN.md`.
- Tentukan route final: `/organization-management` atau `/oms`.
- Desain module entry di Portaverse sidebar/landing.
- Refactor OMS shell agar dapat berjalan di dalam Portaverse shell.
- Kurangi ketergantungan pada full-height OMS sidebar.

Exit criteria:

- OMS dapat dinavigasi sebagai Portaverse workspace module.
- Visual language konsisten dengan PMS.

## 6. Phase 3: Organization Change Proposal MVP

Tujuan:

- OMS dapat menjalankan workflow proposal utama.

Work items:

- Draft proposal.
- Change item CRUD.
- Before/after snapshot.
- Legal reference.
- Risk/impact classification.
- Submit/revision/approve/reject state.
- Audit trail minimum.

Exit criteria:

- Satu proposal perubahan posisi atau unit dapat dibuat, ditinjau, direvisi, dan disetujui dalam prototype workflow.

## 7. Phase 4: Workload Evidence and Manpower Planning

Tujuan:

- Proposal didukung evidence workload dan FTE calculation.

Work items:

- Corporate monthly workload template.
- Operational daily/shift workload template.
- Terminal petikemas activity evidence.
- Marine/vessel service activity evidence.
- Required FTE, actual FTE, FTE gap.
- Evidence completeness validation.

Exit criteria:

- Proposal pilot dapat menyertakan workload evidence dan manpower plan yang dapat dipertanggungjawabkan.

## 8. Phase 5: Scenario and AI Recommendation

Tujuan:

- User dapat membandingkan alternatif dan memakai AI sebagai assistant.

Work items:

- Baseline/proposed/alternative scenario.
- Scenario comparison.
- AI recommendation object.
- Accept/reject/defer AI recommendation.
- AI evidence trace.
- Proposal drafting assistant.

Exit criteria:

- AI recommendation dapat dikonversi menjadi proposal change item dengan human confirmation.

## 9. Phase 6: Integration Handoff and Pilot Reporting

Tujuan:

- Approved proposal siap dikirim ke source system.
- Executive dapat melihat progress pilot.

Work items:

- Integration handoff payload.
- Handoff status tracking.
- Execution monitoring.
- Pilot dashboard.
- KPI pilot report.

Exit criteria:

- Approved proposal menghasilkan handoff record.
- KPI pilot dapat dilaporkan ke sponsor.

## 10. MVP Backlog Summary

Priority P0:

- Source of truth alignment.
- Portaverse data model mapping.
- Proposal workflow.
- Workload evidence model.
- Manpower plan model.
- Risk-based approval.

Priority P1:

- Shell/navigation integration.
- Scenario comparison.
- AI recommendation evidence trace.
- Pilot dashboard.

Priority P2:

- Advanced executive analytics.
- Cross-enterprise rollout.
- Full learning/performance optimization.
- Advanced cost simulation.
