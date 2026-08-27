"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface LocationFAQProps {
  faqs: FAQItem[];
}

export default function LocationFAQ({ faqs }: LocationFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        
        return (
          <div 
            key={i} 
            className={`bg-white rounded-[10px] border transition-all duration-300 ${isOpen ? 'border-brand shadow-[0_4px_20px_rgba(169,50,38,0.08)]' : 'border-[#E5E4E0]'}`}
          >
            <div 
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span className={`text-[15px] font-bold transition-colors ${isOpen ? 'text-brand' : 'text-[#111]'}`}>
                {faq.q}
              </span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-brand text-white rotate-0' : 'bg-[#F3F3F1] text-brand rotate-0'}`}>
                {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-6 pb-6 pt-0 text-[14px] font-light text-[#6B6966] leading-[1.8] border-t border-transparent">
                {faq.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
