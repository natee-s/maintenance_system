import { test, expect } from "@playwright/test";
test("protected route requires login and valid credentials establish a session", async ({ page }) => {
  await page.goto("/"); await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("ชื่อผู้ใช้ / อีเมล").fill("admin");
  await page.getByLabel("รหัสผ่าน", { exact: true }).fill(process.env.SEED_PASSWORD ?? "PilotDemo!2026");
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page).toHaveURL("/"); await expect(page.getByRole("main")).toBeVisible();
});
