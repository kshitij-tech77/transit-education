"use client";

import { useRouter } from "next/navigation";
import { User, FileText, Check, Globe, Plus, Star, Image as ImageIcon } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { CmsSection } from "@/constants/cms";
import { StatusBadge, CmsCard } from "@/components/cms/shared";

interface DashboardSectionProps {
  data: CmsDataState;
  onNavigate: (section: CmsSection) => void;
}

export function DashboardSection({ data, onNavigate }: DashboardSectionProps) {
  const router = useRouter();

  const stats = [
    { label: "Total Students",      value: data.students.length,                                                              icon: User     },
    { label: "Active Applications",  value: data.students.filter(s => s.status === "PENDING" || s.status === "CONTACTED").length, icon: FileText },
    { label: "Visa Approvals",       value: data.students.filter(s => s.status === "APPROVED").length,                        icon: Check    },
    { label: "Blog Posts",           value: data.posts.length,                                                                icon: Globe    },
  ];

  const quickActions = [
    { label: "New Blog",     icon: Plus,      action: () => router.push("/cms/blog/new")      },
    { label: "Add Story",    icon: Star,      action: () => onNavigate("Success Stories")     },
    { label: "Upload Media", icon: ImageIcon, action: () => onNavigate("Media Library")       },
    { label: "Add Student",  icon: User,      action: () => onNavigate("Students")            },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <CmsCard key={i} className="min-h-[140px]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-9 h-9 bg-brand-surface rounded-lg flex items-center justify-center text-brand">
                <stat.icon size={16} />
              </div>
              <span className="text-[11px] font-bold text-green-600">Live</span>
            </div>
            <div className="text-[28px] font-extrabold text-black leading-tight mb-1">{stat.value}</div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </CmsCard>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <CmsCard noPadding className="col-span-9">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-[15px] font-bold text-black">Recent Applications</h2>
            <button className="text-brand text-[11px] font-bold" onClick={() => onNavigate("Students")}>
              View All →
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.students.slice(0, 5).map((s, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-black">{s.name}</td>
                  <td className="px-6 py-4">{s.branch}</td>
                  <td className="px-6 py-4">{s.country}</td>
                  <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-6 py-4 text-gray-400">{s.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>

        <div className="col-span-3 space-y-5">
          <CmsCard noPadding className="p-4">
            <h2 className="text-[13px] font-bold text-black mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {quickActions.map((act, i) => (
                <button
                  key={i}
                  onClick={act.action}
                  className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-brand hover:bg-brand-surface group transition-all"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-brand mb-2">
                    <act.icon size={16} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-600 group-hover:text-brand">{act.label}</span>
                </button>
              ))}
            </div>
          </CmsCard>

          <CmsCard noPadding className="p-4">
            <h2 className="text-[13px] font-bold text-black mb-4">Branch Activity</h2>
            <div className="space-y-3">
              {data.branches.map((b, i) => {
                const count = data.students.filter(s => s.branch === b.name).length;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-gray-600">{b.name}</span>
                      <span className="text-black">{count}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${Math.min((count / 50) * 100, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CmsCard>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-bold text-black">Recent Success Stories</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {data.successStories.slice(0, 6).map((story, i) => (
            <div
              key={i}
              className="min-w-[200px] bg-brand-surface border border-brand/20 p-4 rounded-xl text-center group hover:bg-brand transition-all cursor-pointer"
            >
              <div className="text-[10px] font-bold text-brand group-hover:text-white uppercase tracking-widest mb-1">
                {story.flag} {story.country}
              </div>
              <div className="text-[13px] font-bold text-black group-hover:text-white truncate">{story.name}</div>
              <div className="text-[11px] text-gray-400 group-hover:text-white/80 truncate">{story.university}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
