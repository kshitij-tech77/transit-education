"use client";

import { useState } from "react";
import { X, Phone } from "lucide-react";

export default function UtilityBar({ phone: settingsPhone }: { phone?: string | null }) {
  const phone = settingsPhone || "+977-1-5906277";
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="bg-[#18181B] text-white text-[11px] font-semibold hidden md:block relative">
      <div className="container flex items-center justify-between h-9 pr-10">
        <span className="text-gray-300 tracking-tight">
          Nepal&apos;s most trusted study abroad consultancy — Est. 2015
        </span>
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
        >
          <Phone className="w-3 h-3 shrink-0" />
          {phone}
        </a>
      </div>
      <button
        onClick={() => setShow(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity p-1"
        aria-label="Dismiss announcement"
      >
        <X size={13} />
      </button>
    </div>
  );
}
