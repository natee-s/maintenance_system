"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="panel m-6"><h2 className="text-xl font-bold">ไม่สามารถโหลดข้อมูลได้</h2><p className="my-4">กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง หากยังพบปัญหาให้ติดต่อผู้ดูแล</p><Button onClick={reset}>ลองอีกครั้ง</Button></div>; }
