# Dokumentasi Reverse Engineering OMS

Dokumentasi ini diturunkan dari kode aplikasi di repo `/Users/alfredoteja/Documents/oms`. Aplikasi yang direview adalah **OM+ / Organization Management System**, sebuah prototype frontend untuk manajemen organisasi, proses bisnis, workload, biaya tenaga kerja, scenario planning, dan rekomendasi AI.

## Dokumen Strategis Pelindo-Portaverse

- [Source of Truth OMS Pelindo](./context/SOURCE_OF_TRUTH.md)
- [Portaverse Alignment untuk OMS](./context/PORTAVERSE_ALIGNMENT.md)
- [Product Specification OMS Pelindo untuk Portaverse](./product/OMS_PELINDO_PORTAVERSE_PRODUCT_SPEC.md)
- [OMS Portaverse-Aligned Data Model](./architecture/OMS_PORTAVERSE_DATA_MODEL.md)
- [OMS Workflow dan Integration Architecture](./architecture/OMS_WORKFLOW_INTEGRATION_ARCHITECTURE.md)
- [OMS MVP dan Pilot Roadmap](./roadmap/OMS_MVP_PILOT_ROADMAP.md)

## Dokumen Reverse Engineering Existing App

- [OMS Product Specification](./OMS_PRODUCT_SPEC.md)
- [OMS Architecture](./OMS_ARCHITECTURE.md)
- [OMS Feature Inventory](./OMS_FEATURE_INVENTORY.md)
- [OMS Domain Model](./OMS_DOMAIN_MODEL.md)
- [OMS User Flows](./OMS_USER_FLOWS.md)
- [OMS Gaps and Roadmap](./OMS_GAPS_AND_ROADMAP.md)
- [Reverse Engineering Plan](./OMS_REVERSE_ENGINEERING_PLAN.md)

## Status Implementasi Saat Ini

OMS saat ini adalah aplikasi Next.js frontend dengan data lokal/mock deterministic. Belum ditemukan API route, database, authentication, authorization, atau persistence server-side. Beberapa aksi seperti create, edit, submit, export, dan AI generation sudah tersedia di UI, tetapi sebagian besar bekerja sebagai state lokal, dialog, toast, CSV browser export, atau placeholder demo.

## Sumber Kode Utama

- `app/(oms)`: halaman dan route aplikasi OMS.
- `components/oms`: layout OMS, sidebar, topbar, assistant, widget.
- `components/ai`: UI modul AI insight dan AI job position.
- `components/workload`: form dan panel workload activity.
- `components/process`: panel detail business process.
- `lib/oms-data.ts`: data utama aplikasi dan derivasi workload.
- `lib/om-metrics.ts`: unified metrics, rollup organisasi, validasi, dan helper.
- `lib/ai-mock-data.ts`: AI insights dan generated positions.
- `data/omData.ts`: dataset typed terpisah dengan validasi relasi, belum tampak dipakai langsung oleh route aktif.
