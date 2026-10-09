"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export default function QrImage({ value, label }: { value: string; label: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(new URL(value, window.location.origin).toString(), { width: 160, margin: 1 })
      .then(setSrc)
      .catch((error: unknown) => console.error("QR generation failed", error));
  }, [value]);
  return src ? <Image src={src} width={160} height={160} alt={label} unoptimized /> : <span className="text-xs">جارٍ إنشاء رمز التحقق...</span>;
}
