import "dotenv/config";
import { db } from "../lib/db/index";
import { generateDue } from "../modules/pm/generation-service";
if(!process.env.PM_RUN_AS)throw new Error("Set PM_RUN_AS to an active admin/supervisor username for the scheduled job");
const actor=await db.user.findUniqueOrThrow({where:{username:process.env.PM_RUN_AS},select:{id:true,name:true,role:true,siteId:true,isActive:true}});
if(!actor.isActive)throw new Error("Inactive scheduler account");await generateDue(actor);await db.$disconnect();
