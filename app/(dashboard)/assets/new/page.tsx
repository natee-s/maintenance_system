import { pageActor } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { locationOptions } from "@/modules/locations/service";
import { assetFields } from "@/modules/assets/fields";
import { RecordForm } from "@/components/forms/record-form";
import { PageHeader } from "@/components/ui/page-header";
export default async function NewAsset() {requirePermission(await pageActor(),"asset.create");return <><PageHeader title="เพิ่มเครื่องจักร" /><RecordForm endpoint="/api/assets" fields={assetFields(await locationOptions())} initial={{criticality:"MEDIUM",status:"ACTIVE",isActive:true}} redirectTo="/assets/:id" /></>;}
