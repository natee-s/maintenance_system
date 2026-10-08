import { invariant } from "@/lib/errors";
const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" };
export function validateUpload(name: string, mime: string, bytes: Uint8Array, maxMb = 10) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  invariant(types[extension] === mime, "รองรับ JPG, PNG, WEBP และ PDF เท่านั้น");
  invariant(bytes.length > 0 && bytes.length <= maxMb * 1024 * 1024, `ขนาดไฟล์ต้องไม่เกิน ${maxMb} MB`);
  const header = Buffer.from(bytes.slice(0, 12));
  const signature = mime === "image/jpeg" ? header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
    : mime === "image/png" ? header.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : mime === "application/pdf" ? header.subarray(0, 5).toString() === "%PDF-"
    : header.subarray(0,4).toString() === "RIFF" && header.subarray(8,12).toString() === "WEBP";
  invariant(signature, "เนื้อหาไฟล์ไม่ตรงกับประเภทไฟล์"); return extension;
}
