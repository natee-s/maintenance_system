import { pageActor } from "@/lib/auth";
import { db } from "@/lib/db";
import { pagedUsers } from "@/modules/users/service";
import { RecordForm, type Field } from "@/components/forms/record-form";
import { PageHeader } from "@/components/ui/page-header";
import { Role } from "@/generated/prisma/client";
import type { Query } from "@/lib/lists";
import { Filters } from "@/components/forms/filters";
import { Pagination } from "@/components/tables/pagination";
export default async function UsersPage({searchParams}:{searchParams:Promise<Query>}) {
  const query=await searchParams,data=await pagedUsers(await pageActor(),query),users=data.rows; const sites = await db.site.findMany({where:{isActive:true}});
  const fields: Field[] = [{name:"name",label:"ชื่อ",required:true},{name:"username",label:"ชื่อผู้ใช้",required:true},{name:"email",label:"อีเมล",required:true},{name:"role",label:"บทบาท",type:"select",required:true,options:Object.values(Role).map(value=>({value,label:value}))},{name:"siteId",label:"โรงงาน",type:"select",options:sites.map(site=>({value:site.id,label:site.name}))},{name:"employeeCode",label:"รหัสพนักงาน"},{name:"password",label:"รหัสผ่านใหม่",type:"password",hint:"อย่างน้อย 10 ตัวอักษร; เว้นว่างเพื่อคงรหัสเดิมเมื่อแก้ไข"},{name:"isActive",label:"สถานะบัญชี",type:"checkbox"}];
  return <><PageHeader title="ผู้ใช้งาน" description="จัดการบัญชีและสิทธิ์ตามบทบาท" /><RecordForm title="เพิ่มผู้ใช้งาน" endpoint="/api/admin/users" fields={fields} initial={{isActive:true,role:"REQUESTER"}} />
    <Filters query={query} fields={[{name:"search",label:"ค้นหาผู้ใช้งาน"}]}/><div className="mt-6 space-y-3">{users.map(user=><details key={user.id} className="panel"><summary className="cursor-pointer font-semibold">{user.name} · {user.username} · {user.role} · {user.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}</summary><div className="mt-4"><RecordForm endpoint="/api/admin/users" fields={fields} initial={{...user,password:""}} /></div></details>)}</div><Pagination {...data} base="/admin/users" query={query}/></>;
}

