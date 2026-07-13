"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, FileText, HelpCircle, Globe, GraduationCap,
  FileDown, Image as ImageIcon, MessageSquare, CalendarDays, Briefcase,
  Handshake, MapPin, Settings, LogOut, Plus, Loader2, Gift,
} from "lucide-react";
import { useCmsData }    from "@/hooks/useCmsData";
import { useCmsActions } from "@/hooks/useCmsActions";
import { useCmsAuth }    from "@/hooks/useCmsAuth";
import { TRANSIT_LOGO_URL } from "@/constants/assets";
import type { CmsSection } from "@/constants/cms";
import {
  DashboardSection, StudentsSection, BlogSection, FaqSection,
  CountryPagesSection, SuccessStoriesSection, ResourcesSection,
  MediaLibrarySection, TestimonialsSection, EventsSection,
  CareersSection, FranchiseSection, BranchesSection, SettingsSection,
  LoyaltySection,
} from "@/components/cms/sections";

export default function TransitPortal() {
  const { data, loading: dataLoading, refetch } = useCmsData();
  const { save, remove, deleteMedia, uploadMedia, loading: actionLoading } = useCmsActions(refetch);
  const { user, profile, loading: authLoading, handleLogout } = useCmsAuth();

  const [activeSection, setActiveSection]   = useState<CmsSection>("Dashboard");
  const [toast, setToast]                   = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => { void refetch(); }, [refetch]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const sidebarGroups = [
    { label: "MAIN", items: [
      { id: "Dashboard"           as CmsSection, icon: LayoutDashboard, badge: null },
      { id: "Students"            as CmsSection, icon: Users,           badge: data.students.length },
    ]},
    { label: "CONTENT", items: [
      { id: "Blog Posts"          as CmsSection, icon: FileText,        badge: data.posts.length },
      { id: "FAQ Manager"         as CmsSection, icon: HelpCircle,      badge: data.faqs.length },
      { id: "Country Pages"       as CmsSection, icon: Globe,           badge: null },
      { id: "Success Stories"     as CmsSection, icon: GraduationCap,   badge: data.successStories.length },
      { id: "Resources"           as CmsSection, icon: FileDown,        badge: data.resources.length },
      { id: "Media Library"       as CmsSection, icon: ImageIcon,       badge: null },
      { id: "Testimonials"        as CmsSection, icon: MessageSquare,   badge: null },
      { id: "Events"              as CmsSection, icon: CalendarDays,    badge: data.events.length },
    ]},
    { label: "MANAGE", items: [
      { id: "Careers"             as CmsSection, icon: Briefcase,       badge: data.jobApplications.length },
      { id: "Franchise Inquiries" as CmsSection, icon: Handshake,       badge: data.franchiseInquiries.length },
      { id: "Loyalty"             as CmsSection, icon: Gift,            badge: data.loyaltyRedemptions.filter(r => r.status === "PENDING").length + data.loyaltyCompletions.filter(c => c.status === "PENDING").length },
      { id: "Branches"            as CmsSection, icon: MapPin,          badge: null },
      { id: "Settings"            as CmsSection, icon: Settings,        badge: null },
    ]},
  ];

  const onToast = (msg: string) => setToast(msg);
  const sp = { data, actionsLoading: actionLoading, onSave: save, onDelete: remove, onToast };

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center bg-[#F7F3F3]">
      <Loader2 className="animate-spin text-brand" size={40} />
    </div>
  );

  const initials = (profile?.full_name ?? user?.email ?? 'U')[0].toUpperCase();

  return (
    <div
      className="flex h-screen bg-[#F7F3F3] text-gray-600 overflow-hidden"
      onClick={() => showProfileMenu && setShowProfileMenu(false)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="w-58 bg-white border-r border-[#EDE8E8] flex flex-col h-full shrink-0">
        <div className="px-5 py-4 border-b border-[#F0ECEC]">
          <img src={TRANSIT_LOGO_URL} alt="Transit Education" className="w-full max-w-38 h-auto object-contain" />
          <div className="mt-2 inline-flex items-center gap-1 bg-[#FEF2F1] border border-[#F5C4BF] rounded-full px-2 py-0.75">
            <div className="w-1.25 h-1.25 rounded-full bg-brand" />
            <span className="text-brand text-[9px] font-bold tracking-widest uppercase">CMS Portal</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {sidebarGroups.map((g, gi) => (
            <div key={gi} className="mb-4">
              <div className="px-5 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#C4BCBC]">{g.label}</div>
              {g.items.map(item => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-[calc(100%-16px)] flex items-center justify-between px-3 py-2.25 rounded-lg mx-2 my-px transition-all duration-200 ${active ? "bg-brand text-white shadow-lg shadow-red-900/20" : "text-gray-500 hover:bg-[#FEF2F1] hover:text-brand"}`}
                  >
                    <div className="flex items-center gap-2.5"><item.icon size={16} /><span className="text-[12.5px] font-medium tracking-tight">{item.id}</span></div>
                    {item.badge !== null && (
                      <span className={`text-[10px] font-bold px-1.75 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-[#FEF2F1] text-brand"}`}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#F0ECEC] bg-[#F9F4F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center font-bold text-[12px] shadow-md shadow-red-900/20">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-black truncate">{profile?.full_name ?? user?.email?.split('@')[0] ?? 'User'}</p>
              <p className="text-[10px] text-brand font-bold uppercase tracking-widest">{profile?.role ?? 'USER'}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-300 hover:text-brand transition-colors"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-[#EDE8E8] flex items-center justify-between px-7 shrink-0">
          <h1 className="text-[16px] font-bold text-black tracking-tight">{activeSection}</h1>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold text-brand bg-[#FEF2F1] border border-[#F5C4BF] px-3 py-1 rounded-full uppercase tracking-[0.04em]">{profile?.role ?? 'USER'}</span>
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-[11px] border border-white shadow-sm hover:bg-[#7E2219] transition-colors"
              >{initials}</button>
              {showProfileMenu && (
                <div className="absolute right-0 top-10 w-55 bg-white border border-[#EDE8E8] rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-[#F0ECEC]">
                    <p className="text-[13px] font-bold text-black truncate">{profile?.full_name ?? 'User'}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-px">{user?.email}</p>
                    <span className="inline-block mt-1.5 text-[9px] font-bold text-brand bg-[#FEF2F1] border border-[#F5C4BF] px-2 py-0.5 rounded-full uppercase tracking-widest">{profile?.role ?? 'user'}</span>
                  </div>
                  <button onClick={() => { setShowProfileMenu(false); handleLogout(); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-[12px] font-semibold text-red-700 hover:bg-[#FEF2F1] transition-colors">
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-7 pt-6 scrollbar-hide">
          {dataLoading && data.students.length === 0 && (
            <div className="flex items-center justify-center py-20 text-brand"><Loader2 className="animate-spin" size={40} /></div>
          )}

          {activeSection === "Dashboard"           && <DashboardSection data={data} onNavigate={s => setActiveSection(s)} />}
          {activeSection === "Students"            && <StudentsSection {...sp} />}
          {activeSection === "Blog Posts"          && <BlogSection data={data} actionsLoading={actionLoading} onDelete={remove} onToast={onToast} />}
          {activeSection === "FAQ Manager"         && <FaqSection {...sp} />}
          {activeSection === "Country Pages"       && <CountryPagesSection data={data} actionsLoading={actionLoading} onSave={save} onToast={onToast} />}
          {activeSection === "Success Stories"     && <SuccessStoriesSection {...sp} onUpload={uploadMedia} />}
          {activeSection === "Resources"           && <ResourcesSection {...sp} />}
          {activeSection === "Media Library"       && <MediaLibrarySection data={data} actionsLoading={actionLoading} onToast={onToast} onUpload={uploadMedia} onDeleteMedia={deleteMedia} />}
          {activeSection === "Testimonials"        && <TestimonialsSection {...sp} />}
          {activeSection === "Events"              && <EventsSection {...sp} onUpload={uploadMedia} />}
          {activeSection === "Careers"             && <CareersSection {...sp} />}
          {activeSection === "Franchise Inquiries" && <FranchiseSection {...sp} />}
          {activeSection === "Loyalty"             && <LoyaltySection {...sp} />}
          {activeSection === "Branches"            && <BranchesSection {...sp} />}
          {activeSection === "Settings"            && <SettingsSection data={data} actionsLoading={actionLoading} onSave={save} onToast={onToast} />}

        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#111] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-1.75 h-1.75 rounded-full bg-green-400" />
            <span className="text-[12px] font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
