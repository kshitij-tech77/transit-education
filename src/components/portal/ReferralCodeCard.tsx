"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface ReferralCodeCardProps {
  referralCode: string | null;
}

export function ReferralCodeCard({ referralCode }: ReferralCodeCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!referralCode) return;
    await navigator.clipboard.writeText(`${window.location.origin}/portal/login?ref=${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-brand rounded-2xl p-7 text-white space-y-4">
      <div className="flex items-center gap-2">
        <Share2 size={18} />
        <p className="text-[15px] font-bold">Your Referral Code</p>
      </div>
      <p className="text-[13px] opacity-90">Share this code with friends — you&apos;ll both earn points when they join.</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-mono text-[20px] font-extrabold bg-white/15 px-5 py-3 rounded-lg tracking-wider">{referralCode ?? "—"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-brand bg-white px-4 py-3 rounded-lg hover:bg-white/90 transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied!" : "Copy Invite Link"}
        </button>
      </div>
    </div>
  );
}
