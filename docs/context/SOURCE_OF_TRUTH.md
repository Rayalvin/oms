# Source of Truth OMS Pelindo

Dokumen ini mendefinisikan urutan sumber kebenaran untuk pengembangan **Organization Management System (OMS)** sebagai bagian dari Portaverse.

## 1. Urutan Prioritas

Jika ada konflik antar-sumber, gunakan urutan berikut:

1. **Keputusan user/interview terbaru**
   - Keputusan scope, MVP, pilot, dan arah produk yang sudah disetujui dalam sesi kerja.
2. **Dokumen legal organisasi Pelindo**
   - Perdir/SK dan dokumen susunan organisasi resmi.
   - Untuk konteks awal: `Perdir Susunan Organisasi dan Tata Kelola Pelindo Kantor Pusat TMT 15 APR 2026.pdf`.
3. **Portaverse/PMS production-aligned model**
   - Referensi utama ada di `/Users/alfredoteja/Documents/pmsv7-v1.3`.
   - Gunakan terutama:
     - `src/lib/entities/index.ts`
     - `docs/DATA_DOMAIN_MODEL.md`
     - `docs/STAGING_BE_DATA_MODEL_BENCHMARK.md`
     - `docs/STAGING_BE_API_BENCHMARK.md`
     - `DESIGN.md`
     - `AGENTS.md`
4. **Dokumentasi OMS repo**
   - Product, architecture, research, dan roadmap docs di `/Users/alfredoteja/Documents/oms/docs`.
5. **Implementasi OMS saat ini**
   - `app/`, `components/`, `lib/`, dan `data/`.
   - Implementasi saat ini adalah prototype frontend dengan data lokal/mock; jangan diperlakukan sebagai source of truth production.

## 2. Keputusan Produk yang Sudah Dikunci

OMS harus diarahkan sebagai **Organization Change & Workforce Evidence Workbench** untuk Pelindo.

Prioritas masalah:

1. Governance organisasi HC.
2. Workforce planning operasional pelabuhan.
3. Executive decision support.
4. Portaverse talent extension.

Scope organisasi:

- Holding.
- Subholding.
- Anak Perusahaan.
- Afiliasi/Terafiliasi.
- Kantor Pusat.
- Regional/Sub Regional.
- Cabang/Terminal/Pelabuhan.
- Direktorat/Group/Divisi/Departemen/Unit Pendukung.
- Jabatan, position variant, dan incumbent assignment.

Peran OMS:

- Master organisasi legal tetap dari Perdir/SK dan sistem resmi.
- Employee-position tetap dari HRIS.
- Talent, competency, learning, career, performance, dan KPI context tetap dari Portaverse.
- Operational workload tetap dari operational systems.
- OMS menjadi system of record untuk proposal perubahan, scenario, workload evidence, AI recommendation, approval trail, dan integration handoff.

## 3. Pilot Scope

Pilot awal:

- Kantor Pusat.
- Satu terminal petikemas yang data-ready dan punya pain point nyata.
- Marine/vessel service sebagai fungsi operasional kritis.

KPI utama pilot:

- Kecepatan dan compliance governance proposal.
- Akurasi workload-to-FTE evidence.

KPI pendukung:

- Executive visibility.
- AI recommendation adoption.
- Penurunan revision cycle.
- Identifikasi data issue antar-source system.

## 4. Konsekuensi untuk Agent

- Jangan membuat master data organisasi/pegawai/jabatan paralel jika Portaverse/PMS sudah punya konsepnya.
- Jangan mengubah UI/navigation tanpa mengecek pola Portaverse PMS.
- Jangan menganggap data lokal OMS saat ini sebagai model produksi.
- Semua product spec baru harus menandai sumber data dan ownership-nya.
- Approved proposal di OMS harus dianggap sebagai handoff/integration event, bukan mutasi langsung ke master legal/HRIS.
