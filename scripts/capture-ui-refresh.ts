import "dotenv/config";
import { chromium, type Page } from "@playwright/test";
const browser=await chromium.launch();
const base="http://localhost:3000";
async function login(page:Page) {
  await page.goto(`${base}/login`);
  await page.getByLabel("ชื่อผู้ใช้ / อีเมล").fill("admin");
  await page.getByLabel("รหัสผ่าน",{exact:true}).fill(process.env.SEED_PASSWORD ?? "PilotDemo!2026");
  await page.getByRole("button",{name:"เข้าสู่ระบบ",exact:true}).click();
  await page.waitForURL(`${base}/`);
}
async function capture(page:Page,path:string,file:string) {
  await page.goto(`${base}${path}`);await page.getByRole("heading",{level:1}).waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`docs/${file}.png`});
  if(!(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)))throw new Error(`Horizontal overflow: ${path}`);
}
try {
  const desktop=await browser.newPage({viewport:{width:1440,height:1000}});
  await login(desktop);await capture(desktop,"/","ui-refresh-dashboard-desktop");
  const chart=desktop.locator("section").filter({has:desktop.getByRole("heading",{name:"ใบงานตามสถานะ",exact:true})});
  await chart.scrollIntoViewIfNeeded();
  await chart.locator(".recharts-sector").first().waitFor();
  await chart.evaluate(async element=>{
    let previous="",stable=0;
    while(stable<12){
      await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
      const current=Array.from(element.querySelectorAll(".recharts-sector")).map(path=>path.getAttribute("d")).join("|");
      stable=current && current===previous ? stable+1 : 0;previous=current;
    }
  });
  await chart.screenshot({path:"docs/ui-refresh-analytics.png"});
  const result=await (await desktop.request.get(`${base}/api/assets?search=MP-001`)).json();
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await login(mobile);
  for(const [path,file] of [["/","dashboard"],["/assets","equipment"],[`/assets/${result.rows[0].id}`,"equipment-detail"],["/inventory","parts"],["/pm/calendar","calendar"],["/scan","scanner"],["/profile","profile"],["/work-orders/new","work-order-detail-step"]] as const)await capture(mobile,path,`ui-refresh-${file}-mobile`);
  await mobile.getByLabel("เครื่องจักร",{exact:true}).selectOption({label:"MP-001 · Hydraulic Press"});
  await mobile.getByLabel("หัวข้องาน",{exact:true}).fill("ตรวจสอบเสียงผิดปกติของเครื่องจักร");
  await mobile.getByLabel("รายละเอียด",{exact:true}).fill("ตรวจสอบอาการและวางแผนงานก่อนเริ่มปฏิบัติงาน");
  await mobile.getByRole("button",{name:"ถัดไป",exact:true}).click();
  await mobile.screenshot({path:"docs/ui-refresh-work-order-assign-mobile.png"});
  await mobile.getByLabel("ช่างผู้รับผิดชอบ",{exact:true}).selectOption({label:"สมชาย ช่างเครื่อง"});
  await mobile.getByRole("button",{name:"ถัดไป",exact:true}).click();
  await mobile.screenshot({path:"docs/ui-refresh-work-order-confirm-mobile.png"});
  for(const path of ["/","/assets","/inventory","/pm/calendar","/scan","/profile","/work-orders/new"]) {
    await mobile.setViewportSize({width:360,height:800});
    await mobile.goto(`${base}${path}`);await mobile.getByRole("heading",{level:1}).waitFor();
    if(!(await mobile.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)))throw new Error(`Horizontal overflow at 360px: ${path}`);
  }
  console.log("Captured 12 desktop/mobile screens; checked 360px layouts; forms were not submitted.");
} finally {await browser.close();}
