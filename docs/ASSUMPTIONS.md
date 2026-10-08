# Assumptions

1. Specification §79 supersedes the master prompt's coarser step numbering. No functional scope is changed.
2. Pilot is one organization with an extensible site hierarchy; no SaaS tenant engine. Every active account can access pilot sites, with role and ownership restrictions enforced on the server.
3. A technician sees only assigned WOs and the related requests. Requesters see their requests and a minimal asset identity projection. Technicians do not issue/return stock in the initial policy; storekeepers/admin perform these operations. This selects the specification's optional limited permission conservatively.
4. ADMIN has all defined permissions. Supervisors handle maintenance approval and reservation, but cannot adjust/issue stock. MANAGER_VIEWER is read-only, including comments and uploads.
5. Credentials are provisioned by admin; no registration/password-email workflow. Configurable session expiration; inactive accounts invalidate subsequent access.
6. UTC timestamps, Bangkok display and date boundaries. PM date-only schedules use Bangkok calendar dates. Monthly recurrence clamps to the last valid day; fixed scheduling advances from previous planned date. No completion-based schedule shifting.
7. Closing/cancelling a WO releases remaining reservations transactionally. Closing with open downtime requires explicit warning acknowledgement. Completed/closed/cancelled records reject execution changes.
8. One primary downtime per corrective WO; a stopped request's failure timestamp is carried into downtime upon conversion. Downtime may be explicitly ended; completion does not imply machine recovery.
9. File limit defaults to 10 MB. Local private filesystem storage is the development provider; authorized streaming routes serve files. No binary in PostgreSQL or publicly guessable static upload directory.
10. The protected Generate Due PM action is the baseline scheduler fallback. A server CLI/scheduled trigger can invoke the same service; no queue infrastructure is required.
11. Production requires an externally provisioned PostgreSQL database and HTTPS. No existing database connection was supplied. Local disposable PostgreSQL may be used for verification if available without Docker; credentials stay in ignored .env.
12. Seed/demo passwords are development-only. Seed always refuses NODE_ENV=production. Business codes are generated centrally; supplied MP/BRG examples may be retained as readable imported seed codes.
13. Dashboard corrective counts use WO creation timestamps; completion uses actualEndAt, downtime uses overlap with the selected period, PM uses scheduled due date, and inventory uses ledger posting time. Cancelled PM is excluded from completion rate denominator.
14. No Git metadata exists initially. Do not initialize/publish a repository or fabricate commits; document logical checkpoints in files.

No assumptions authorize Phase 4+ features. Any unresolved choice changing core business behavior must be recorded and escalated before that sub-feature proceeds.


15. Low-stock inventory ownership is based on initialized part/warehouse balances. Parts not yet stocked in any warehouse remain in the master list; create opening stock or an explicit balance before warehouse-level monitoring.
16. Inventory returns after closed/cancelled WO remain allowed only up to the original outstanding issue and are new audited ledger entries. Maintenance execution stays immutable.
17. A supervisor may end existing open downtime after terminal WO with an audited reason, preserving its start. Completion/close never silently means machine recovery.
18. Inventory chart period is ledger posting date and may show negative net usage where earlier issues are returned in a later period. Usage history is cumulative and uses usage creation date for its optional range filter.
19. PM calendar projects the saved fixed recurrence within the selected month; KPI due/overdue includes the next ungenerated occurrence, and completion rate is based on generated due WOs with cancelled excluded.
# UI reference assumptions — October 7, 2026

- The requested React Native / Flutter / Tailwind examples are satisfied by working React + Tailwind components in the existing Next.js project. The application remains one responsive web codebase.
- Use PlantCare's existing identity, not the reference's MaintPro logo, illustrations or sample metrics.
- Mobile navigation uses Home, Equipment, Work, Parts and Profile. Requesters see their work requests in Work; Parts is omitted when their role lacks inventory access and replaced with QR scanning.
- Profile is a session summary and existing-menu directory; it does not introduce account editing, purchasing or notification settings.
- Area/category chips are built from active master data instead of hard-coded sample factory names.
- The assignment step uses the existing assign operation after creation. If assignment/upload fails, retain the created work order and allow retry without creating a duplicate.
