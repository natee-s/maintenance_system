import { test, expect } from "@playwright/test";
import { login } from "./helpers";
test("three-step creation preserves the created WO after an assignment failure", async ({page})=>{
  test.setTimeout(90000);
  await login(page,"supervisor");
  const name=`UI recovery ${Date.now()}`;
  let creates=0,failAssignment=true;
  page.on("request",request=>{if(request.method()==="POST" && new URL(request.url()).pathname==="/api/work-orders")creates++;});
  await page.route("**/api/work-orders/*/assign",async route=>{
    if(failAssignment){failAssignment=false;await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({error:"ทดสอบการเชื่อมต่อขัดข้อง"})});}
    else await route.continue();
  });
  await page.goto("/work-orders/new");
  await page.getByRole("button",{name:"ถัดไป",exact:true}).click();
  await expect(page.getByText("กรุณาเลือกเครื่องจักร",{exact:true})).toBeVisible();
  await page.getByLabel("เครื่องจักร",{exact:true}).selectOption({label:"MP-001 · Hydraulic Press"});
  await page.getByLabel("หัวข้องาน",{exact:true}).fill(name);
  await page.getByLabel("รายละเอียด",{exact:true}).fill("Verify recovery without duplicate creation");
  await page.getByLabel("แนบรูปภาพ / เอกสาร",{exact:true}).setInputFiles({name:"proof.png",mimeType:"image/png",buffer:Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lmYAAAAASUVORK5CYII=","base64")});
  await page.getByRole("button",{name:"ถัดไป",exact:true}).click();
  await page.getByLabel("ช่างผู้รับผิดชอบ",{exact:true}).selectOption({label:"สมชาย ช่างเครื่อง"});
  await page.getByRole("button",{name:"ถัดไป",exact:true}).click();
  await expect(page.getByRole("heading",{name:"ตรวจสอบก่อนสร้างใบงาน"})).toBeVisible();
  await expect(page.getByRole("main")).toContainText(name);
  expect(creates).toBe(0);
  await page.getByRole("button",{name:"บันทึก",exact:true}).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("สร้างใบงานแล้ว");
  await expect(page.getByRole("button",{name:"ย้อนกลับ",exact:true})).toBeDisabled();
  const recoveryUrl=await page.getByRole("link",{name:"เปิดใบงานที่สร้างแล้ว"}).getAttribute("href");
  await page.getByRole("button",{name:"บันทึกต่อ",exact:true}).click();
  await expect(page).toHaveURL(recoveryUrl!);
  await expect(page.getByRole("main")).toContainText("มอบหมายแล้ว");
  await expect(page.getByRole("main").getByRole("link",{name:/proof\.png/})).toBeVisible();
  expect(creates).toBe(1);
});
test("calendar day selection, month navigation and QR recovery work",async({page})=>{
  await login(page,"admin");
  await page.goto("/pm/calendar");
  await page.getByRole("button",{name:/^\d{4}-\d{2}-01 · \d+ งาน PM$/}).click();
  await expect(page.getByRole("heading",{name:/งานวันที่ 1 /})).toBeVisible();
  const next=await page.getByRole("link",{name:"เดือนถัดไป",exact:true}).getAttribute("href");
  await page.getByRole("link",{name:"เดือนถัดไป",exact:true}).click();
  await expect(page).toHaveURL(next!);
  await page.getByRole("button",{name:/รายการทั้งหมด/}).click();
  await expect(page.getByRole("button",{name:"ปฏิทิน",exact:true})).toHaveAttribute("aria-pressed","false");
  await page.goto("/scan");
  await page.getByLabel("QR token / ลิงก์").fill("invalid-token");
  await page.getByRole("button",{name:"เปิด QR",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("QR ไม่ถูกต้อง");
});
test("responsive navigation and lists retain role restrictions",async({page},info)=>{
  await login(page,"admin");
  await page.goto("/assets");
  if(info.project.name==="mobile"){
    const navigation=page.getByRole("navigation",{name:"เมนูหลักบนมือถือ"});
    await expect(navigation.getByRole("link")).toHaveCount(5);
    await expect(navigation.getByRole("link",{name:"อุปกรณ์",exact:true})).toHaveAttribute("aria-current","page");
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
    await navigation.getByRole("link",{name:"โปรไฟล์",exact:true}).click();
    await expect(page.getByRole("heading",{name:"โปรไฟล์ของฉัน",exact:true})).toBeVisible();
  }
  await login(page,"requester");
  await page.goto("/profile");
  await expect(page.getByRole("main").getByRole("link",{name:"คลังอะไหล่",exact:true})).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("link",{name:"จัดการผู้ใช้งาน",exact:true})).toHaveCount(0);
});
