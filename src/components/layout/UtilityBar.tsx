"use client";

import { useEffect, useState } from "react";

export default function UtilityBar() {
  const [phone, setPhone] = useState("+977-1-5906277");

  useEffect(() => {
    fetch('/api/cms/settings')
      .then(res => res.json())
      .then(data => {
        if (data.phone) setPhone(data.phone);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#A93226] text-white text-[11px] font-[600] py-2 hidden md:block">
      <div className="container flex justify-between items-center">
        <span className="tracking-tight">Nepal's most trusted study abroad consultancy — Est. 2015</span>
        <span className="opacity-90">{phone}</span>
      </div>
    </div>
  );
}
