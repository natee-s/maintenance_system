# Server contracts

Auth.js credentials/CSRF/session endpoints are under `/api/auth/*`; UI login is a server action. Safe relative callback returns a logged-out QR visitor to the same asset after login. Every protected request reloads live account activity/role. Requesters get minimal asset DTOs and their own requests; technicians get assigned WOs and their related requests; manager is read-only. STOREKEEPER dashboard summary is inventory-only.

JSON mutation requires Origin == APP_URL origin. Domain services enforce permissions, Zod types, record scope and transactions; response is record/result on success or `{error:string}` with 400/401/403/404/409/413. Unexpected failures are sanitized 500 with structured error-name/code logs. No direct status/balance update API exists. Query strings support page/pageSize (25 default, 100 max) and documented filters; invalid date ranges are rejected.

| Endpoint | Contract |
|---|---|
| GET/POST /api/admin/users | Safe admin list, create/update by optional id; optional password on edit, last active admin protected |
| POST /api/admin/masters | Admin hierarchy/master create/edit: entity, optional id, code/name and matching parent; no reparenting |
| GET/POST /api/assets | Scoped list with search/site/area/location/category/status/criticality/sort/order/page; create/edit optional id |
| GET/PATCH /api/assets/:id | Role projection / full asset edit input with route id |
| GET/POST /api/work-requests | Scoped list / create assetId,title,problemDescription,priorityRequested,machineStopped,optional failureObservedAt |
| GET /api/work-requests/:id | Scoped detail, triage internalNote removed from requester/technician DTO |
| POST /api/work-requests/:id/review | action UNDER_REVIEW/APPROVED/REJECTED/CANCELLED, optional priorityApproved/internalNote/reason; reject/cancel reason required |
| POST /api/work-requests/:id/convert-to-work-order | Atomic conversion, repeated conversion rejects 409 without duplicate |
| GET/POST /api/work-orders | Scoped paginated/filter list / corrective create assetId,title,description,priority,optional dueAt |
| GET /api/work-orders/:id | Assigned-role detail, timeline/comments/files; server enforces scope |
| POST /api/work-orders/:id/:action | assign,unassign,start,pause,waiting-part,resume,execution,complete,reopen,close,cancel,comment; permission/state checks; pause/wait/reopen/cancel reason required |
| POST /api/work-orders/:id/downtime | startedAt,optional endedAt/reason; calculates duration, rejects future/reversed times; terminal end-only supervisor correction requires reason |
| POST /api/files | Multipart entity,id,file,optional executionItemId; extension/MIME/signature and streamed body limit; parent checked again in transaction |
| GET /api/files/:key | Authorized private stream, no-store/nosniff/sandbox; PDF attachment; parent scope rechecked |
| POST /api/pm/templates | optional id,name/safety/category/duration/active, ordered items with types/required/bounds/fail rules; old items archived |
| POST /api/pm/plans | optional id,asset/template/name/frequency/interval/startDate/nextDueDate/leadDays/default technician/team/active |
| POST /api/pm/generate-due | optional planId; protected manual generation, {id,created,results}; same service as CLI |
| GET /api/work-orders/:id/checklist | Scoped checklist snapshot/response list |
| POST /api/work-orders/:id/checklist/:itemId/response | Typed response plus optional note, validates snapshot bounds and execution state |
| GET/POST /api/parts | Paginated search/category part list / optional id and part-master fields, immutable UOM after posting |
| POST /api/warehouses | optional id,siteId,code,name,description,isActive |
| POST /api/inventory/post | partId,warehouseId,type INITIAL/RECEIPT_MANUAL/ADJUST_IN/ADJUST_OUT,quantity as decimal string, optional reference/bin; adjustment reason mandatory |
| POST /api/work-orders/:id/parts/reserve | partId,warehouseId,quantity; reduces available, warehouse must match asset site |
| POST /api/work-orders/:id/parts/cancel-reservation | reservationId belonging to this WO; releases remainder |
| POST /api/work-orders/:id/parts/issue | partId,warehouseId,quantity; allowed ASSIGNED/IN_PROGRESS/PAUSED/WAITING_PART, consumes own reservation FIFO and appends ISSUE |
| POST /api/work-orders/:id/parts/return | Same identifiers/quantity, bounded by outstanding issued amount, appends RETURN |
| GET /api/dashboard/summary | Role-appropriate maintenance/inventory report, date/site/area/category/optional trend grain |
| POST /api/notifications/read | id belonging to current user; idempotent readAt |

Server-rendered reporting screens call the same services directly: /assets/:id/history, /inventory/stock, /inventory/transactions, /inventory/low-stock, /inventory/usage, /pm/calendar, /notifications, /admin/audit. Operational responses and dashboard numbers come from persisted records. Date filters are Bangkok bounds; inventory charts use ledger posting time, usage history uses usage-row creation time and cumulative totals. Reversals in later periods can produce negative period-net usage; they are kept visible rather than clamped.

