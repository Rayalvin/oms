# Reverse Engineering OMS Documentation

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` up to date as work proceeds.

## Purpose / Big Picture

Tujuan pekerjaan ini adalah membuat dokumentasi Markdown berbahasa Indonesia yang menjelaskan produk Organization Management System (OMS) dari kode yang ada. Setelah selesai, pembaca non-engineer dapat memahami fitur, arsitektur, data, alur pengguna, batasan implementasi, dan ruang pengembangan berikutnya tanpa harus membaca kode langsung.

## Context and Orientation

Repo berada di `/Users/alfredoteja/Documents/oms`. Tidak ditemukan `AGENTS.md`, `README.md`, `DESIGN.md`, atau `PLANS.md` lokal pada awal eksplorasi. Sumber utama adalah kode Next.js App Router di `app/(oms)`, komponen di `components`, data mock/unified di `lib` dan `data`, serta command di `package.json`.

Teknologi yang teridentifikasi dari `package.json`: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Radix UI/shadcn-style components, Recharts, lucide-react, dan next-themes. Aplikasi saat ini tampak sebagai prototype frontend/data-local, bukan full-stack app dengan API/database.

## Scope and Approach

Output utama adalah dokumen Markdown di folder `docs/`:

- spesifikasi produk OMS
- arsitektur aplikasi
- inventaris fitur dan halaman
- model data dan relasi domain
- alur pengguna utama
- batasan, asumsi, dan rekomendasi lanjutan

Dokumentasi akan diturunkan dari kode yang ada. Tidak ada perubahan behavior aplikasi, route, style, atau data produk.

## Milestones

### Milestone 1: Peta Struktur dan Command

Identifikasi framework, command, route, folder utama, dan dependency penting. Validasi dengan membaca `package.json`, layout, sidebar, dan daftar halaman.

### Milestone 2: Peta Domain dan Data

Baca file data utama untuk memahami entitas OMS: company, department, position, employee, process, KPI, workload activity, cost, scenario, dan AI insight.

### Milestone 3: Peta Fitur

Baca halaman dan komponen utama per modul untuk merangkum kapabilitas aktual, termasuk dashboard, organization, business process, workload, financial, scenario, dan AI.

### Milestone 4: Tulis Dokumentasi

Buat dokumen Markdown Bahasa Indonesia dengan struktur yang bisa dipakai sebagai product spec dan technical orientation.

### Milestone 5: Validasi

Pastikan file Markdown ada, terbaca, konsisten dengan kode, dan tidak mengklaim backend/fitur live yang belum ada di implementasi.

## Validation

- `git status --short` untuk memastikan scope perubahan hanya dokumentasi.
- `find docs -maxdepth 1 -type f` untuk memastikan artifact ada.
- Review manual isi Markdown terhadap route/data source yang terbaca.
- Jika praktis, jalankan build/lint hanya bila diperlukan; karena pekerjaan ini dokumentasi-only, validasi utama adalah inspeksi file.

## Progress

- [x] Repo awal dibaca: tidak ada instruksi lokal atau README.
- [x] Command dan dependency utama dibaca dari `package.json`.
- [x] Route, navigasi, dan komponen utama dipetakan.
- [x] Data/domain model dipetakan.
- [x] Dokumen Markdown ditulis.
- [x] Output direview dan scope perubahan dicek.

## Surprises & Discoveries

- Belum ada README atau dokumen repo lokal; dokumentasi perlu diturunkan langsung dari kode.
- Hook shell mendorong penggunaan `rtk`/`rtk proxy` untuk command baca.
- Aplikasi tidak memiliki `app/api`, `route.ts`, `fetch`, ORM, atau database client; dokumentasi harus menyebut app sebagai prototype frontend/data lokal.
- Ada beberapa data source paralel. Runtime paling aktif memakai `lib/oms-data.ts`, `lib/om-metrics.ts`, dan `lib/ai-mock-data.ts`; `data/omData.ts` punya model typed dan validasi relasi tetapi belum tampak di-import oleh route aktif.

## Decision Log

- Decision: Simpan dokumentasi reverse engineering di `docs/`.
  Rationale: Repo belum punya folder dokumentasi; `docs/` adalah lokasi umum dan tidak mengubah aplikasi.
  Date/Author: 2026-05-12 / Codex

- Decision: Dokumentasikan fitur sebagai prototype frontend berbasis data lokal sampai ditemukan bukti backend/API.
  Rationale: File route dan komponen memakai import data lokal; belum ditemukan endpoint API/database.
  Date/Author: 2026-05-12 / Codex

## Outcomes & Retrospective

Dokumentasi utama sudah dibuat di `docs/` dan scope git menunjukkan hanya folder `docs/` sebagai perubahan baru. Validasi dilakukan dengan daftar file Markdown, hitung baris, grep klaim prototype/backend/persistence, dan `git status --short`.
