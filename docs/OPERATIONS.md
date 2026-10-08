# Pilot operations

## Environment

Node 24 LTS, PostgreSQL UTF-8 and persistent private attachment storage. APP_URL/AUTH_URL must match the HTTPS origin; AUTH_SECRET must be generated securely and kept outside source control. Set SESSION_MAX_AGE_HOURS, MAX_UPLOAD_MB and LOCAL_STORAGE_PATH explicitly. The implemented storage driver is local; STORAGE_DRIVER in the example is reserved for configuring a later provider, not an implemented S3 connection. APP_TIMEZONE/site timezone are documented as Bangkok for this pilot; multi-timezone calculations are outside this release's policy.

Use a least-privilege application database role for production. It needs table DML, sequence/function usage and access to the trigger-owned objects, but not schema DDL or superuser. Run reviewed migrations with a separate migration owner. Do not grant operators direct SQL access; operational writes use domain services. Store files outside Next public/static folders. Set directory ACL to the service account and backup account.

## Deploy and update

Install locked dependencies with npm ci, generate Prisma, apply `npm run db:deploy`, build, run `npm start` behind HTTPS. Migrate before starting code that references new columns. Back up before an update. No schema reset or db push on live data. Do not run demo seed on live records. Create actual accounts through admin and archive demo accounts after verifying another active admin exists.

Project-local embedded PostgreSQL is for development verification, bound to 127.0.0.1:54329 with SCRAM and ignored random credentials. Its bundled Windows runtime does not include pg_dump/pg_restore. Install standard PostgreSQL client tools on the pilot host for logical backups; do not mistake copying a running cluster folder for a backup.

## Backup and restore procedure

Schedule daily database and attachment backups with retention agreed by the pilot owner (suggested 14 daily + 8 weekly), encrypted access-controlled storage on another disk/host. Back up secret configuration separately. Pause writes or use a maintenance window so database Attachment metadata and storage files are from the same recovery point.

Use `pg_dump --format=custom --file=<dated-backup.dump> --dbname=<connection supplied securely>` with a client version compatible with the server. Supply credentials through a protected pgpass file or secure process environment; avoid including passwords in terminal history. Copy private storage in the same window with timestamps and a manifest of size/hash. Record migration version and application build.

Restore only into a new empty database: createdb with UTF-8, then `pg_restore --exit-on-error --dbname=<new-database> <backup.dump>`. Restore matching storage into a separate private directory. Point an isolated app instance at those restored resources. Verify user login, asset QR, closed WO/history, PM snapshot and photo download. Reconcile onHand against signed ledger and reserved against active/partial reservations; verify immutable ledger and absence of negative balances. Compare file manifest with Attachment keys. Record recovery time and recovered snapshot age. Never restore over the live database during a practice drill.

Fresh migration/seed/constraint/reconciliation verification was executed, as recorded in FRESH_DATABASE_VERIFICATION.json. A pg_dump/private-storage restore drill has not been executed in this workspace because the bundled development runtime has no logical backup client; it remains a required pilot-host acceptance step.

## PM scheduler and failures

Run `npm run pm:generate` with PM_RUN_AS an active admin/supervisor account using Windows Task Scheduler or host cron. Use the same private environment as the application. Each occurrence is atomic and has a unique plan/date key. Retrying is safe. One invocation handles at most 500 plans and the next due occurrence per plan; invoke repeatedly for historical backlog. An invalid plan stops the invocation with failure after preceding successful occurrences; inspect the plan/master/assignee, correct it and rerun. No queue or external messaging integration exists.

## Monitoring and troubleshooting

Logs include safe event/code/error name and PM generation counts. Audit log is admin-only; it records actor and scrubbed before/after values. Do not log credentials, entire request bodies or DATABASE_URL. Check process health, PostgreSQL connectivity, storage permissions/disk and latest job completion on the pilot host.

Login failures use a 15-minute per-login window after eight failures; inactive users lose protected access on the next request. If an account is blocked, wait for the window or have an administrator investigate rather than disable authentication. A 403 mutation may indicate role/assignment or incorrect Origin/APP_URL. Duplicate codes/occurrences produce controlled conflicts. A failed stock operation rolls back ledger, balance, usage, reservation and audit together.

Camera scan requires HTTPS or localhost, browser camera permission and a rear camera. Manual token/link entry remains available. Physical camera, printer, storage restore and load tests must be confirmed on pilot hardware.
