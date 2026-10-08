# Codex Master Build Prompt
## CMMS Phase 1–3

Use this prompt together with:

- `CMMS_PHASE_1_2_3_SPEC.md` — **Source of Truth**
- `PM.txt` — business context and product vision reference
- UI reference image(s) — visual and workflow reference

Do **not** use any older full-system specification as the authoritative scope if it includes Phase 4+ features.

---

# Your Role

Act as a senior full-stack software engineer, software architect, database engineer, QA engineer, and implementation owner.

Your task is to build a production-capable pilot version of a **Computerized Maintenance Management System (CMMS)** containing **Phase 1, Phase 2, and Phase 3 only**.

You must prioritize:

1. business correctness,
2. data integrity,
3. maintainable architecture,
4. real operational usability,
5. responsive mobile/desktop UX,
6. testability,
7. visual quality.

Do not optimize for showing many features. Optimize for a reliable working system.

---

# Source Priority

Read all supplied files before changing code.

Use this priority order:

1. `CMMS_PHASE_1_2_3_SPEC.md`
2. explicit instructions from the user in the current task
3. `PM.txt`
4. supplied UI reference images
5. existing repository conventions, where they do not conflict with the specification

If two sources conflict, follow the higher-priority source.

Do not infer that a feature is in scope merely because it appears in the reference poster/image.

---

# Mandatory Scope

Implement:

## Phase 1

- Authentication
- Users and roles
- Organization/Site/Area/Location foundation
- Asset Management
- Asset QR
- Work Request
- Corrective Work Order
- Technician Assignment
- Work Order state machine
- Downtime
- Photos / Attachments
- Comments
- Activity Timeline
- Machine History
- Basic Dashboard
- Audit Log

## Phase 2

- PM Template
- PM Checklist Template
- PM Plan
- Calendar-based recurrence
- PM schedule / next due
- PM Work Order generation
- PM checklist snapshot and execution
- PM Calendar
- Due / Overdue
- PM History
- PM Dashboard summary

## Phase 3

- Part Master
- Warehouse
- Stock Balance
- Stock Transaction Ledger
- Part Reservation
- Issue to Work Order
- Return from Work Order
- Stock Adjustment
- Low Stock
- Work Order Part Usage
- Part Usage History
- Inventory Dashboard summary

---

# Explicitly Do Not Implement

Do not build any of the following unless the user later asks for them:

- Docker as a mandatory dependency
- microservices
- Kubernetes
- Redis
- BullMQ
- Kafka
- MQTT
- IoT
- Predictive Maintenance
- AI / ML
- RCA / CAPA
- Purchase Request
- Purchase Order
- Supplier Management
- ERP integration
- SCADA integration
- advanced cost accounting
- MTBF/MTTR/OEE analytics
- native iOS/Android apps
- offline synchronization engine
- SaaS subscription/billing
- complex multi-tenant architecture
- workflow builder
- LINE/Slack/Teams integrations

Do not create placeholder pages for these features.

---

# Required Technical Direction

Use a **Next.js full-stack modular monolith**.

Preferred stack:

```text
Next.js 16+
React 19+
TypeScript strict
PostgreSQL
Prisma ORM
Tailwind CSS
shadcn/ui
React Hook Form
Zod
Recharts
Auth.js-compatible authentication
Playwright
Vitest or Jest
```

Use the repository's compatible current versions if a project already exists.

Do not upgrade unrelated dependencies without a reason.

---

# Docker Policy

Docker is **optional**.

The application must work without Docker.

Expected local developer flow:

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Assume PostgreSQL is available either locally or through a managed development database.

Do not add Docker Compose unless the user specifically requests it.

---

# Before Writing Code

Perform these steps first.

## 1. Inspect Repository

Review:

- directory structure,
- package.json,
- existing dependencies,
- coding style,
- authentication,
- database setup,
- UI components,
- tests,
- environment files,
- any existing pages/modules.

Do not overwrite working code unnecessarily.

## 2. Read the Entire Specification

Read `CMMS_PHASE_1_2_3_SPEC.md` fully.

Do not skim only the feature list.

Pay special attention to:

- status transitions,
- permission matrix,
- inventory rules,
- PM generation,
- transaction requirements,
- acceptance criteria.

## 3. Inspect UI References

Use the images to understand:

- navigation style,
- mobile layout,
- dashboard hierarchy,
- equipment list/detail,
- work-order interaction,
- PM checklist,
- QR flow,
- spare-part list.

Create an original interface inspired by the references.

Do not copy logos or branding.

## 4. Create Implementation Plan

Before code changes, produce a plan in the response and save/update:

```text
docs/IMPLEMENTATION_PLAN.md
```

Break work into:

```text
Step 0 Foundation
Step 1 Auth/User/Location
Step 2 Asset/QR
Step 3 Work Request
Step 4 Work Order/Downtime
Step 5 History/Dashboard
Step 6 PM
Step 7 Inventory
Step 8 Cross-module integration
Step 9 Testing/Hardening
```

## 5. Record Assumptions

Create:

```text
docs/ASSUMPTIONS.md
```

Use the smallest reasonable assumption.

Do not invent large business processes.

## 6. Record Architecture Decisions

Create:

```text
docs/DECISIONS.md
```

Record important choices such as:

- authentication strategy,
- file storage strategy,
- code-number generation,
- PM scheduler mechanism,
- inventory concurrency strategy.

---

# Architecture Rules

Use domain modules such as:

```text
modules/auth
modules/users
modules/locations
modules/assets
modules/work-requests
modules/work-orders
modules/downtime
modules/pm
modules/inventory
modules/dashboard
modules/audit
modules/files
```

Keep:

- UI separate from domain logic,
- validation separate from components,
- business operations in services,
- database operations server-side,
- authorization server-side.

Avoid a single giant `actions.ts`, `page.tsx`, or service file.

---

# Database Rules

Use Prisma migrations.

Do not rely on production `db push`.

Use:

- stable internal IDs,
- human-readable business codes,
- indexes for operational filtering,
- foreign keys,
- unique constraints,
- enum constraints where appropriate,
- audit timestamps.

Do not hard-delete records that are referenced by maintenance history.

Use `is_active` / archival patterns for masters.

---

# Business Code Generation

Implement central business-code generation for:

```text
AST-000001
WR-YYYY-000001
WO-YYYY-000001
PM-000001
PRT-000001
```

Generation must be safe against duplicate concurrent creation.

If you choose a different format, preserve readability and document it.

---

# Work Order State Machine — Mandatory

Use:

```text
OPEN
ASSIGNED
IN_PROGRESS
PAUSED
WAITING_PART
COMPLETED
CLOSED
CANCELLED
```

Allowed transitions:

```text
OPEN -> ASSIGNED
OPEN -> CANCELLED

ASSIGNED -> IN_PROGRESS
ASSIGNED -> OPEN
ASSIGNED -> CANCELLED

IN_PROGRESS -> PAUSED
IN_PROGRESS -> WAITING_PART
IN_PROGRESS -> COMPLETED

PAUSED -> IN_PROGRESS
PAUSED -> CANCELLED

WAITING_PART -> IN_PROGRESS
WAITING_PART -> CANCELLED

COMPLETED -> IN_PROGRESS
COMPLETED -> CLOSED
```

No normal transition out of:

```text
CLOSED
CANCELLED
```

Implement a centralized server-side transition validator.

Do not let pages update the status column directly.

---

# Work Request Conversion — Mandatory

Conversion must be atomic:

```text
BEGIN
validate request not previously converted
create work order
update work request to CONVERTED
link converted_work_order_id
write audit/activity
COMMIT
```

Duplicate conversion must be impossible.

---

# Downtime Rules

- support active/open downtime,
- calculate duration server-side,
- prevent end before start,
- warn before closing WO if downtime remains open,
- do not require downtime when machine did not stop.

---

# PM Rules — Mandatory

PM is calendar-based in this release.

Supported frequency:

```text
DAILY
WEEKLY
MONTHLY
QUARTERLY
SEMI_ANNUAL
ANNUAL
CUSTOM_DAYS
```

Use a fixed schedule by default.

PM generation must be idempotent.

Prevent duplicates using:

```text
pm_plan_id + scheduled_due_date
```

When generating PM WO:

1. create PREVENTIVE WO,
2. copy/snapshot checklist items,
3. set due date,
4. apply default technician if configured,
5. advance PM next due,
6. write audit/activity.

Perform the operation transactionally.

Checklist history must not change when the PM template is edited later.

---

# Inventory Rules — Mandatory

The stock ledger is authoritative.

Never let normal application code directly edit a balance without an inventory operation.

Stock transaction rows are immutable after posting.

Supported operations:

```text
INITIAL
RECEIPT_MANUAL
ISSUE
RETURN
ADJUST_IN
ADJUST_OUT
```

Reservation must affect available quantity:

```text
available = on_hand - reserved
```

Prevent:

- negative on-hand,
- reservation over available,
- issue over stock,
- return over net issued.

Use database transactions and concurrency-safe stock updates.

Do not calculate the final balance in the browser and send it back.

---

# Permission Rules

Authorization must be checked on the server.

Hiding a UI button is not sufficient.

Implement roles and permissions defined in the specification.

At minimum verify:

- requester cannot close WO,
- technician cannot perform admin changes,
- storekeeper can manage inventory but not maintenance approval,
- manager role is read-only,
- supervisor can manage operational maintenance.

---

# File Upload Rules

Support:

```text
JPG
JPEG
PNG
WEBP
PDF
```

Validate:

- MIME,
- extension,
- size.

Use a storage provider abstraction.

Local storage is acceptable for development.

Do not store file binary in PostgreSQL.

---

# QR Rules

Each asset must have a stable unique QR token.

Use:

```text
/qr/{token}
```

QR should identify the application route, not expose private data.

Mobile flow:

```text
Scan QR
-> Asset Quick View
-> View Asset OR Report Problem
```

---

# UI Requirements

Build one responsive application, not separate desktop and mobile codebases.

## Desktop

Use:

- sidebar,
- top header,
- searchable/filterable tables,
- dashboard cards/charts.

## Mobile

Use:

- top app bar,
- bottom navigation,
- card lists,
- large touch targets,
- sticky primary actions where useful.

Prioritize mobile UX for:

- QR
- Work Request
- My Work
- Work Order execution
- PM checklist
- Part issue/return

Use Thai for primary user-facing labels initially.

Technical identifiers remain English.

---

# Dashboard Scope

Do not create advanced analytics.

Build only operational KPIs defined in the specification.

Phase 1:

- Assets
- Open Requests
- Open WO
- In Progress
- Completed
- Overdue
- Downtime
- WO by Status
- Breakdown by Asset
- Breakdown by Area
- Technician workload

Phase 2:

- PM Due
- PM Overdue
- PM Completion Rate

Phase 3:

- Low Stock
- Critical Low Stock
- Top Parts Used
- Parts Usage by Asset/WO

All values must come from real transactional data.

---

# Seed Data

Implement realistic development seed data exactly or equivalently to the specification.

Include:

- organization,
- site,
- areas,
- locations,
- users in all roles,
- 5+ assets,
- 5+ spare parts,
- PM plans,
- sample work requests,
- sample WOs,
- several statuses,
- stock.

The application must look usable immediately after seed.

---

# Test Requirements

Do not defer all tests to the end.

Add tests as each service is built.

## Unit

Cover:

- WO transition validator,
- downtime calculation,
- PM recurrence,
- PM duplicate prevention logic,
- checklist completion validation,
- stock availability,
- issue validation,
- return validation,
- low-stock rule.

## Integration

Cover:

- Request -> WO conversion,
- WO execution lifecycle,
- PM generation,
- inventory reserve/issue/return,
- authorization.

## E2E

At minimum implement:

### Corrective

```text
Requester logs in
Creates request
Supervisor converts
Assigns technician
Technician starts/completes
Supervisor closes
History shows result
```

### PM

```text
Create template
Create plan
Generate WO
Execute checklist
Close
Verify history
```

### Inventory

```text
Create/open stock
Reserve
Issue
Return
Check balance and ledger
```

### QR

```text
Open QR route
Correct asset shown
Create request
```

---

# Required Commands Before Completion

Identify the repository's scripts and run the equivalent of:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Also run E2E if configured.

Do not state that the implementation is complete if these fail.

Fix failures first unless blocked by infrastructure outside the repository.

---

# Database Verification

After migrations:

- inspect generated schema,
- verify unique constraints,
- verify indexes,
- verify foreign keys,
- verify stock constraints,
- seed database,
- exercise key flows.

Do not simply assume migrations are correct because Prisma generated them.

---

# Security Verification

Check:

- password hashes never returned,
- protected routes,
- server permissions,
- no secrets committed,
- no unsafe file types,
- no unvalidated status updates,
- no direct stock manipulation,
- basic login abuse mitigation if practical.

---

# Implementation Sequence

Even though the requested delivery contains Phase 1–3, implement in this exact dependency order.

## Step 0 — Foundation

Build:

- project shell,
- DB,
- auth,
- permission helper,
- layout,
- shared UI,
- audit helper,
- storage adapter,
- testing baseline.

Run tests/build.

## Step 1 — User + Location

Build:

- users,
- roles,
- organization/site/area/location,
- admin UI.

Run tests/build.

## Step 2 — Asset + QR

Build:

- asset CRUD,
- filters,
- detail,
- QR generation,
- QR route,
- mobile quick view.

Run tests/build.

## Step 3 — Work Request

Build:

- create,
- list,
- detail,
- triage,
- reject,
- convert.

Run tests.

## Step 4 — Work Order

Build:

- list,
- My Work,
- assign,
- state machine,
- execution,
- photos,
- comments,
- timeline,
- completion,
- rework,
- close.

Run tests.

## Step 5 — Downtime + History + Dashboard

Build:

- downtime,
- asset history,
- operational dashboard.

At this point Phase 1 must be fully usable.

Run full Phase 1 E2E.

## Step 6 — PM

Build:

- templates,
- checklist builder,
- plans,
- scheduling,
- generation,
- PM WO,
- checklist execution,
- calendar,
- dashboard.

Run Phase 2 E2E.

## Step 7 — Inventory

Build:

- parts,
- warehouses,
- balances,
- stock ledger,
- reservation,
- issue,
- return,
- adjustment,
- low-stock,
- usage screens.

Run Phase 3 E2E.

## Step 8 — Integration

Verify:

- parts on WO,
- PM on asset history,
- parts on asset history,
- dashboard links,
- permission interactions,
- mobile navigation.

## Step 9 — Hardening

Complete:

- test gaps,
- error states,
- empty states,
- pagination,
- accessibility,
- performance indexes,
- documentation,
- production build.

---

# Commit / Checkpoint Strategy

If Git access is available, use logical commits/checkpoints such as:

```text
feat: establish CMMS foundation and auth
feat: add asset management and QR flow
feat: add work request workflow
feat: add corrective work order lifecycle
feat: add downtime history and dashboard
feat: add preventive maintenance module
feat: add spare parts inventory module
test: add critical CMMS e2e coverage
chore: harden production build and docs
```

Do not create one giant unreviewable commit if avoidable.

---

# Documentation Required

Maintain:

```text
README.md
docs/IMPLEMENTATION_PLAN.md
docs/ASSUMPTIONS.md
docs/DECISIONS.md
docs/DATA_MODEL.md
docs/API.md
docs/TEST_PLAN.md
```

README must include:

- prerequisites,
- environment setup,
- PostgreSQL setup,
- migrations,
- seed,
- dev server,
- tests,
- build,
- seeded login accounts,
- deployment notes.

---

# Do Not Hide Problems

If blocked:

1. state the exact blocker,
2. show what is already complete,
3. show what command failed,
4. show the relevant error summary,
5. propose the smallest next fix.

Never fabricate test success.

Never claim a screen/function is complete if only static UI exists.

---

# Completion Standard

The application is complete only when:

- the three phases work end to end,
- the business rules are enforced server-side,
- migrations exist,
- seed works,
- roles work,
- status rules work,
- PM generation is duplicate-safe,
- stock is transaction-safe,
- critical tests pass,
- responsive mobile flows are usable,
- production build succeeds,
- documentation is sufficient for another developer to run the project.

---

# Final Response Format

When the work is complete, return:

```markdown
# CMMS Phase 1–3 Implementation Report

## 1. Summary
What was implemented.

## 2. Phase 1
Detailed completed functions.

## 3. Phase 2
Detailed completed functions.

## 4. Phase 3
Detailed completed functions.

## 5. Architecture
Actual resulting architecture and key decisions.

## 6. Database
Migrations/tables/constraints/indexes.

## 7. Security and Permissions
What was enforced.

## 8. Tests
Tests added and scenarios covered.

## 9. Commands Run
Exact commands and results.

## 10. Seed / Demo Accounts
How to test.

## 11. Known Limitations
Anything intentionally excluded or not complete.

## 12. How to Run
Exact steps.

## 13. Recommended Pilot Test
What the user should test first.
```

---

# Start Now

First, do **not** immediately generate large amounts of code.

Start by:

1. reading all supplied files,
2. inspecting the repository,
3. writing the implementation plan,
4. identifying any conflicts or gaps,
5. recording assumptions,
6. then implementing Step 0.

Continue through Steps 1–9 without adding Phase 4+ scope.

Use the specification as the final authority.
