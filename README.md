# PlantCare CMMS — Phase 1–3

ระบบแจ้งซ่อม งานซ่อม PM และคลังอะไหล่ใน Next.js project เดียว ตาม `CMMS_PHASE_1_2_3_SPEC.md` ดำเนินการตาม dependency order §79 ไม่มี Docker หรือโมดูลนอก Phase 1–3 เอกสารก่อนเริ่ม code อยู่ใน `docs/IMPLEMENTATION_PLAN.md`, `docs/ASSUMPTIONS.md`, `docs/DECISIONS.md`; ผลตรวจแต่ละขั้นอยู่ใน `docs/PROGRESS.md`.

## Quick start on this workspace

Node.js 24 LTS / npm. มี `.env` ที่สร้างรหัส PostgreSQL และ AUTH_SECRET สุ่มไว้แล้ว ไม่อยู่ใน Git. แยกการติดตั้ง dependencies ออกจากการเริ่มระบบ: `npm ci` ลบ node_modules แล้วติดตั้งใหม่ จึงต้องทำขณะ PostgreSQL และ Next.js ของ project หยุดอยู่ โดยเฉพาะ Windows ที่จะล็อก DLL ของ embedded PostgreSQL ที่กำลังใช้งาน.

### ติดตั้งครั้งแรก / ติดตั้ง dependencies ใหม่

หยุด `npm run dev` และ `npm run db:local` ด้วย Ctrl+C ใน terminal ที่เปิดไว้ รอให้กลับมาที่ PowerShell prompt ก่อน แล้วรัน:

```powershell
cd D:\12.Project\16_Maintenance
npm ci
```

รอให้ติดตั้งสำเร็จโดยไม่มี `npm error` ก่อนเริ่มฐานข้อมูล. หากเคยรัน npm ci ขณะฐานข้อมูลเปิดอยู่และเกิด EPERM/unlink DLL dependencies อาจถูกลบไปบางส่วน ต้องติดตั้งใหม่ให้สำเร็จ ห้ามข้ามไป db:generate/dev. ข้อมูลฐานอยู่ใน `.local-postgres` แยกจาก node_modules; ไม่ต้องลบฐานหรือไฟล์ .env เพื่อแก้ปัญหานี้.

หาก Ctrl+C แจ้งว่าหา `pg_ctl.exe` ไม่พบหรือ PostgreSQL ยังทำงานและ npm ci ยังติด DLL เดิม แปลว่าเครื่องมือหยุดฐานอาจถูกลบไปด้วย ให้บันทึกงานอื่นแล้ว Restart Windows หนึ่งครั้ง หลังเปิดเครื่องให้รัน npm ci ก่อนเปิด db:local. ไม่จำเป็นต้องเริ่มด้วย Administrator หรือปิด antivirus สำหรับกรณีไฟล์ถูก process ใช้งานนี้.

หลังติดตั้งสำเร็จ เปิด terminal สองหน้าต่าง:

```powershell
# Terminal 1 — keep open
cd D:\12.Project\16_Maintenance
npm run db:local
```

```powershell
# Terminal 2
cd D:\12.Project\16_Maintenance
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

เปิด http://localhost:3000. หาก database/app ของ session ปัจจุบันยังทำงานอยู่ ไม่ต้องเริ่ม process ซ้ำ. หยุดด้วย Ctrl+C; database ใน `.local-postgres` และไฟล์ใน `storage` ยังคงอยู่.

### เปิดใช้งานครั้งถัดไป

เมื่อติดตั้งและตั้งค่าฐานแล้ว ไม่ต้อง npm ci หรือ seed ทุกครั้ง: Terminal 1 รัน `npm run db:local` ค้างไว้; Terminal 2 รัน `npm run dev`. หากมี schema/migration ใหม่ ให้รัน db:generate และ db:deploy ก่อน dev. หากต้องติดตั้ง dependencies ใหม่ ให้หยุดทั้งสอง process ก่อนเสมอ.

บน checkout ใหม่ที่ไม่มี .env ให้ `npm ci` ก่อนแล้ว `npm run db:local`; script จะสร้าง .env และ cluster UTF-8 บน loopback port 54329. หากใช้ PostgreSQL ที่มีอยู่ ให้ copy `.env.example` เป็น `.env` และตั้ง DATABASE_URL, AUTH_SECRET แบบสุ่มอย่างน้อย 32 ตัวอักษร, APP_URL/AUTH_URL ให้ตรงกับเว็บไซต์ จากนั้น generate → deploy → seed → dev. ไม่ใช้ `db:local` กับ URL ภายนอกหรือ port อื่น.

## Demo accounts

| Username | Role |
|---|---|
| admin | ADMIN |
| supervisor | MAINTENANCE_SUPERVISOR |
| technician1 / technician2 | TECHNICIAN |
| requester | REQUESTER |
| storekeeper | STOREKEEPER |
| manager | MANAGER_VIEWER |

รหัสผ่านเริ่มต้น `PilotDemo!2026` หรือค่า SEED_PASSWORD ที่ตั้งก่อน seed ครั้งแรก. Seed upsert และไม่เปลี่ยน password บัญชีที่มีอยู่. Seed ปฏิเสธ NODE_ENV=production. มีองค์กร/โรงงาน พื้นที่/สถานที่ 5 เครื่องจักร 5 อะไหล่ คลังหลัก opening ledger แผน PM รายสัปดาห์/เดือน/ไตรมาส และใบงานตัวอย่างหลายสถานะ. ฐานพัฒนาปัจจุบันมีรายการจาก automated tests ด้วย.

## Verify

```powershell
npx playwright install chromium
npm run lint
npm run typecheck
npm test
npm run test:integration
npm run test:e2e
npm run build
npm run verify:database
```

Integration/E2E เพิ่มข้อมูลใน DATABASE_URL ปัจจุบัน ต้องใช้ฐานทดลอง. `verify:database` สร้างฐานใหม่แยกบน project-local port 54329 ทดสอบ migrations → seed → integration → ledger/reservation reconciliation เก็บหลักฐานที่ `docs/FRESH_DATABASE_VERIFICATION.json` และไม่ลบฐานเดิม. ไม่ใช้กับ production. Playwright ใช้ localhost:3000 และเปิด dev server หรือ reuse process ที่มีอยู่.

## PM job

ผู้ดูแล/หัวหน้ากดสร้าง PM ที่หน้าจอ หรือใช้ Task Scheduler/cron ของ host:

```powershell
$env:PM_RUN_AS='supervisor'
npm run pm:generate
```

ใช้บัญชีที่ active และมี pm.manage. หนึ่งรอบสร้าง next occurrence ของแต่ละแผนที่เข้า lead window สูงสุด 500 แผน; backlog หลายรอบต้องเรียกซ้ำจนตามทัน. Occurrence unique และ retry ไม่สร้าง WO ซ้ำ. แต่ละ occurrence atomic; หากแผนใดผิดพลาด job รายงาน failure และหยุด โดยแผนก่อนหน้าที่สำเร็จยังคงอยู่. ดูปฏิทินเพื่อแยกแผนที่ยังไม่ generate กับ WO ที่สร้างแล้ว.

## Pilot deployment

ใช้ PostgreSQL ภายนอก, HTTPS reverse proxy, secret จริง และบัญชีจริง. จาก source ที่ติดตั้ง dependencies แล้ว: `npm run db:generate`, `npm run db:deploy`, `npm run build`, `npm start`. ไม่มีการ publish/deploy ภายนอกจากงานนี้. ห้าม db push/reset บนฐานจริง. ตั้ง private LOCAL_STORAGE_PATH นอก public directory บน disk ถาวร; ให้เฉพาะ service account อ่าน/เขียน. สำรอง PostgreSQL และ storage ชุดเดียวกัน ดู `docs/OPERATIONS.md` และ `docs/PILOT_TEST.md`.

ผลตรวจและข้อจำกัดอยู่ใน `docs/IMPLEMENTATION_REPORT.md` และ `docs/TEST_PLAN.md`.

## UI และโครงสร้างหน้าจอ

ดีไซน์ระบบใช้โทนส้ม #FF6B00 / กรมท่า #1E293B พร้อมเมนูมือถือ 5 แท็บ, การ์ดเครื่องจักรและอะไหล่, ปฏิทินเลือกวัน, ฟอร์มใบงาน 3 ขั้น, Checklist/หลักฐาน และกราฟข้อมูลจริง. อ่าน [Component Hierarchy, State Management และตัวอย่างโค้ด React/Tailwind](docs/UI_ARCHITECTURE.md) และ [ภาพหน้าจอ/ผลตรวจ UI](docs/UI_VERIFICATION.md).
