# PlantCare mobile UI architecture

The attached poster informs visual hierarchy and interaction patterns. CMMS_PHASE_1_2_3_SPEC.md remains the functional source of truth. Implementation uses the existing Next.js / React / Tailwind application.

## Design system

| Token | Value / use |
| --- | --- |
| Primary | #FF6B00, primary actions and selected chips |
| Secondary | #1E293B, sidebar, welcome banner, headings |
| Canvas | #F8FAFC |
| Surface | White, subtle border/shadow |
| Radius | 12px controls; 16px cards |
| Controls | Minimum height 44px |
| Status | Green completed/active; amber progress/waiting; red urgent/downtime; neutral open |
| Typography | Segoe UI / Tahoma fallback for Thai, clear size/weight hierarchy |

Primary orange buttons use navy text for contrast. Status always includes a text label. Mobile content accounts for the bottom navigation and device safe area.

## Component hierarchy

```text
RootLayout
└── DashboardLayout [authenticated Server Component]
    └── Shell
        ├── Desktop sidebar → Navigation [pathname highlight]
        ├── App header → QR / notifications / profile
        ├── Main content
        │   ├── Dashboard
        │   │   ├── PageHeader / Welcome banner / Quick actions
        │   │   ├── MetricCard × 4
        │   │   ├── Filters / Recent activity / Operational status
        │   │   └── PmSummary / OperationalCharts / InventorySummary
        │   ├── Equipment / Parts
        │   │   ├── Filters / FilterChips
        │   │   └── RecordList → desktop table / mobile thumbnail cards
        │   ├── Equipment detail → overview / history / PM / parts / files
        │   ├── PM Calendar → MaintenanceCalendar → selected-day events
        │   ├── Work Order → WorkOrderWizard → detail / assign / confirm
        │   ├── Execution → WorkActions / PmChecklist / UploadForm
        │   ├── QR → QrScanner → protected asset quick view
        │   └── Profile → session summary / permitted menu / logout
        └── Mobile Navigation [five role-aware tabs]
```

The five normal tabs are Home, Equipment, Work Orders, Parts and Profile. Requesters access their requests in Work and QR in place of Parts. Profile provides existing operational/admin links according to server permissions.

## State ownership

| State | Owner | Update path |
| --- | --- | --- |
| Authentication / role | Auth.js session + pageActor on server | Login/logout, server authorization |
| Assets, WO status, checklist history, inventory quantities | PostgreSQL / domain services | Existing validated API operations |
| Search, filters, pagination, report period, month | URL search parameters | GET form / chip / month links; server query |
| Active navigation | usePathname | Route navigation |
| Wizard fields | React Hook Form | Field controls / validation |
| Wizard step and selected attachments | Local React state | Next/back/file selection |
| Created WO ID, assignment/upload progress | Event-handler ref + UI state | Retry remaining operations without duplicate creation |
| Selected PM date and calendar/list view | Local React state | Calendar button selection; reset on month navigation |
| File preview | Local state + object URL ref | Revoke on replacement, success and unmount |
| Camera | Lifecycle refs and scan-state union | idle → requesting → scanning → found / invalid / denied |
| Chart display | Serialized server query props | Report filters; no client-calculated stock/KPIs |

No Redux, Zustand, offline synchronization or new native mobile project is required.

## Working Tailwind example

The code is implemented in the application, rather than in a disconnected mockup. A reusable dashboard example:

```tsx
import { MetricCard } from "@/components/ui/metric-card";

export function DashboardMetrics({ assets, pmToday, openWork, downtime }: {
  assets: number; pmToday: number; openWork: number; downtime: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <MetricCard label="เครื่องจักรทั้งหมด" value={assets}
        href="/assets" icon="assets" tone="blue" />
      <MetricCard label="PM ครบกำหนดวันนี้" value={pmToday}
        href="/pm/calendar" icon="pm" />
      <MetricCard label="ใบงานที่ยังเปิด" value={openWork}
        href="/work-orders" icon="work" />
      <MetricCard label="Downtime (นาที)" value={downtime.toFixed(1)}
        href="/work-orders" icon="downtime" tone="red" />
    </div>
  );
}
```

Actual screen implementations:

- app/(dashboard)/page.tsx — server-backed dashboard.
- components/forms/work-order-wizard.tsx — form validation, creation/assignment/upload and retry.
- components/maintenance/pm-calendar.tsx — responsive calendar/day selection.
- components/maintenance/pm-checklist.tsx — snapshot response forms, progress and evidence.
- components/maintenance/qr-scanner.tsx — camera lifecycle, framing and manual recovery.
- components/charts/operational-charts.tsx — WO status donut, operational bar charts and accessible data tables.

## Behavioral boundaries

- Create, assign and upload remain separate existing operations. A failure after creation retains the ID for a retry while the wizard remains open. Refreshing the page discards the draft; the created work remains accessible in the work-order list.
- Figures, activity and charts use actual records; thumbnails use authenticated attachments. An icon appears when no image is available.
- CHECK items use mutually exclusive pass/fail checkboxes. Deselecting returns the answer to unanswered; completion validation remains server-side. TEXT, NUMBER and PASS_FAIL retain their typed controls.
- Reports remain operational dashboard views from the specification. No MTBF/MTTR/OEE or fabricated trend comparison is introduced.
- Real camera permission and device behavior require HTTPS or localhost and physical-device pilot testing.
