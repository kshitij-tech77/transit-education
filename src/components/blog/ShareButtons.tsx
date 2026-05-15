"use client";

import { useState } from "react";
import { Twitter, Facebook, Link2, Check, MessageCircle } from "lucide-react";

interface Props {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shares = [
    {
      label: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      color: "hover:bg-black hover:text-white",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      color: "hover:bg-[#1877F2] hover:text-white",
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      color: "hover:bg-[#25D366] hover:text-white",
    },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1">Share</span>
      {shares.map(({ label, icon: Icon, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={`p-2 rounded-xl border border-gray-100 text-gray-500 transition-all duration-150 ${color}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
      <button
        onClick={copy}
        aria-label="Copy link"
        className={`p-2 rounded-xl border transition-all duration-150 ${
          copied
            ? "border-green-200 bg-green-50 text-green-600"
            : "border-gray-100 text-gray-500 hover:bg-gray-50"
        }`}
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
