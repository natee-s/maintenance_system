# CMMS Phase 1–3 Implementation Plan

## Authority and repository inspection

Read in full on 2026-10-07: `CODEX_BUILD_PROMPT_PHASE_1_2_3.md` (master build instructions), `CMMS_PHASE_1_2_3_SPEC.md` (4,465 lines, authoritative requirements), and `PM.txt`. Visually inspected `references1.jpg` and `references2.jpg`. The repository initially contains only these five inputs: no application, dependencies, environment, database, tests, reusable components, AGENTS.md, or Git repository. Node 24.21.0 and npm 11.19.0 are installed. Initial PostgreSQL availability was unverified; project-local UTF-8 PostgreSQL 18 was provisioned later for actual verification.

The specification is the Source of Truth. PM.txt and the pictures provide business and visual context only. No Phase 4+ modules, placeholder screens, Docker, Redis, or separate services will be introduced.

## Dependency order and checkpoints

The master prompt groups work into Steps 0–9; specification §79 divides it into Steps 0–11. Execute the more specific authoritative §79 order below. The parent grouping is included to preserve the requested master-plan structure.

| Spec step | Master grouping | Deliverables | Verification gate |
|---|---|---|---|
| 0 Foundation | 0 Foundation | Next.js/strict TS project, PostgreSQL/Prisma baseline migration, secure credentials/session, permission constants, Thai responsive shell, shared UI, audit/storage helpers, seed framework, env/config/error handling, unit/integration/E2E setup | lint, typecheck, unit tests, build; migration and auth smoke check against PostgreSQL |
| 1 Auth/User/Location | 1 Auth/User/Location | Six roles, users, organization/site/area/location, configurable categories/UOM/teams | authorization, inactive records, hierarchy tests; build |
| 2 Asset/QR | 2 Asset/QR | CRUD/archive, server filters/sort/pagination, detail, stable token, printable QR, authenticated mobile quick view/scanner | unique tokens, limited requester projection, inactive QR rejection; build |
| 3 Work Request | 3 Work Request | creation/detail, own-request access, review/approve/reject, atomic conversion and traceability | rejection reason, duplicate/concurrent conversion, foreign-record permissions |
| 4 Work Order | 4 Work Order | corrective WO, assignment, My Work, centralized transitions, execution, completion/close/rework, photos/comments/events | complete lifecycle, invalid transitions, assignment isolation, immutable terminal records |
| 5 Downtime/History/Dashboard | 5 History/Dashboard | primary downtime, overlap-aware duration, close warning, relational machine history, filtered operational charts | Phase 1 critical E2E and database checks |
| 6 PM templates/plans | 6 PM | ordered typed checklist builder, active plans, fixed calendar recurrence and lead window | recurrence boundaries, inactive references, template editing |
| 7 PM generation/execution | 6 PM | transactional occurrence generation, immutable checklist snapshot, protected manual/scheduler trigger, execution, month/list calendar, due states | concurrent/idempotent generation, required/fail/photo responses; Phase 2 E2E |
| 8 Parts/warehouse/stock | 7 Inventory | masters, decimal quantities/UOM, opening/receipt/adjustment, constrained balance, immutable ledger, low stock | posting rollback, reasons, ledger immutability, reconciliation |
| 9 Reserve/issue/return | 7 Inventory | reservation/release, eligibility, consumption, bounded returns, WO usage | concurrent last-stock issue, reservation cleanup, Phase 3 E2E |
| 10 Integrated dashboard/history | 8 Integration | PM and part usage in assets/WO, real filtered KPIs, navigation and in-app notifications | cross-role, mobile navigation, QR E2E |
| 11 Hardening/tests/docs | 9 Testing/Hardening | errors/empty states, accessibility, pagination/indexes, security review, full seed, README/data model/API/test documentation | lint, typecheck, unit/integration/E2E, production build, pilot smoke checks |

## Architecture and acceptance approach

One Next.js modular monolith. UI calls validated server operations; domain modules own business logic and transactions. PostgreSQL constraints enforce unique business codes, one WO per request, PM occurrence uniqueness, and nonnegative stock. No browser-computed balances or direct status editing. Implement migrations in dependency order, add tests with each service, and record checkpoint evidence in `docs/PROGRESS.md`.

Use original blue navigation/orange action branding, Thai labels, light rounded cards, desktop tables, mobile cards/bottom navigation. All operational figures come from persisted records. Seed every role and realistic assets/parts/PM/workflows. Checkpoint reports distinguish implemented source from verified execution; infrastructure failures never count as passes.

## Current status

- Pre-code inspection and full reference reading: complete.
- Plan, assumptions, decisions: written before application source.
- Steps 0–10: implemented and passed their sequential verification gates.
- Step 11: complete; lint/typecheck/unit/integration/E2E/build/fresh database/production smoke passed. See IMPLEMENTATION_REPORT.md and TEST_PLAN.md. Physical hardware/deployment acceptance remains in PILOT_TEST.md.


# UI refresh — October 7, 2026

Apply the supplied mobile screen-flow reference to the existing responsive web application:
1. Establish orange/navy design tokens and reusable cards, chips, navigation and upload controls.
2. Refresh the application shell with active navigation, five mobile tabs and a profile/menu screen.
3. Improve the dashboard hierarchy, real KPI cards, quick actions, scoped recent activity and operational charts.
4. Enhance equipment/parts list cards and equipment detail without changing domain rules.
5. Add a responsive month/day PM calendar and a three-step corrective work order form using existing endpoints.
6. Refresh checklist progress, evidence uploads and camera scanning states.
7. Run lint, typecheck, unit tests, build and configured E2E; verify mobile/desktop screenshots.

No native application, advanced analytics, schema changes or new dependencies are required.
