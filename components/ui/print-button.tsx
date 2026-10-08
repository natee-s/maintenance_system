"use client";
import { Button } from "./button";
export function PrintButton() {return <Button onClick={()=>window.print()} className="no-print">พิมพ์ QR</Button>;}
