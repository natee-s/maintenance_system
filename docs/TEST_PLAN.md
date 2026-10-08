# Test plan and evidence

## Automated coverage

Unit: permission boundaries, valid/invalid WO transitions, upload signature/MIME/size/traversal protection, downtime duration, PM month-end/leap-year/frequency/lead rules/month projection, typed/required/fail checklist validation, Decimal issue/return/low-stock, safe redirects and bcrypt UTF-8 length.

PostgreSQL integration: secure/inactive credentials, concurrent business codes, audit secret scrubbing, user administration, matching location/master references, QR stability and requester projection, concurrent request conversion/ownership/reasons, assign/start/pause/resume/complete/rework/close, open downtime warning and audited supervisor recovery, template revision preservation, concurrent PM occurrence generation/snapshot/fail-photo rules, ledger immutability/direct-balance rejection/rollback/Decimal arithmetic, reservation consumption/terminal release/bounded returns and concurrent last-stock issuance, report queries and notification ownership.

Browser: corrective request → convert → assign → technician execute → supervisor close → machine history; QR asset/request preselection; PM template → plan → generate → mobile checklist → complete/close/history; part master → opening stock → reserve → issue → return → balance/ledger; five-tab mobile navigation/profile menu; role-specific home; foreign-origin/manager/requester denial; logged-out QR callback/invalid recovery; private photo upload and unauthorized requester/unassigned-tech download. UI refresh adds wizard validation/confirm/no premature creation, recoverable assignment failure without duplicate WO, attached evidence, selected PM day/month/view, scanner invalid-token recovery and mobile role/layout checks.

## Commands and latest results

| Command | Result |
|---|---|
| npm run lint | Passed; zero warnings after final fixes |
| npm run typecheck | Passed |
| npm test | 18 passed, 7 files |
| npm run test:integration | 19 passed, 11 files, actual PostgreSQL |
| npm run test:e2e + npm run test:e2e -- --last-failed | All 24 scenarios passed across full run (21) and targeted rerun (3); desktop Chromium + Pixel 7 viewport |
| npm run build | Passed |
| next start -p3001 + production-smoke | Passed login/dashboard/asset API/QR/inventory; temporary server stopped |
| npm run verify:database | Passed all 13 migrations/seed/19 integration tests on a separate fresh UTF-8 DB, zero ledger/reservation balance mismatches |
| npm audit --omit=dev | 0 vulnerabilities |
| npm audit | 5 high findings in braces → micromatch/fast-glob → eslint-config-next development tooling; available override fixes applied, no forced unrelated downgrade |

Playwright is Chromium desktop + Pixel 7 viewport, one worker. Device viewport tests do not prove physical camera or all mobile browser behavior. Install Chromium once with `npx playwright install chromium`. Start dev server explicitly if the managed webServer cannot start. PostgreSQL/Next/test tools in this Windows sandbox required approved outside-sandbox execution for localhost/network/temporary rename operations.

UI refresh verification: lint/typecheck/build passed. The final three reruns passed after scoping the wizard alert to main content (excluding Next's route announcer), matching the image link's accessible name, and allowing 15 seconds for assertions during cold development-route compilation. This timeout is test configuration, not a change to application response-time requirements. No schema migration or new dependency was needed.

Tests mutate a disposable database. E2E uses localhost:3000 with seeded demo users; do not target live records. `verify:database` is restricted to localhost port54329, creates a new cmms_verify_<timestamp> database and preserves the app database. No mock database is substituted.

Historical failures are recorded in PROGRESS.md: encoding, selectors, typing and navigation refresh issues were corrected and rerun. Only latest actual passes count as evidence.

## Manual verification still required for deployment

Physical Android/iOS QR camera permissions over HTTPS, printed QR readability, shop-floor lighting and touch use; production PostgreSQL + private-storage backup restore; user acceptance with actual master data; load/latency on intended hosting hardware. See PILOT_TEST.md and OPERATIONS.md. No actual printer/camera hardware or external hosting was supplied.

