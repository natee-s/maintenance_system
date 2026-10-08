import Link from "next/link";
export default function NotFound() { return <main className="panel m-6"><h1 className="text-xl font-bold">ไม่พบข้อมูล</h1><p className="my-4">ข้อมูลอาจไม่พร้อมใช้งาน หรือคุณไม่มีสิทธิ์เข้าถึง</p><Link href="/" className="text-blue-700 underline">กลับหน้าหลัก</Link></main>; }
