# Architecture Decisions

## ADR 001 — Stack and boundaries

Next.js 16+, React 19+, TypeScript strict, PostgreSQL and Prisma. Domain modules follow specification §5. Tailwind, reusable shadcn-style primitives, Lucide, Zod, React Hook Form, Recharts, Vitest, Playwright. Pin resolved versions in lockfile. Verify installed documentation when choosing version-sensitive APIs. No Docker or later-phase infrastructure.

## ADR 002 — Authentication and authorization

Credentials authentication with secure password hashing and an Auth.js-compatible session boundary. Prefer Auth.js credentials/JWT integration where supported; database account activity and role are rechecked on each protected request. Server permission constants and record-scope checks are mandatory. Framework server actions enforce origin protection; explicit write handlers verify same-origin. Session token/cookie is HttpOnly, SameSite, secure on HTTPS. Password hashes and authentication secrets never enter client DTOs or audits.

## ADR 003 — Transaction-safe numbering and operations

A PostgreSQL-backed counter increment inside the same transaction creates unique AST, WR-year, WO-year, PM, PRT codes. Unique DB indexes remain the final duplicate guard. Conversion, assignment/state changes, PM generation, and inventory postings include audit/activity in their transaction. Concurrency uses serializable transactions with bounded retry or documented row locks/conditional updates.

## ADR 004 — PM scheduling and historical evidence

Date-only fixed planned recurrence, Bangkok calendar. Generate within leadDays; unique (pmPlanId, scheduledDueDate). Snapshot checklist labels, validation options and safety instructions on creation. Template edits never modify execution evidence. Manual protected generation and an optional scheduled invocation share one service. No Redis/BullMQ.

## ADR 005 — Inventory integrity

Decimal-safe PostgreSQL/Prisma numeric values, no client balance writes. Immutable ledger is authoritative; transactional balance cache has DB checks (onHand >= 0, reserved >= 0, reserved <= onHand). Reserve/issue/return lock or serialize all related balance/reservation/usage changes. Return is bounded per WO/part/warehouse. Ledger mutation is rejected by a database trigger as well as absent API. Terminal WO releases active reservation atomically.

## ADR 006 — Files and audit

StorageProvider upload/delete/getUrl interface; private local development storage and authenticated retrieval. Validate extension, MIME, size and content signature. Random keys protect against traversal; metadata links to authorized records. Audit only sanitized business fields and critical changes; comments append-only, terminal maintenance evidence immutable in normal workflows.

## ADR 007 — Operational queries and UX

Server filtering/pagination (25 default, 100 max), stable sorting and relational history. Date rules: corrective createdAt; completed actualEndAt; downtime interval overlap; PM scheduledDueDate; inventory createdAt. Thai UI, English technical identifiers, original blue/orange industrial identity, accessible status text, responsive single layout. No dummy dashboard values.

## ADR 008 — Verification and release gates

Step reports record exact commands and results. Unit tests accompany rules; integration tests use PostgreSQL for transaction/constraint/concurrency behavior; Playwright validates role-based critical flows and mobile. Production build must succeed. Never substitute mocks for claims of database verification. Missing infrastructure is a documented blocker and prevents claiming a completed phase.

## ADR 009 — Version resolution and PostgreSQL reports

Resolved Next.js 16.4.0, React 19, Prisma 7.10.0 with driver adapter and prisma.config.ts. Prisma 8 is currently a release candidate, so use stable 7. Runtime setup follows [Prisma PostgreSQL adapter documentation](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql); async framework cookie APIs follow [Next.js cookies documentation](https://nextjs.org/docs/app/api-reference/functions/cookies).

Dashboard uses parameter-bound PostgreSQL SQL for aggregate groups and interval overlap calculations, avoiding transfer of the entire maintenance history. This is justified raw SQL for reporting, not a bypass of domain mutation services. Downtime reports split ended/ongoing time and clip each interval to the selected Bangkok date range. SQL aggregation is covered by a real PostgreSQL integration test.

Dependency audit overrides deepmerge-ts 8.0.2 and mysql2 3.24.5 fix available transitive findings without downgrading Next/Prisma. The unpatched braces ≤3.0.3 build-tool chain remains tracked as a release limitation; do not force npm's unrelated downgrade recommendation.

## ADR 010 — Ledger-driven balance cache

PostgreSQL AFTER INSERT ledger trigger posts on-hand changes to the matching balance. A balance guard rejects direct nonzero opening balances and direct on-hand changes; immutable ledger trigger rejects UPDATE/DELETE. Domain services validate business permission, quantity/UOM and availability and append the ledger inside serializable transactions. Reservation changes affect reservedQty, not the on-hand ledger. Check constraints enforce nonnegative/reserved bounds and required adjustment reasons. This raw SQL belongs in versioned Prisma migrations and ensures seed/import operations cannot silently bypass ledger posting.

PM unique-index migration required Prisma migrate diff followed by migrate deploy because migrate dev refused a uniqueness warning in the noninteractive runner. Generated SQL was inspected before applying; no data reset or db push was used.

## ADR 011 — Integrated operational reporting

Inventory reports aggregate signed ISSUE/RETURN ledger entries by posting date and group quantities by UOM; no accounting valuation or mixing pieces/litres. Low-stock KPI counts distinct active parts having a low initialized balance in an active warehouse; details retain warehouse pairs. Uninitialized part/warehouse combinations do not imply inventory ownership. Usage history exposes cumulative totals per WO/part/warehouse and can filter usage creation dates. Asset history remains relational.

PM calendar projects fixed planned dates from the saved next due and frequency, and displays generated WOs separately without duplicating matching occurrences. Summary uses Monday–Sunday Bangkok week; current next ungenerated occurrence is included in due/overdue. Completion rate uses generated PM due in selected period, excludes cancelled records; completed-this-month uses actualEndAt. Manual/scheduled job handles one next occurrence per eligible plan per invocation, up to 500 plans. Retries are safe; backlog requires repeat invocations.

## ADR 012 — QR return and terminal corrections

Next 16 proxy supplies a server-owned path header to preserve the requested QR route at login. Callback sanitizer allows only same-origin relative paths and rejects backslashes/protocol-relative URLs; live authorization remains in page/API services. Implementation follows [Next proxy request-header documentation](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

Closed execution/evidence remains immutable. A supervisor can end an existing open primary downtime after terminal WO, with reason and audit, preserving start; machine recovery is not inferred from completion. Stock returns after terminal WO are append-only reversals bounded by original issue in the same warehouse; they do not reopen the WO. Optional part images reuse private Attachment storage and the exactly-one-parent database check.

## ADR 013 — Fresh database verification and release scope

A restricted localhost verification script creates a new UTF-8 database, applies the complete migration chain, seeds, runs actual integration tests and reconciles ledger/reservation balances. It never resets/drops the app database. No Git metadata existed; checkpoint documentation replaces commits. Production dependency audit reports zero findings; five high development-tool findings remain in the unpatched braces chain. Physical camera/printing, backup restore with standard PostgreSQL client tools and load testing are pilot-host checks, not claimed automated passes.
# UI architecture decisions — October 7, 2026

- Shared CSS/Tailwind tokens: primary #FF6B00, navy #1E293B, canvas #F8FAFC, 12–16px cards, 44px minimum controls. Orange CTAs use dark foreground for readable contrast; semantic badges also include text.
- Server Components own authenticated queries and role-scoped data. Small Client Components own pathname highlights, form steps, selected calendar day, charts and camera lifecycle.
- Filters and pagination remain URL state with server-side queries; React Hook Form owns transient creation fields. No global state/store dependency is added.
- Work Order creation retains the existing create/assign/file endpoints and centralized domain validators. Multi-step UI changes presentation only; partial follow-up failures are recoverable.
- Operational charts continue to use existing report calculations; a donut presents WO status distribution, not fabricated categories or advanced reliability analytics.
