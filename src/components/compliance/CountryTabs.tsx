"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import CountryContent from "./CountryContent";

export interface CountryTab {
  id: string;
  label: string;
  flag: string;
  content?: React.ReactNode;
}

interface CountryTabsProps {
  tabs: CountryTab[];
  defaultTab?: string;
}

export default function CountryTabs({ tabs, defaultTab }: CountryTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white sticky top-[72px] z-10">
        <div className="container">
          <div
            className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px"
            role="tablist"
            aria-label="Select country"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap px-5 py-4 text-sm font-semibold border-b-2 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
                  active === tab.id
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-black hover:border-gray-300"
                )}
              >
                <span aria-hidden="true">{tab.flag}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content panel */}
      {activeTab && (
        <div
          id={`panel-${activeTab.id}`}
          role="tabpanel"
          aria-label={`${activeTab.label} compliance information`}
          className="bg-white"
        >
          <div className="container py-10 md:py-14">
            <CountryContent countryName={activeTab.label}>
              {activeTab.content}
            </CountryContent>
          </div>
        </div>
      )}
    </div>
  );
}
