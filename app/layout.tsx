import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "PlantCare CMMS", template: "%s | PlantCare" }, description: "ระบบบริหารงานซ่อมบำรุง Phase 1–3" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="th"><body>{children}</body></html>; }
