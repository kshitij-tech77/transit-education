"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
  firstOpen?: boolean;
}

export default function FAQAccordion({ items, className, firstOpen = true }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(firstOpen ? 0 : null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={cn("space-y-0 border-t border-[#F0ECEC]", className)}>
      {items.map((item, index) => (
        <div key={index} className="border-b border-[#F0ECEC]">
          <button
            onClick={() => toggle(index)}
            className="w-full py-6 flex items-center justify-between text-left group"
          >
            <span className={cn(
              "text-[15px] md:text-[16px] font-[700] transition-colors",
              openIndex === index ? "text-brand" : "text-[#111] group-hover:text-brand"
            )}>
              {item.question}
            </span>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all",
              openIndex === index ? "bg-brand text-white rotate-0" : "bg-[#F9F4F4] text-brand"
            )}>
              {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
            </div>
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openIndex === index ? "max-h-[500px] opacity-100 pb-8" : "max-h-0 opacity-0"
            )}
          >
            <p className="text-[14px] text-[#555] leading-[1.7] whitespace-pre-wrap">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
