"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

export default function UtilityBar() {
  const [phone, setPhone] = useState("+977-1-5906277");
  const [show, setShow] = useState(true);

  useEffect(() => {
    fetch('/api/cms/settings')
      .then(res => res.json())
      .then(data => {
        if (data.phone) setPhone(data.phone);
      })
      .catch(() => {});
  }, []);

  if (!show) return null;

  return (
    <div className="bg-[#A93226] text-white text-[11px] font-[600] py-2 hidden md:block relative">
      <div className="container flex justify-between items-center pr-10">
        <span className="tracking-tight">Nepal's most trusted study abroad consultancy — Est. 2015</span>
        <div className="flex items-center gap-6">
          <span className="opacity-90">{phone}</span>
        </div>
      </div>
      <button 
        onClick={() => setShow(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
