import "dotenv/config";
import { chromium,expect } from "@playwright/test";
const base=process.env.SMOKE_URL ?? "http://localhost:3001";
if(!/^http:\/\/localhost:3001$/.test(base))throw new Error("Smoke is restricted to localhost:3001");
const browser=await chromium.launch(),page=await browser.newPage();
await page.goto(`${base}/`);await expect(page).toHaveURL(/\/login\?callbackUrl=/);
await page.getByLabel("ชื่อผู้ใช้ / อีเมล").fill("admin");await page.getByLabel("รหัสผ่าน",{exact:true}).fill(process.env.SEED_PASSWORD ?? "PilotDemo!2026");await page.getByRole("button",{name:"เข้าสู่ระบบ",exact:true}).click();await expect(page.getByRole("heading",{name:"ภาพรวมงานซ่อมบำรุง"})).toBeVisible();
const assets=await page.request.get(`${base}/api/assets?search=MP-001`);expect(assets.ok()).toBe(true);const data=await assets.json();expect(data.rows[0].assetCode).toBe("MP-001");await page.goto(`${base}/qr/${data.rows[0].qrToken}`);await expect(page.getByRole("heading",{level:1})).toHaveText("Hydraulic Press");
await page.goto(`${base}/inventory`);await expect(page.getByRole("heading",{name:"คลังอะไหล่",exact:true})).toBeVisible();await browser.close();console.log("Production login, dashboard, asset API, QR and inventory smoke passed.");
