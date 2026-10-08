# Implementation checkpoints

## UI refresh — completed October 8, 2026

Completed: shared orange/navy tokens; five mobile tabs and role-aware profile menu; real four-card KPI overview, quick actions and scoped activity; thumbnail equipment/part lists and master-data filter chips; equipment detail cards; responsive month/day calendar; recoverable three-step work-order creation/assignment/file upload; CHECK pass/fail checkboxes, checklist progress and evidence previews; camera framing/status/manual recovery; status donut and operational bars with data-table alternatives.

Added: Navigation, MetricCard, FilterChips, Profile, WorkOrderWizard, MaintenanceCalendar, dashboard presentation queries, UI flow E2E, screenshot capture script and UI_ARCHITECTURE.md.

Verification: lint/typecheck/build pass; 18 unit and 19 PostgreSQL integration tests pass; all 24 desktop/mobile E2E scenarios pass across the full run and final three reruns. Captured 12 screens and checked 390px/360px viewport overflow. No database changes or new dependencies. Camera on physical devices remains a pilot check.

Key fixes: prevent a Next button becoming a submit button during the same click; retain created work ID for retry; disable unhydrated form controls to preserve initial values; distinguish accessible field/group labels; preserve role-scoped server queries and transactions.

## Step 0 — Foundation

Completed: project/config/test baseline, PostgreSQL/Prisma, credentials login, six-role permission policy, private storage abstraction/file signature validation, sanitized transactional audit, concurrent business counters, Thai responsive application shell, env/seed framework.

Files added: root configs, `app/login`, `app/api/auth`, `app/(dashboard)` shell, `components/ui`, `components/layout`, `lib/{auth,db,permissions,storage}`, `modules/{auth,audit,files}`, `prisma/schema.prisma`, initial migration and seed, `scripts/local-postgres.ts`, foundation unit/integration/E2E tests, README. Input documents/images unchanged.

Database: `20261007120040_foundation` migration applied to local PostgreSQL 18, UTF-8 development database. Reviewed generated SQL: role enum, organization/site/area/location/user foreign keys, unique usernames/emails/codes, hierarchy scoped code constraints, indexed audit. Initial Windows default encoding was WIN1252; created a separate UTF-8 database without deleting the first. Future local databases explicitly use UTF-8.

Commands/results:
- `npm install`: passed; lockfile created. Overrides patched deepmerge-ts and mysql2. Five remaining high audit findings relate to an unpatched braces build-tool chain; no forced framework downgrade.
- `npm run db:generate`: passed (Prisma 7.10.0).
- `npx prisma migrate dev --name foundation`: passed; `npx prisma migrate deploy` on UTF-8 database passed.
- `npm run db:seed`: passed (organization, site, seven accounts).
- `npm run typecheck`: passed.
- `npm test`: 5 passed.
- `npm run test:integration`: 4 passed (credentials/no hash, inactive account, concurrent counters, audit sanitization).
- `npm run lint`: passed without warnings after config correction.
- `npm run build`: passed (Next.js 16.4.0).

Infrastructure: sandbox blocked localhost and Windows temporary rename/path canonicalization. Verification used approved escalated commands. First test/build attempts failed for these reasons, not counted as passes. Playwright browser download underway; E2E evidence will be recorded separately.

Assumptions: see ASSUMPTIONS.md. Local embedded PostgreSQL is an optional dev tool, not production infrastructure. Terminal shell links are connected as modules land in dependency order; no later-phase fake pages.

Next: Step 1 users and location masters.

## Step 1 — Users and location masters

Completed: user create/update/activation/password hashing; six roles; editable organization/site/area/location and configurable MasterData; strict hierarchy validation; critical audit events. Added user/location services, admin routes/screens and shared validated-form UI. Migration `20261007120704_location_masters` applied and reviewed. Seed includes three areas/locations, categories/UOM/teams/enum labels. No input files modified.

Verification: `npm run typecheck`, `npm run lint`, `npm test` (5), `npm run test:integration` (7 across foundation/masters), `npm run build` passed. Tests reject technician administration, cross-site hierarchy and inactive parent, verify audit and safe user response. Framework E2E subsequently passed desktop + mobile login (2 tests); initial managed webServer timeout resolved by running dev server separately. Next: Asset/QR.

## Step 2 — Assets and QR

Completed: server CRUD/archive, scoped DTO, search/site/area/location/category/status/criticality filters, sorting/pagination, detail, stable QR token, print QR, camera scan with manual fallback, authenticated quick view and preselected request link. Added assets module, routes/pages, shared filter/list UI, scanner, date helpers. Migration `20261007121129_assets_qr` applied; inspected unique QR/code and Restrict relations/indexes. Five seeded assets.

Verification: typecheck, lint, unit (5), integration (9), build passed. Tests cover stable QR after edits, archive token rejection, requester DTO privacy, forbidden write, pagination cap. Initial QR image lint warning replaced with Next Image. Camera hardware remains a physical-device pilot check. Next: Work Request.

## Step 3 — Work Request

Completed: create/list/detail, requester ownership and technician assignment scope, review/approval priority/internal note, rejection/cancellation reason, atomic conversion with reciprocal links and audit/activity. Added WorkRequest service/UI/API and initial WO relational schema. Migration `20261007121617_work_requests_conversion` reviewed/applied: unique source request and converted WO constraints, reporter/reviewer/asset foreign keys and filtering indexes.

Verification: lint/typecheck/unit (5)/integration (11)/build passed. PostgreSQL concurrency test produces exactly one primary WO for two simultaneous conversions; terminal triage and requester approval rejected. Next: WO execution.

## Step 4 — Work Order execution

Completed: create/list/My Work/detail, assign/unassign, centralized exact transition validator, start/pause/wait/resume/complete/rework/close/cancel, mandatory findings/action/failure category, first start preservation, immutable completed/terminal execution, comments, persisted timeline, notifications, private validated file upload and authorized retrieval. Added domain/UI/routes and tests. Typed file/comment/notification migration `20261007122104_work_execution_files` applied and reviewed.

Verification: typecheck/unit (7)/integration (12)/build passed. Lifecycle test includes forbidden unassigned access, pause reason, first-start preservation, completion validation, technician close rejection, supervisor rework/close, terminal edit rejection and evidence. Lint initially reported unused attachment import; connected request attachment panel. Build tracing warning corrected by excluding runtime storage path from Turbopack tracing. Rechecking these corrections before next step.

Next: primary downtime, relational machine history and operational dashboard; then full Phase 1 E2E.

## Step 5 — Downtime, history and dashboard

Completed: one primary corrective downtime with server duration, stopped-request conversion integration, open/ended events, explicit open-downtime close acknowledgement, relational filtered asset history, operational KPI cards and six database-backed charts (status, asset, area, daily trend, downtime by asset, technician workload). Added downtime/history/dashboard services and UI, unit/integration tests, corrective + QR browser scenarios. Migrations `20261007122900_downtime_history_dashboard` and `20261007123100_maintenance_constraints`: unique primary WO downtime, interval/date checks, attachment exactly-one-parent/positive-size checks. Applied/reviewed in PostgreSQL.

Verification: corrected a Prisma date-filter generic mismatch and SQL GROUP BY alias conflict detected by real tests. Latest lint/typecheck/unit (9)/integration (13)/build passed. E2E exposed ambiguous field labels, duplicate mobile QR key, and save-navigation refresh race; all corrected. Test URL assertion was also corrected to exclude `/new`. Desktop corrective lifecycle/history, QR preselection and login have passed; final mobile results pending. No failures counted as passes.

No Phase 2 implementation begins until the full Phase 1 browser gate passes. Diagnostic browser script/image are local verification artifacts, not product features.

Phase 1 final browser gate: `npm run test:e2e` passed 6/6 (desktop/mobile corrective, QR, authentication). Step 6 began only after this result.

## Step 6 — PM templates and plans

Completed: ordered interactive checklist builder with CHECK/TEXT/NUMBER/PASS_FAIL, required/fail note/fail photo controls, reusable safety instructions, archived template revisions, fixed date-only plans with all seven frequencies, default technician/team, lead days, active flags, audited edits. Migration `20261007124304_pm_templates_plans` applied/reviewed with template sequence uniqueness and active/next-due indexes.

Verification: lint/typecheck/unit (11)/integration (14)/production build passed. Tests cover month-end/leap-year recurrence, custom intervals/lead window, template revision preservation, inactive-template plan rejection and manager mutation rejection. Next: generation, snapshot execution, calendar and PM summary.

## Step 7 — PM generation and execution

Completed: lead-window manual/scheduled generation, unique occurrence idempotency, transactional checklist/safety snapshot and next-due advancement, assigned technician notification, typed responses, required/numeric/fail-note/fail-photo completion, month/list calendar and PM dashboard summary, PM in relational machine history. Added PM services/routes/UI, protected scheduler CLI and unit/integration/E2E coverage. Migration `20261007125200_pm_generation_checklist` generated via Prisma diff, reviewed and applied with migrate deploy.

Verification: lint/typecheck/unit (13)/integration (15)/build passed after correcting a test's Date comparison to numeric timestamps. Concurrent generation yields one WO and one checklist; old wording remains after template edit; completion fails until required FAIL photo is uploaded. `npx playwright test tests/e2e/pm.spec.ts` passed 2/2 desktop/mobile template → plan → generate → execute → close → history. Seed now contains weekly/monthly/quarterly plans and sample WR/WO statuses. Next: parts/warehouse/stock.

## Step 8 — Parts, warehouse and stock

Completed: part/warehouse CRUD, Decimal quantities, UOM rules, opening/manual receipt and reasoned adjustment, per-warehouse balance, immutable ledger and low-stock list. Migrations `20261007130000_inventory_stock` and `20261007130100_inventory_constraints` reviewed/applied. Ledger INSERT trigger alone changes on-hand; database rejects direct nonzero balance initialization/update and ledger UPDATE/DELETE. Added stock unit/integration tests. Verification: lint/typecheck/unit 15/integration 16/build passed.

## Step 9 — Reservation, issue and return

Completed: transactional reservation/release, FIFO consumption, eligible-state issue, returns bounded by outstanding quantity for the same part/warehouse/WO, cumulative/net usage and automatic reservation release on close/cancel. Migration `20261007130800_reservations_usage` reviewed/applied, with reservation/usage quantity checks. Seed now includes five parts and opening stock posted through the ledger. Actual PostgreSQL tests cover partial consumption/return, terminal release and concurrent last-stock issue: exactly one succeeds. Inventory E2E passed 2/2 desktop/mobile; production build passed. Browser selector mismatches were fixed and rerun, never counted as successful checks.

## Step 10 — Integrated dashboard and history

Completed: inventory KPIs and selected-period ledger aggregates by part/asset/WO, quantities separated by UOM, PM summary including ungenerated next occurrences, part/asset usage navigation, notification ownership/read operation and mobile More menu. Storekeeper home shows inventory. Added integrated report and browser authorization/navigation tests. Initial typecheck exposed nullable system audit actor; fixed. Initial browser denied-mutation test exposed permission checking after asset input validation; moved the check before parsing. Integrated report test and production build passed; final browser rerun in progress.

Step 10 final browser gate: integrated navigation and authorization suite passed 4/4 desktop/mobile.

## Step 11 — Hardening, tests and documentation

Completed: safe QR login callback/invalid recovery; bcrypt UTF-8 byte limit; live authorization and same-Origin tests; private streaming upload size bound and unauthorized photo download tests; optional part images through private storage and exactly-one-parent migration; immutable hierarchy/master kinds/UOM policy; audited terminal downtime end-only correction and preserved form values; stock-preview form validation/accessibility; server pagination for operational stock/PM/user lists; date validation, My Work groups, day/week/month trends and PM recurrence calendar projection; full README/model/API/test/operations/pilot/report/file-inventory documentation. Removed one-off editing/debug scripts and diagnostic images, retained reusable verification/capture scripts.

Migration `20261007134000_part_images_hardening` reviewed/applied, bringing total to 13. Fresh database applied all 13 migrations, seeded, ran integration 19/19 and reconciled onHand plus reserved with zero mismatches. No reset/drop of app data. Verified real desktop dashboard/mobile QR/inventory screenshots. Initial final inventory E2E failed because new native select labels included option text in locator matching; explicit aria-labels fixed it, individual rerun 2/2 and entire final suite 18/18 passed. Verification script NODE_ENV inferred type was fixed; final lint/typecheck/build passed.

Final results: lint zero warnings; typecheck passed; unit 18/18; PostgreSQL integration 19/19; E2E 18/18 desktop/mobile; production build passed; production localhost3001 smoke login/dashboard/asset API/QR/inventory passed. Temporary production smoke server stopped; development app and database remain available on localhost3000/54329. Production audit 0 vulnerabilities; full audit 5 high dev-tool findings tracked. Physical camera/printer, pilot-host backup restore and load test remain manual deployment acceptance, explicitly documented.

Steps 0–11 source and automated verification complete. Recommended next step: run PILOT_TEST.md with actual plant data and hardware.
