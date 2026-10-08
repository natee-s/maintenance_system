import { pageActor } from "@/lib/auth";
import { Shell } from "@/components/layout/shell";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) { return <Shell user={await pageActor()}>{children}</Shell>; }
