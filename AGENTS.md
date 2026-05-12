# OMS Repo Guidance

This file is the repo-local Codex guidance for `/Users/alfredoteja/Documents/oms`. OMS is a Portaverse module for organization management, not a standalone product strategy source. Keep this file operational; product specs belong in `docs/product/`, architecture notes in `docs/architecture/`, and research in `docs/research/`.

## Commands

- Install dependencies only when needed: `pnpm install`
- Run dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`

If `pnpm` is unavailable, inspect `package.json` before choosing an npm fallback.

## Source Precedence

Use this order when sources disagree:

1. Current user request and approved interview decisions.
2. Pelindo legal organization references, especially Perdir/SK documents.
3. Portaverse/PMS references in `/Users/alfredoteja/Documents/pmsv7-v1.3`.
4. OMS repo docs under `docs/`.
5. Current OMS implementation in `app/`, `components/`, `lib/`, and `data/`.

Do not treat the current OMS mock data as authoritative when it conflicts with Portaverse/PMS production-aligned models.

## Repo Map

- `app/(oms)/`: active Next.js App Router pages for OMS.
- `components/oms/`: OMS shell, sidebar, panels, and dashboard widgets.
- `components/ai/`: AI insight and job-position recommendation UI.
- `components/process/`, `components/workload/`, `components/workforce/`: domain module UI.
- `components/ui/`: shadcn/Radix primitives local to OMS.
- `lib/oms-data.ts`: current local runtime dataset and navigation data.
- `lib/om-metrics.ts`: derived metrics, rollups, validation helpers, and tree builders.
- `lib/enterprise-dataset.ts`, `data/omData.ts`: typed enterprise datasets and future canonical-data candidates.
- `docs/`: current reverse-engineering and product documentation.

## Context Architecture

Use this target documentation structure as the repo grows:

- `README.md`: repo overview, status, and run instructions.
- `DESIGN.md`: OMS design rules, aligned to Portaverse PMS design language.
- `docs/context/`: durable context for agents and product contributors.
  - `PORTAVERSE_ALIGNMENT.md`: PMS/Portaverse data, shell, navigation, and design-system alignment.
  - `SOURCE_OF_TRUTH.md`: explicit precedence and source references.
- `docs/product/`: OMS product specifications and PRD artifacts.
- `docs/architecture/`: data model, integration, navigation, and module architecture.
- `docs/research/`: reverse engineering, benchmark notes, and discovery output.
- `docs/roadmap/`: MVP phases, backlog, delivery plan, and pilot criteria.
- `docs/superpowers/`: specs and implementation plans produced by Superpowers workflows.

Avoid scattering new long-form docs directly under `docs/` once these folders exist.

## Portaverse Alignment

OMS should behave as a Portaverse workspace module:

- Follow `/Users/alfredoteja/Documents/pmsv7-v1.3/DESIGN.md` for visual direction before UI work.
- Check `/Users/alfredoteja/Documents/pmsv7-v1.3/AGENTS.md` for current Portaverse/PMS repo conventions.
- Use PMS entity docs and contracts as the integration baseline:
  - `src/lib/entities/index.ts`
  - `docs/DATA_DOMAIN_MODEL.md`
  - `docs/STAGING_BE_DATA_MODEL_BENCHMARK.md`
  - `docs/STAGING_BE_API_BENCHMARK.md`
- Keep OMS concepts compatible with Portaverse entities: `Company`, `Organization`, `PositionMaster`, `PositionVariant`, `Employee`, and `PositionAssignment`.
- OMS-owned data should be limited to proposal, scenario, workload evidence, manpower plan, AI recommendation, approval, handoff, and audit records.

## Design and Navigation

- Treat OMS as a Portaverse module, not a separate app with an unrelated shell.
- Prefer Portaverse PMS shell patterns: `AppShell`, `Sidebar`, `Navbar`, page metadata, drawers, sheets, badges, dense tables, and audit-friendly panels.
- Add OMS to Portaverse primary navigation or landing-module navigation when integrating with PMS.
- Avoid a second full-height OMS sidebar inside the Portaverse shell unless it is a secondary in-module navigation rail.
- Keep operational screens dense, scannable, and evidence-led.
- Avoid landing-page composition, oversized heroes, decorative card grids, and generic marketing UI.
- Use lucide icons and existing UI primitives before creating custom controls.
- Keep Bahasa Indonesia for workflow labels while preserving stable domain terms such as OMS, Portaverse, Company, Organization, Position, Workload, Scenario, Approval, AI Recommendation, and Audit.

## Data Model Boundary

- Current OMS data is local/mock and is useful for prototype behavior only.
- Do not create a parallel production master model if Portaverse/PMS already has the concept.
- Use adapter/view-model boundaries for future API work; do not bind screens directly to raw staging backend DTOs.
- Preserve source metadata for integration-oriented models: `source_system`, `source_record_id`, `source_version`, and `last_synced_at`.
- Approved OMS proposals should produce integration handoff records/events, not silently mutate legal org, HRIS, or Portaverse master data.

## Documentation Workflow

- For reverse engineering, write findings under `docs/research/`.
- For product decisions from interviews, write the main spec under `docs/product/` and supporting technical material under `docs/architecture/`.
- For Portaverse/PMS alignment, cite the exact PMS file path used as the source.
- Keep markdown concise, structured, and written in Bahasa Indonesia unless the user asks otherwise.
- Before adding a new document, check whether an existing doc should be moved, extended, or linked instead.

## Validation

- Documentation-only changes: verify file existence, stale links, and `git status --short`.
- Code changes: run the smallest relevant check first; use `pnpm build` for shared routing, layout, data-contract, or UI changes.
- UI changes: run the app and inspect the affected route visually when practical.
- Data-model changes: compare against PMS entity docs and staging BE benchmark before reporting completion.

## Boundaries

Always:

- Preserve user-authored changes and existing generated artifacts unless the user asks to remove them.
- Identify the source of truth before changing product behavior, sample data, navigation, or entity naming.
- Keep changes scoped to the requested module or documentation area.

Ask first:

- Adding dependencies.
- Replacing the OMS shell with PMS shell components.
- Moving large documentation sets into the target context architecture.
- Changing route names or Portaverse module naming.
- Creating backend/API integration code.

Never:

- Treat OMS mock data as production truth.
- Edit secrets, `.env` files, or production configuration without explicit approval.
- Run destructive git commands unless explicitly requested.
- Execute staging mutating endpoints or testing reset/setup endpoints from PMS documentation.
- Rewrite unrelated UI/data modules while only updating documentation.
