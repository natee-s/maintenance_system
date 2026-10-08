import "dotenv/config";
import { db } from "../lib/db/index";
import { hashPassword } from "../modules/auth/service";
import { Role } from "../generated/prisma/client";
import { postStock } from "../modules/inventory/stock-service";
if (process.env.NODE_ENV === "production") throw new Error("Development seed is disabled in production");
const passwordHash = await hashPassword(process.env.SEED_PASSWORD ?? "PilotDemo!2026");
const org = await db.organization.upsert({ where: { code: "DEMO" }, update: {}, create: { code: "DEMO", name: "Demo Manufacturing Co., Ltd." } });
const site = await db.site.upsert({ where: { organizationId_code: { organizationId: org.id, code: "PLANT1" } }, update: {}, create: { organizationId: org.id, code: "PLANT1", name: "Plant 1" } });
const accounts = [
  ["admin", "ผู้ดูแลระบบ", Role.ADMIN], ["supervisor", "หัวหน้าซ่อมบำรุง", Role.MAINTENANCE_SUPERVISOR],
  ["technician1", "สมชาย ช่างเครื่อง", Role.TECHNICIAN], ["technician2", "อนันต์ ช่างไฟฟ้า", Role.TECHNICIAN],
  ["requester", "พนักงานผลิต", Role.REQUESTER], ["storekeeper", "เจ้าหน้าที่คลัง", Role.STOREKEEPER], ["manager", "ผู้จัดการโรงงาน", Role.MANAGER_VIEWER],
] as const;
for (const [username, name, role] of accounts) await db.user.upsert({ where: { username }, update: {}, create: { username, name, role, email: `${username}@demo.local`, passwordHash, siteId: site.id } });
for (const [code,name] of [["PROD","Production"],["UTIL","Utility"],["FAC","Facility"]]) await db.area.upsert({where:{siteId_code:{siteId:site.id,code}},update:{},create:{siteId:site.id,code,name}});
const production = await db.area.findUniqueOrThrow({where:{siteId_code:{siteId:site.id,code:"PROD"}}});
const utility = await db.area.findUniqueOrThrow({where:{siteId_code:{siteId:site.id,code:"UTIL"}}});
for (const [code,name,areaId] of [["LINEA","Line A",production.id],["LINEB","Line B",production.id],["UTILITY","Utility Area",utility.id]]) await db.location.upsert({where:{siteId_code:{siteId:site.id,code}},update:{},create:{siteId:site.id,areaId,code,name}});
const masters = [
  ["ASSET_CATEGORY","MACHINE","เครื่องจักร"],["ASSET_CATEGORY","UTILITY","ระบบสาธารณูปโภค"],
  ["FAILURE_CATEGORY","MECHANICAL","กลไก"],["FAILURE_CATEGORY","ELECTRICAL","ไฟฟ้า"],["FAILURE_CATEGORY","OTHER","อื่น ๆ"],
  ["PART_CATEGORY","SPARE","อะไหล่"],["UOM","PCS","ชิ้น"],["UOM","LITRE","ลิตร"],["TEAM","MAINT","ทีมซ่อมบำรุง"],
  ...["LOW","MEDIUM","HIGH","CRITICAL"].map(code=>["ASSET_CRITICALITY",code,code]),
  ...["LOW","MEDIUM","HIGH","URGENT"].map(code=>["WORK_PRIORITY",code,code]),
  ...["CORRECTIVE","PREVENTIVE"].map(code=>["WORK_TYPE",code,code]),
] as string[][];
for (const [kind,code,name] of masters) await db.masterData.upsert({where:{kind_code:{kind:kind as import("../generated/prisma/client").MasterKind,code}},update:{},create:{kind:kind as import("../generated/prisma/client").MasterKind,code,name,allowsDecimal:code === "LITRE"}});
const admin = await db.user.findUniqueOrThrow({where:{username:"admin"}});
const machineCategory = await db.masterData.findUniqueOrThrow({where:{kind_code:{kind:"ASSET_CATEGORY",code:"MACHINE"}}});
const lineA = await db.location.findUniqueOrThrow({where:{siteId_code:{siteId:site.id,code:"LINEA"}}});
for (const [assetCode,name] of [["MP-001","Hydraulic Press"],["MP-002","Air Compressor"],["MP-003","Cooling Tower"],["MP-004","Generator"],["MP-005","Conveyor Line"]]) await db.asset.upsert({where:{assetCode},update:{},create:{assetCode,name,categoryId:machineCategory.id,siteId:site.id,areaId:production.id,locationId:lineA.id,criticality:"HIGH",status:"ACTIVE",manufacturer:"Demo Industrial",model:"Pilot Series",serialNumber:`SN-${assetCode}`,createdBy:admin.id,updatedBy:admin.id}});
const technician=await db.user.findUniqueOrThrow({where:{username:"technician1"}});
const requester=await db.user.findUniqueOrThrow({where:{username:"requester"}});
const today=new Date(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Bangkok",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()));
const template=await db.pmTemplate.upsert({where:{templateCode:"PMT-DEMO"},update:{},create:{templateCode:"PMT-DEMO",name:"ตรวจสภาพและหล่อลื่น",description:"ตรวจความพร้อมเครื่องจักร",safetyNote:"ตัดไฟและทำ Lockout ก่อนปฏิบัติงาน",createdBy:admin.id,items:{create:[{sequence:1,title:"ตรวจระดับน้ำมันและการรั่ว",itemType:"CHECK",required:true},{sequence:2,title:"ตรวจสภาพ Bearing",itemType:"PASS_FAIL",required:true,requiresNoteOnFail:true}]}}});
for(const [code,assetCode,frequencyType,name] of [["PM-DEMO-MONTH","MP-001","MONTHLY","PM รายเดือน Hydraulic Press"],["PM-DEMO-QUARTER","MP-003","QUARTERLY","PM รายไตรมาส Cooling Tower"],["PM-DEMO-WEEK","MP-005","WEEKLY","ตรวจ Conveyor รายสัปดาห์"]] as const){const asset=await db.asset.findUniqueOrThrow({where:{assetCode}});await db.pmPlan.upsert({where:{pmPlanCode:code},update:{},create:{pmPlanCode:code,assetId:asset.id,templateId:template.id,name,frequencyType,intervalValue:1,startDate:today,nextDueDate:today,leadDays:7,assignedToId:technician.id,createdBy:admin.id}});}
const cooling=await db.asset.findUniqueOrThrow({where:{assetCode:"MP-003"}});
await db.workRequest.upsert({where:{requestCode:"WR-DEMO-001"},update:{},create:{requestCode:"WR-DEMO-001",assetId:cooling.id,title:"เสียงผิดปกติและน้ำไหลลดลง",problemDescription:"ตรวจพบเสียงจากชุด Bearing ระหว่างเดินเครื่อง",priorityRequested:"MEDIUM",machineStopped:false,reporterId:requester.id}});
const failure=await db.masterData.findUniqueOrThrow({where:{kind_code:{kind:"FAILURE_CATEGORY",code:"MECHANICAL"}}});
for(const [index,status] of (["OPEN","ASSIGNED","IN_PROGRESS","PAUSED","WAITING_PART","COMPLETED","CLOSED"] as const).entries()){const executed=["IN_PROGRESS","PAUSED","WAITING_PART","COMPLETED","CLOSED"].includes(status),finished=["COMPLETED","CLOSED"].includes(status);await db.workOrder.upsert({where:{workOrderCode:`WO-DEMO-${index+1}`},update:{},create:{workOrderCode:`WO-DEMO-${index+1}`,assetId:cooling.id,title:`ตรวจระบบ Cooling Tower ${index+1}`,description:"งานตัวอย่างสำหรับทดลองกระบวนการ",priority:index === 2 ? "URGENT" : "MEDIUM",status,assignedToId:status === "OPEN" ? null : technician.id,dueAt:new Date(Date.now()+(index-2)*86400000),actualStartAt:executed ? new Date(Date.now()-7200000) : null,actualEndAt:finished ? new Date(Date.now()-3600000) : null,findings:finished ? "Bearing เริ่มสึก" : null,actionTaken:finished ? "ตรวจและเปลี่ยน Bearing" : null,failureCategoryId:finished ? failure.id : null,createdBy:admin.id,closedBy:status === "CLOSED" ? admin.id : null,closedAt:status === "CLOSED" ? new Date() : null,activities:{create:{actorId:admin.id,eventType:"SEED",message:"รายการสาธิตสำหรับพัฒนาระบบ"}}}});}
const partCategory=await db.masterData.findUniqueOrThrow({where:{kind_code:{kind:"PART_CATEGORY",code:"SPARE"}}});
const warehouse=await db.warehouse.upsert({where:{siteId_code:{siteId:site.id,code:"MAIN"}},update:{},create:{siteId:site.id,code:"MAIN",name:"คลังอะไหล่หลัก"}});
for(const [partCode,name,uomCode,quantity,cost] of [["BRG-001","Bearing 6205","PCS","20","150"],["FLT-002","Air Filter","PCS","12","250"],["BLT-003","V-Belt","PCS","8","180"],["OIL-004","Hydraulic Oil","LITRE","100.5","90"],["SLC-005","Seal Kit","PCS","2","450"]]){const uom=await db.masterData.findUniqueOrThrow({where:{kind_code:{kind:"UOM",code:uomCode}}});const part=await db.part.upsert({where:{partCode},update:{},create:{partCode,name,categoryId:partCategory.id,uomId:uom.id,minStock:"3",reorderPoint:"5",unitCostReference:cost,isCritical:partCode === "BRG-001" || partCode === "SLC-005",createdBy:admin.id,updatedBy:admin.id}});if(!await db.stockTransaction.count({where:{partId:part.id,warehouseId:warehouse.id}}))await postStock({id:admin.id,name:admin.name,role:admin.role,siteId:admin.siteId},{partId:part.id,warehouseId:warehouse.id,type:"INITIAL",quantity,binText:`A-${partCode.slice(4)}`});}
console.log("Development seed: hierarchy, masters, 7 accounts, 5 assets, 5 parts, opening ledger, PM and sample maintenance ready.");
await db.$disconnect();
