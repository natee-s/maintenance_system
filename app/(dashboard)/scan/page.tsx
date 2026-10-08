import { QrScanner } from "@/components/maintenance/qr-scanner";
import { PageHeader } from "@/components/ui/page-header";
export default function ScanPage(){return <><PageHeader title="สแกน QR เครื่องจักร" description="เปิดกล้อง หรือใช้ลิงก์และ token ที่ติดไว้บนเครื่องจักร" /><QrScanner /></>;}
