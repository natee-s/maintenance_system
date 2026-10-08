# UI verification

## UI refresh — orange/navy mobile screen flow

Reviewed actual authenticated screenshots produced by `npx tsx scripts/capture-ui-refresh.ts`: desktop dashboard, mobile dashboard (all four main KPIs visible), equipment list/detail, parts, PM calendar, scanner, profile, three work-order steps and operational donut chart. Screenshots are `ui-refresh-*.png` in this directory. The capture checks overflow at 390px and 360px for the main mobile routes. Captured forms were not submitted.

The application uses #FF6B00 / #1E293B / #F8FAFC, rounded cards, semantic text badges, five mobile tabs, collapsible advanced filters, active chips, calendar day selection, checklist progress/evidence controls and camera framing. Equipment/part photographs render when real authorized attachments exist; missing photographs use icons.

Playwright covers the complete corrective/PM/inventory workflows and the new three-step form's partial-failure recovery. All 24 scenarios passed across a full run and the final three targeted reruns. Unit (18), integration (19), lint, typecheck and production build passed. Physical camera permission/scanning, iOS Safari and a production device pilot remain manual checks.

Architecture, state ownership and reusable Tailwind code are documented in `UI_ARCHITECTURE.md`. No native mobile project, additional dependencies, Docker or database migrations were introduced.

## Original Phase 1–3 captures

Captured actual localhost application with seeded/test records using `npx tsx scripts/capture-ui.ts`. Reviewed all three images: desktop sidebar/header/filter/KPI layout and mobile QR/inventory cards fit the viewport; Thai labels and touch actions are readable, no horizontal overflow observed in captured views. The Next development indicator is visible only because capture used dev mode.

- `ui-dashboard-desktop.png`: maintenance and PM KPI/filter layout at 1440×1000.
- `ui-qr-mobile.png`: asset identity, state and report-issue action at Pixel 7 viewport.
- `ui-inventory-mobile.png`: stock navigation, search and part cards at Pixel 7 viewport.

Full corrective/PM/inventory interactions, mobile navigation and role changes are verified by Playwright. These images are visual QA evidence, not physical camera/printer or all-browser verification. Original references were used as visual/business context only; specification defines behavior.
