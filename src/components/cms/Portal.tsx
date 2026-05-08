"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Users,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Settings,
  Plus,
  Search,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  LogOut,
  Star,
  ChevronDown,
  Mail,
  User,
  Clock,
  ArrowLeft,
  FileText,
  FileDown,
  Trash2,
  Edit,
  Eye,
  Link as LinkIcon,
  Filter,
  Save,
  Phone,
  ArrowUpRight,
  Loader2,
  HelpCircle
} from "lucide-react";

// ─── TYPES ───
type Section =
  | "Dashboard" | "Students" | "Blog Posts" | "FAQ Manager" | "Country Pages"
  | "Success Stories" | "Resources" | "Media Library" | "Testimonials"
  | "Branches" | "Settings";

// ─── COMPONENTS ───

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    APPROVED: "bg-[#DCFCE7] text-[#15803D]",
    LIVE: "bg-[#DCFCE7] text-[#15803D]",
    PUBLISHED: "bg-[#DCFCE7] text-[#15803D]",
    "IN PROGRESS": "bg-[#DBEAFE] text-[#1D4ED8]",
    PENDING: "bg-[#FEF9C3] text-[#A16207]",
    REJECTED: "bg-[#FEE2E2] text-[#B91C1C]",
    DRAFT: "bg-[#F3F4F6] text-[#6B7280]",
  };
  const s = status ? status.toUpperCase() : "DRAFT";
  return (
    <span className={`inline-flex items-center rounded-full px-[9px] py-[3px] text-[10px] font-[700] uppercase tracking-[0.04em] ${styles[s] || "bg-[#F3F4F6] text-[#6B7280]"}`}>
      {status || "DRAFT"}
    </span>
  );
};

const Card = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white border border-[#EDE8E8] rounded-[12px] p-[20px] ${className}`}>
    {children}
  </div>
);

const Button = ({ variant = "primary", children, onClick, className = "", loading = false, disabled = false, type = "button" }: any) => {
  const variants: any = {
    primary: "bg-[#A93226] text-white hover:bg-[#7E2219]",
    secondary: "bg-white text-[#555] border border-[#E0DADA] hover:border-[#A93226] hover:text-[#A93226]",
    ghost: "text-[#A93226] hover:bg-[#FEF2F1]",
    destructive: "text-[#999] hover:text-red-600 hover:bg-red-50",
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      className={`rounded-[8px] transition-all duration-200 font-[600] flex items-center justify-center gap-2 ${variant === "ghost" || variant === "destructive" ? "text-[11px] px-[12px] py-[6px]" : "text-[12px] px-[18px] py-[9px]"} ${variants[variant]} ${className} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : children}
    </button>
  );
};

const Modal = ({ title, children, onClose, onSave, loading }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px]">
    <div className="bg-white w-[480px] rounded-[16px] shadow-2xl animate-in fade-in zoom-in duration-200 border border-[#EDE8E8]">
      <div className="p-[28px] pb-4 flex justify-between items-center">
        <h2 className="text-[16px] font-[700] text-[#111]">{title}</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-[#FEF2F1] rounded-full text-[#A93226] transition-colors"><X size={16} /></button>
      </div>
      <div className="px-[28px] pb-[28px] space-y-[14px]">
        {children}
      </div>
      <div className="p-[20px] border-t border-[#F0ECEC] flex justify-end gap-[10px]">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} loading={loading}>Save Changes</Button>
      </div>
    </div>
  </div>
);

export default function TransitPortal() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<Section>("Dashboard");
  const [showModal, setShowModal] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyImageInputRef = useRef<HTMLInputElement>(null);
  const [previewMedia, setPreviewMedia] = useState<any>(null);

  // ─── DATA STATE ───
  const [data, setData] = useState<any>({
    students: [],
    posts: [],
    faqs: [],
    countries: [],
    successStories: [],
    resources: [],
    branches: [],
    testimonials: [],
    settings: {},
    media: {}
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Portal: Starting parallel fetch of all data...');
      const responses = await Promise.all([
        (console.log('Fetching students...'), fetch('/api/cms/students')),
        (console.log('Fetching blog...'), fetch('/api/cms/blog')),
        (console.log('Fetching faqs...'), fetch('/api/cms/faqs')),
        (console.log('Fetching countries...'), fetch('/api/cms/countries')),
        (console.log('Fetching success-stories...'), fetch('/api/cms/success-stories')),
        (console.log('Fetching resources...'), fetch('/api/cms/resources')),
        (console.log('Fetching branches...'), fetch('/api/cms/branches')),
        (console.log('Fetching testimonials...'), fetch('/api/cms/testimonials')),
        (console.log('Fetching settings...'), fetch('/api/cms/settings')),
        (console.log('Fetching media...'), fetch('/api/cms/media'))
      ]);
      console.log('Portal: All responses received.');

      const results = await Promise.all(
        responses.map(async (res, index) => {
          const endpoints = [
            'students', 'blog', 'faqs', 'countries', 'success-stories', 
            'resources', 'branches', 'testimonials', 'settings', 'media'
          ];
          if (!res.ok) {
            const text = await res.text();
            console.error(`Fetch failed for ${endpoints[index]}: ${res.status} ${res.statusText}`, text.slice(0, 200));
            return null;
          }
          return res.json();
        })
      );

      const [students, posts, faqs, countries, stories, resources, branches, testimonials, settings, media] = results;

      setData((prev: any) => ({
        ...prev,
        students: Array.isArray(students) ? students : [],
        posts: Array.isArray(posts) ? posts : [],
        faqs: Array.isArray(faqs) ? faqs.map((f: any) => ({ ...f, page: f.page_path })) : [],
        countries: Array.isArray(countries) ? countries : [],
        successStories: Array.isArray(stories) ? stories : [],
        resources: Array.isArray(resources) ? resources : [],
        branches: Array.isArray(branches) ? branches : [],
        testimonials: Array.isArray(testimonials) ? testimonials : [],
        settings: settings || {},
        media
      }));
    } catch (error) {
      console.error("Failed to fetch CMS data:", error);
      setToast("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      console.log('Portal: Fetching user...');
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.warn('Portal: No user found, redirecting to login...');
        router.push('/cms/login');
        return;
      }
      setUser(user);

      console.log('Portal: Fetching profile for role...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.warn('Portal: Profile fetch error (may not exist):', profileError.message);
      }
      
      setProfile(profile);
      console.log('Portal: User and Profile ready.');
    } catch (err) {
      console.error('Portal: Unexpected error in fetchUser:', err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ─── HANDLERS ───
  const handleSave = async (section: string, item: any) => {
    setLoading(true);
    console.log('[handleSave] section:', section, 'item.id:', item?.id, 'full item:', item);
    try {
      const isSettings = section === 'settings';
      const isEdit = isSettings || !!item.id;
      const apiPath =
        section === "Blog" ? "blog" :
        section === "Country Pages" ? "countries" :
        section === "FAQ" ? "faqs" :
        section.toLowerCase().replace(/ /g, "-");
      const url = isSettings ? '/api/cms/settings' : (isEdit ? `/api/cms/${apiPath}/${item.id || item.code}` : `/api/cms/${apiPath}`);
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!res.ok) throw new Error("Save failed");

      setToast(`${isEdit ? 'Updated' : 'Created'} successfully!`);
      setShowModal(null);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      setToast("Error saving changes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (section: string, id: string) => {
    setLoading(true);
    try {
      const apiPath = section === "Blog" ? "blog" : section.toLowerCase().replace(" ", "-");
      const res = await fetch(`/api/cms/${apiPath}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
      setToast("Deleted successfully!");
      await fetchData();
    } catch (error) {
      setToast("Error deleting item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (filePath: string) => {
    if (!confirm("Are you sure you want to delete this file? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cms/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      if (!res.ok) throw new Error("Delete failed");
      setToast("Media deleted successfully!");
      fetchData();
    } catch (error) {
      setToast("Error deleting media");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/cms/media', { method: 'POST', body: form });
      if (!res.ok) throw new Error("Upload failed");
      setToast(`Uploaded: ${file.name}`);
      fetchData();
    } catch {
      setToast("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/cms/media', { method: 'POST', body: form });
      if (!res.ok) throw new Error("Upload failed");
      const { path } = await res.json();
      setEditingItem((prev: any) => ({ ...prev, approvalImage: path }));
      setToast(`Uploaded: ${file.name}`);
    } catch {
      setToast("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/cms/login');
  };

  // ─── NAVIGATION LOGIC ───
  const sidebarGroups = [
    { label: "MAIN", items: [
      { id: "Dashboard", icon: LayoutDashboard, badge: null },
      { id: "Students", icon: Users, badge: data.students.length },
    ]},
    { label: "CONTENT", items: [
      { id: "Blog Posts", icon: FileText, badge: data.posts.length },
      { id: "FAQ Manager", icon: HelpCircle, badge: data.faqs.length },
      { id: "Country Pages", icon: Globe, badge: null },
      { id: "Success Stories", icon: GraduationCap, badge: data.successStories.length },
      { id: "Resources", icon: FileDown, badge: data.resources.length },
      { id: "Media Library", icon: ImageIcon, badge: null },
      { id: "Testimonials", icon: MessageSquare, badge: null },
    ]},
    { label: "MANAGE", items: [
      { id: "Branches", icon: MapPin, badge: null },
      { id: "Settings", icon: Settings, badge: null },
    ]}
  ];

  // ─── RENDERERS ───

  const renderDashboard = () => {
    const stats = [
      { label: "Total Students", value: data.students.length, up: true, trend: "Live", icon: User },
      { label: "Active Applications", value: data.students.filter((s:any) => ['IN PROGRESS', 'PENDING'].includes(s.status)).length, up: true, trend: "Live", icon: FileText },
      { label: "Visa Approvals", value: data.students.filter((s:any) => s.status === 'APPROVED').length, up: true, trend: "Total", icon: Check },
      { label: "Blog Posts", value: data.posts.length, up: false, trend: "Live", icon: Globe },
    ];

    return (
      <div className="space-y-[20px]">
        <div className="grid grid-cols-4 gap-[20px]">
          {stats.map((stat: any, i: number) => (
            <Card key={i} className="min-h-[140px]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-[36px] h-[36px] bg-[#FEF2F1] rounded-[8px] flex items-center justify-center text-[#A93226]"><stat.icon size={16} /></div>
                <div className={`text-[11px] font-[700] text-[#16a34a]`}>{stat.trend}</div>
              </div>
              <div className="text-[28px] font-[800] text-[#111] leading-tight mb-1">{stat.value}</div>
              <div className="text-[11px] font-[700] text-[#999] uppercase tracking-[0.08em]">{stat.label}</div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-[20px]">
          <Card className="col-span-9 !p-0">
            <div className="p-[20px] border-b border-[#EDE8E8] flex justify-between items-center">
              <h2 className="text-[15px] font-[700] text-[#111]">Recent Applications</h2>
              <button className="text-[#A93226] text-[11px] font-[700]" onClick={() => setActiveSection("Students")}>View All →</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-[700] text-[#BBB] uppercase tracking-[0.08em] border-b">
                  <th className="px-6 py-4">Name</th><th className="px-6 py-4">Branch</th><th className="px-6 py-4">Country</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F3F3]">
                {data.students.slice(0, 5).map((s: any, i: number) => (
                  <tr key={i} className="text-[13px] hover:bg-[#FDFBFB]">
                    <td className="px-6 py-4 font-[600] text-[#111]">{s.name}</td><td className="px-6 py-4">{s.branch}</td><td className="px-6 py-4">{s.country}</td><td className="px-6 py-4"><StatusBadge status={s.status} /></td><td className="px-6 py-4 text-[#BBB]">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="col-span-3 space-y-[20px]">
            <Card className="!p-4">
              <h2 className="text-[13px] font-[700] text-[#111] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-[10px]">
                {[
                  { label: "New Blog", icon: Plus, action: () => router.push("/cms/blog/new") },
                  { label: "Add Story", icon: Star, action: () => setShowModal("Story") },
                  { label: "Upload Media", icon: ImageIcon, action: () => setActiveSection("Media Library") },
                  { label: "Add Student", icon: User, action: () => setShowModal("Student") },
                ].map((act: any, i: number) => (
                  <button key={i} onClick={act.action} className="flex flex-col items-center justify-center p-4 bg-white border border-[#EDE8E8] rounded-[12px] hover:border-[#A93226] hover:bg-[#FEF2F1] group transition-all">
                    <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center text-[#A93226] mb-2"><act.icon size={16} /></div>
                    <span className="text-[11px] font-[700] text-[#555] group-hover:text-[#A93226]">{act.label}</span>
                  </button>
                ))}
              </div>
            </Card>
            <Card className="!p-4"><h2 className="text-[13px] font-[700] text-[#111] mb-4">Branch Activity</h2>
              <div className="space-y-[12px]">
                {data.branches.map((b: any, i: number) => {
                  const studentCount = data.students.filter((s:any) => s.branch === b.name).length;
                  return (
                    <div key={i} className="space-y-1"><div className="flex justify-between items-center text-[11px] font-[700]"><span className="text-[#555]">{b.name}</span><span className="text-[#111]">{studentCount}</span></div><div className="h-1 bg-[#F3F4F6] rounded-full"><div className="h-full bg-[#A93226] rounded-full" style={{ width: `${(studentCount/50)*100}%` }} /></div></div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
        <div className="space-y-[12px]"><h2 className="text-[15px] font-[700] text-[#111]">Recent Success Stories</h2>
          <div className="flex gap-[16px] overflow-x-auto pb-4 scrollbar-hide">
            {data.successStories.slice(0, 6).map((story: any, i: number) => (
              <div key={i} className="min-w-[200px] bg-[#FEF2F1] border border-[#F5C4BF] p-4 rounded-[12px] text-center group hover:bg-[#A93226] transition-all cursor-pointer">
                <div className="text-[10px] font-[700] text-[#A93226] group-hover:text-white uppercase tracking-widest mb-1">{story.flag} {story.country}</div>
                <div className="text-[13px] font-[700] text-[#111] group-hover:text-white truncate">{story.name}</div>
                <div className="text-[11px] text-[#999] group-hover:text-white/80 truncate">{story.university}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStudents = () => (
    <div className="space-y-[20px]">
      <div className="flex justify-between items-center bg-white p-[20px] rounded-[12px] border border-[#EDE8E8]">
        <div className="flex gap-[12px] flex-1 max-w-2xl">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" size={16} /><input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
          <select className="border border-[#E0DADA] rounded-[8px] px-3 py-2 text-[13px] outline-none bg-white"><option>All Branches</option>{data.branches.map((b:any) => <option key={b.id}>{b.name}</option>)}</select>
          <select className="border border-[#E0DADA] rounded-[8px] px-3 py-2 text-[13px] outline-none bg-white"><option>All Status</option><option>Approved</option><option>Pending</option><option>In Progress</option></select>
        </div>
        <Button onClick={() => { setEditingItem(null); setShowModal("Student"); }}><Plus size={14} /> Add Student</Button>
      </div>
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-[700] text-[#BBB] uppercase tracking-[0.08em] border-b">
              <th className="px-6 py-4">Name</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Branch</th><th className="px-6 py-4">Country</th><th className="px-6 py-4">Counselor</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F3F3]">
            {data.students.map((s: any, i: number) => (
              <tr key={i} className="text-[13px] hover:bg-[#FDFBFB]">
                <td className="px-6 py-4 font-[600] text-[#111]">{s.name}</td><td className="px-6 py-4 text-[#555]">{s.phone}</td><td className="px-6 py-4">{s.branch}</td><td className="px-6 py-4">{s.country}</td><td className="px-6 py-4">{s.counselor}</td><td className="px-6 py-4"><StatusBadge status={s.status} /></td><td className="px-6 py-4 flex gap-2">
                  <Button variant="ghost" onClick={() => { setEditingItem(s); setShowModal("Student"); }}><Edit size={14} /></Button>
                  <Button variant="destructive" onClick={() => handleDelete('students', s.id)}><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderBlog = () => (
    <div className="space-y-[20px]">
      <div className="flex justify-between items-center"><h2 className="text-[18px] font-[700] text-[#111]">Blog Management</h2><Button onClick={() => router.push("/cms/blog/new")}><Plus size={14} /> New Post</Button></div>
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-[700] text-[#BBB] uppercase tracking-[0.08em] border-b">
              <th className="px-6 py-4">Title</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Author</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F3F3]">
            {data.posts.map((p: any, i: number) => (
              <tr key={i} className="text-[13px] hover:bg-[#FDFBFB]">
                <td className="px-6 py-4 font-[600] text-[#111] max-w-xs">{p.title}</td><td className="px-6 py-4"><span className="bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded text-[11px] font-bold uppercase">{p.category}</span></td><td className="px-6 py-4">{p.author || p.authorName}</td><td className="px-6 py-4"><StatusBadge status={p.status} /></td><td className="px-6 py-4 text-[#BBB]">{p.date || p.publishDate}</td><td className="px-6 py-4 flex gap-2"><Button variant="ghost" onClick={() => router.push(`/cms/blog/edit/${p.id}`)}><Edit size={14} /></Button><Button variant="destructive" onClick={() => handleDelete('blog', p.id)}><Trash2 size={14} /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderFaqs = () => {
    const categories = ["General", "Canada", "Australia", "UK", "USA", "Germany", "New Zealand", "Japan", "South Korea", "Ireland", "Italy"];
    return (
      <div className="space-y-[20px]">
        <div className="flex justify-between items-center bg-white p-[20px] rounded-[12px] border border-[#EDE8E8]">
          <div className="flex gap-[12px] flex-1 max-w-2xl">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" size={16} /><input type="text" placeholder="Search FAQs..." className="w-full pl-10 pr-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
            <select className="border border-[#E0DADA] rounded-[8px] px-3 py-2 text-[13px] outline-none bg-white"><option>All Categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
                        <select className="border border-[#E0DADA] rounded-[8px] px-3 py-2 text-[13px] outline-none bg-white"><option>All Pages</option><option value="Homepage">Homepage</option><option value="Blog">Blog</option><option value="About">About</option><option value="Contact">Contact</option><option value="Services">Services</option>{data.countries.map((c: any) => <option key={c.id} value={`study-abroad/${c.id}`}>study-abroad/{c.id}</option>)}</select>

          </div>
          <Button onClick={() => { setEditingItem({ status: 'Published', featured: false, order: 1 }); setShowModal("FAQ"); }}><Plus size={14} /> Add FAQ</Button>
        </div>
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-[700] text-[#BBB] uppercase tracking-[0.08em] border-b">
                <th className="px-6 py-4 w-20">Order</th><th className="px-6 py-4">Question</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Page</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Featured</th><th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F3F3]">
              {data.faqs.map((f: any, i: number) => (
                <tr key={i} className="text-[13px] hover:bg-[#FDFBFB]">
                  <td className="px-6 py-4 font-[700] text-[#BBB]">#{f.order}</td>
                  <td className="px-6 py-4 font-[600] text-[#111] max-w-md">{f.question}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${f.category === 'Canada' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{f.category}</span></td>
                  <td className="px-6 py-4 text-[#555]">{f.page}</td>
                  <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                  <td className="px-6 py-4">
                    <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${f.featured ? 'bg-[#A93226]' : 'bg-gray-200'}`} onClick={() => handleSave('FAQ', {...f, featured: !f.featured})}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${f.featured ? 'left-6' : 'left-1'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Button variant="ghost" onClick={() => { setEditingItem(f); setShowModal("FAQ"); }}><Edit size={14} /></Button>
                    <Button variant="destructive" onClick={() => handleDelete('faqs', f.id)}><Trash2 size={14} /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  const renderCountries = () => {
    if (editingItem && activeSection === "Country Pages") {
      const ugReqs: string[] = editingItem.entryRequirements?.ug || [];
      const pgReqs: string[] = editingItem.entryRequirements?.pg || [];
      const visaSteps: { title: string; text: string }[] = Array.isArray(editingItem.visaProcess) ? editingItem.visaProcess : [];
      const requiredDocs: string[] = Array.isArray(editingItem.requiredDocuments) ? editingItem.requiredDocuments : [];

      const setER = (key: 'ug' | 'pg', items: string[]) =>
        setEditingItem((p: any) => ({ ...p, entryRequirements: { ...(p.entryRequirements || {}), [key]: items } }));

      const setVisa = (steps: { title: string; text: string }[]) =>
        setEditingItem((p: any) => ({ ...p, visaProcess: steps }));

      const setDocs = (docs: string[]) =>
        setEditingItem((p: any) => ({ ...p, requiredDocuments: docs }));

      const inputCls = "w-full px-3 py-2 border border-[#E0DADA] rounded-[8px] text-[12px] outline-none focus:border-[#A93226]";
      const labelCls = "text-[10px] font-[700] text-[#999] uppercase tracking-wide";

      return (
        <div className="animate-in slide-in-from-right duration-300 space-y-5 max-w-4xl pb-10">
          {/* Header */}
          <div className="flex items-center gap-4 bg-white p-4 rounded-[12px] border border-[#EDE8E8] sticky top-0 z-10">
            <button onClick={() => setEditingItem(null)} className="p-1.5 hover:bg-[#FEF2F1] rounded-full text-[#A93226]"><ArrowLeft size={18} /></button>
            <div>
              <h2 className="text-[15px] font-[700] text-[#111]">Edit {editingItem.name}</h2>
              <p className="text-[10px] text-[#BBB]">Changes saved to database and reflected live</p>
            </div>
            <div className="ml-auto flex gap-3">
              <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button loading={loading} onClick={() => handleSave('Country Pages', editingItem)}><Save size={13} /> Save All</Button>
            </div>
          </div>

          {/* Basic Info */}
          <Card>
            <h3 className="text-[11px] font-[700] text-[#999] uppercase tracking-widest mb-4">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelCls}>Hero Title</label>
                <input type="text" value={editingItem.heroTitle || ''} onChange={e => setEditingItem({ ...editingItem, heroTitle: e.target.value })} className={inputCls} placeholder="Study in Canada" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Status</label>
                <select value={editingItem.status || 'DRAFT'} onChange={e => setEditingItem({ ...editingItem, status: e.target.value })} className={inputCls + " bg-white"}>
                  <option value="LIVE">LIVE</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Major Intakes</label>
                <input type="text" value={editingItem.intakes || ''} onChange={e => setEditingItem({ ...editingItem, intakes: e.target.value })} className={inputCls} placeholder="Feb, July, November" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Visa Processing Time</label>
                <input type="text" value={editingItem.visaTime || ''} onChange={e => setEditingItem({ ...editingItem, visaTime: e.target.value })} className={inputCls} placeholder="4–6 weeks" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Tuition Range</label>
                <input type="text" value={editingItem.tuition || ''} onChange={e => setEditingItem({ ...editingItem, tuition: e.target.value })} className={inputCls} placeholder="CAD 15,000–35,000/year" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Top Universities (comma-separated)</label>
                <input type="text" value={editingItem.universities || ''} onChange={e => setEditingItem({ ...editingItem, universities: e.target.value })} className={inputCls} placeholder="University of Toronto, UBC..." />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <label className={labelCls}>Why Study Here</label>
              <textarea rows={3} value={editingItem.whyStudy || ''} onChange={e => setEditingItem({ ...editingItem, whyStudy: e.target.value })} className={inputCls + " resize-none"} />
            </div>
            <div className="mt-4 space-y-1">
              <label className={labelCls}>Major Intakes Description</label>
              <textarea rows={2} value={editingItem.majorIntakesDescription || ''} onChange={e => setEditingItem({ ...editingItem, majorIntakesDescription: e.target.value })} className={inputCls + " resize-none"} placeholder="Describe the intake periods in detail..." />
            </div>
          </Card>

          {/* Entry Requirements */}
          <Card>
            <h3 className="text-[11px] font-[700] text-[#999] uppercase tracking-widest mb-4">Entry Requirements</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* UG */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-[700] text-[#A93226] uppercase">Undergraduate / Bachelors</h4>
                  <button onClick={() => setER('ug', [...ugReqs, ''])} className="text-[10px] font-[700] text-[#A93226] flex items-center gap-1 hover:opacity-70"><Plus size={11} /> Add</button>
                </div>
                <div className="space-y-2">
                  {ugReqs.map((req, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-5 h-5 rounded-full bg-[#A93226] text-white flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</div>
                      <input
                        type="text"
                        value={req}
                        onChange={e => { const u = [...ugReqs]; u[i] = e.target.value; setER('ug', u); }}
                        className="flex-1 px-3 py-1.5 border border-[#E0DADA] rounded-[8px] text-[12px] outline-none focus:border-[#A93226]"
                        placeholder="e.g. IELTS 6.0 or equivalent"
                      />
                      <button onClick={() => setER('ug', ugReqs.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[6px]"><Trash2 size={11} /></button>
                    </div>
                  ))}
                  {ugReqs.length === 0 && <p className="text-[11px] text-[#BBB]">No requirements added.</p>}
                </div>
              </div>
              {/* PG */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-[700] text-[#333] uppercase">Masters / Postgraduate</h4>
                  <button onClick={() => setER('pg', [...pgReqs, ''])} className="text-[10px] font-[700] text-[#333] flex items-center gap-1 hover:opacity-70"><Plus size={11} /> Add</button>
                </div>
                <div className="space-y-2">
                  {pgReqs.map((req, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-5 h-5 rounded-full bg-[#333] text-white flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</div>
                      <input
                        type="text"
                        value={req}
                        onChange={e => { const u = [...pgReqs]; u[i] = e.target.value; setER('pg', u); }}
                        className="flex-1 px-3 py-1.5 border border-[#E0DADA] rounded-[8px] text-[12px] outline-none focus:border-[#333]"
                        placeholder="e.g. Bachelors from recognized university"
                      />
                      <button onClick={() => setER('pg', pgReqs.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[6px]"><Trash2 size={11} /></button>
                    </div>
                  ))}
                  {pgReqs.length === 0 && <p className="text-[11px] text-[#BBB]">No requirements added.</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Visa Process */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-[700] text-[#999] uppercase tracking-widest">Visa Process Steps</h3>
              <button
                onClick={() => setVisa([...visaSteps, { title: '', text: '' }])}
                className="text-[10px] font-[700] text-[#A93226] flex items-center gap-1 hover:opacity-70"
              ><Plus size={11} /> Add Step</button>
            </div>
            <div className="space-y-3">
              {visaSteps.map((step, i) => (
                <div key={i} className="flex gap-3 p-4 bg-[#F9F4F4] rounded-[10px] border border-[#EDE8E8]">
                  <div className="w-7 h-7 rounded-full bg-[#A93226] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">{i + 1}</div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => { const u = [...visaSteps]; u[i] = { ...u[i], title: e.target.value }; setVisa(u); }}
                      placeholder="Step title (e.g. Gather Documents)"
                      className="w-full px-3 py-2 border border-[#E0DADA] rounded-[8px] text-[12px] font-[600] outline-none focus:border-[#A93226] bg-white"
                    />
                    <textarea
                      rows={2}
                      value={step.text}
                      onChange={e => { const u = [...visaSteps]; u[i] = { ...u[i], text: e.target.value }; setVisa(u); }}
                      placeholder="Brief description of this step..."
                      className="w-full px-3 py-2 border border-[#E0DADA] rounded-[8px] text-[12px] outline-none focus:border-[#A93226] bg-white resize-none"
                    />
                  </div>
                  <button onClick={() => setVisa(visaSteps.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[6px] self-start"><Trash2 size={12} /></button>
                </div>
              ))}
              {visaSteps.length === 0 && <p className="text-[12px] text-[#BBB] text-center py-4">No steps yet. Click "Add Step" to begin.</p>}
            </div>
          </Card>

          {/* Required Documents */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-[700] text-[#999] uppercase tracking-widest">Required Documents</h3>
              <button onClick={() => setDocs([...requiredDocs, ''])} className="text-[10px] font-[700] text-[#A93226] flex items-center gap-1 hover:opacity-70"><Plus size={11} /> Add</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {requiredDocs.map((doc, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={doc}
                    onChange={e => { const u = [...requiredDocs]; u[i] = e.target.value; setDocs(u); }}
                    className="flex-1 px-3 py-2 border border-[#E0DADA] rounded-[8px] text-[12px] outline-none focus:border-[#A93226]"
                    placeholder="e.g. Passport Copy"
                  />
                  <button onClick={() => setDocs(requiredDocs.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[6px]"><Trash2 size={11} /></button>
                </div>
              ))}
              {requiredDocs.length === 0 && <p className="col-span-2 text-[11px] text-[#BBB]">No documents listed.</p>}
            </div>
          </Card>

          {/* SEO */}
          <Card>
            <h3 className="text-[11px] font-[700] text-[#999] uppercase tracking-widest mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className={labelCls}>Meta Title</label>
                  <span className={`text-[10px] font-[600] ${(editingItem.metaTitle || '').length > 60 ? 'text-red-500' : 'text-[#BBB]'}`}>{(editingItem.metaTitle || '').length}/60</span>
                </div>
                <input type="text" value={editingItem.metaTitle || ''} onChange={e => setEditingItem({ ...editingItem, metaTitle: e.target.value })} className={inputCls} placeholder={`Study in ${editingItem.name} | Transit Education`} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className={labelCls}>Meta Description</label>
                  <span className={`text-[10px] font-[600] ${(editingItem.metaDescription || '').length > 160 ? 'text-red-500' : 'text-[#BBB]'}`}>{(editingItem.metaDescription || '').length}/160</span>
                </div>
                <textarea rows={3} value={editingItem.metaDescription || ''} onChange={e => setEditingItem({ ...editingItem, metaDescription: e.target.value })} className={inputCls + " resize-none"} placeholder={`Complete guide to studying in ${editingItem.name} for Nepali students — visa, tuition, intakes.`} />
              </div>
            </div>
          </Card>

          {/* Bottom Save */}
          <div className="flex gap-3">
            <Button loading={loading} onClick={() => handleSave('Country Pages', editingItem)} className="px-8"><Save size={13} /> Save All Changes</Button>
            <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-[16px]">
        {data.countries.map((c: any, i: number) => (
          <Card key={i} className="hover:border-[#A93226]/30 transition-all cursor-pointer" onClick={() => {
            setEditingItem({
              ...c,
              entryRequirements: (c.entryRequirements && typeof c.entryRequirements === 'object' && !Array.isArray(c.entryRequirements))
                ? c.entryRequirements
                : { ug: [], pg: [] },
              visaProcess: Array.isArray(c.visaProcess) ? c.visaProcess : [],
              requiredDocuments: Array.isArray(c.requiredDocuments) ? c.requiredDocuments : [],
            });
          }}>
            <div className="flex justify-between items-start mb-4"><div className="text-[32px]">{c.flag}</div><StatusBadge status={c.status} /></div>
            <h3 className="text-[15px] font-[600] text-[#111] mb-1">{c.name}</h3>
            <p className="text-[11px] text-[#BBB] mb-4">
              {c.visaProcess?.length > 0 ? `${c.visaProcess.length} visa steps` : 'No visa steps'} · {(c.entryRequirements?.ug?.length || 0) + (c.entryRequirements?.pg?.length || 0)} requirements
            </p>
            <Button variant="ghost" className="w-full">Edit Content</Button>
          </Card>
        ))}
      </div>
    );
  };

  const renderStories = () => (
    <div className="space-y-[20px]">
      <div className="flex justify-between items-center"><h2 className="text-[18px] font-[700] text-[#111]">Success Stories</h2><Button onClick={() => { setEditingItem({ year: new Date().getFullYear().toString() }); setShowModal("Story"); }}><Plus size={14} /> Add Story</Button></div>
      <div className="grid grid-cols-3 gap-[16px]">
        {data.successStories.map((s: any, i: number) => (
          <Card key={i}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F1] text-[#A93226] flex items-center justify-center font-bold overflow-hidden border border-[#EDE8E8]">
                {s.approvalImage ? <img src={s.approvalImage} alt={s.name} className="w-full h-full object-cover" /> : s.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-[13px] text-[#111]">{s.name}</h4>
                <p className="text-[11px] text-[#A93226] font-bold">{s.flag} {s.country}</p>
              </div>
            </div>
            <div className="text-[12px] text-[#555] space-y-1 mb-4">
              <p className="truncate"><strong>Uni:</strong> {s.university}</p>
              <p className="truncate"><strong>Course:</strong> {s.course}</p>
              <p><strong>Year:</strong> {s.year}</p>
            </div>
            <div className="flex gap-2 pt-4 border-t"><Button variant="ghost" className="flex-1" onClick={() => { setEditingItem(s); setShowModal("Story"); }}><Edit size={12} /></Button><Button variant="destructive" className="flex-1" onClick={() => handleDelete('success-stories', s.id)}><Trash2 size={12} /></Button></div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMediaLibrary = () => {
    const allFiles = (Object.values(data.media).flat() as any[]).sort((a, b) => (b.mtimeMs || 0) - (a.mtimeMs || 0));
    return (
      <div className="space-y-[20px]">
        <div className="flex justify-between items-center bg-white p-[20px] rounded-[12px] border border-[#EDE8E8]">
          <div className="flex gap-[12px] flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBB]" size={16} />
              <input type="text" placeholder="Search media..." className="w-full pl-10 pr-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary"><Filter size={14} /> Filter</Button>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUploadMedia} />
            <Button onClick={() => fileInputRef.current?.click()}><Plus size={14} /> Upload New</Button>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-[16px]">
          {allFiles.map((file: any, i: number) => (
            <div key={i} onClick={() => setPreviewMedia(file)} className="group relative aspect-square bg-white border border-[#EDE8E8] rounded-[12px] overflow-hidden hover:border-[#A93226] transition-all cursor-pointer">
              <img src={file.path} alt={file.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                <p className="text-white text-[10px] font-bold truncate w-full">{file.name}</p>
                <p className="text-white/70 text-[8px] mb-2">{file.size}</p>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); setPreviewMedia(file); }} className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white"><Eye size={12} /></button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteMedia(file.path); }}
                    className="p-1.5 bg-white/20 hover:bg-red-500/40 rounded-full text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {allFiles.length === 0 && (
            <div className="col-span-6 py-20 text-center text-[#999]">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>No media files found in public/media</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResources = () => (
    <div className="space-y-[20px]">
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] font-[700] text-[#111]">Student Resources</h2>
        <Button onClick={() => { setEditingItem({ status: 'published', type: 'PDF' }); setShowModal("Resource"); }}><Plus size={14} /> Add Resource</Button>
      </div>
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-[700] text-[#BBB] uppercase tracking-[0.08em] border-b">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Size/Link</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F3F3]">
            {data.resources.map((r: any, i: number) => (
              <tr key={i} className="text-[13px] hover:bg-[#FDFBFB]">
                <td className="px-6 py-4 font-[600] text-[#111]">{r.title}</td>
                <td className="px-6 py-4 text-[#777]">{r.category}</td>
                <td className="px-6 py-4"><span className="bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded text-[10px] font-bold uppercase">{r.type}</span></td>
                <td className="px-6 py-4 text-[#BBB]">{r.file_size}</td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="ghost" onClick={() => { setEditingItem(r); setShowModal("Resource"); }}><Edit size={14} /></Button>
                  <Button variant="destructive" onClick={() => handleDelete('resources', r.id)}><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-[20px]">
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] font-[700] text-[#111]">Student Testimonials</h2>
        <Button onClick={() => { setEditingItem(null); setShowModal("Testimonial"); }}><Plus size={14} /> Add Testimonial</Button>
      </div>
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-[700] text-[#BBB] uppercase tracking-[0.08em] border-b">
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Country</th>
              <th className="px-6 py-4">Testimonial</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F7F3F3]">
            {data.testimonials.map((t: any, i: number) => (
              <tr key={i} className="text-[13px] hover:bg-[#FDFBFB]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FEF2F1] overflow-hidden border border-[#EDE8E8]">
                      {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : t.name[0]}
                    </div>
                    <div>
                      <p className="font-[600] text-[#111]">{t.name}</p>
                      <p className="text-[11px] text-[#999]">{t.course}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{t.country}</td>
                <td className="px-6 py-4 max-w-md truncate text-[#777]">{t.body}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, idx) => <Star key={idx} size={12} fill={idx < t.rating ? "currentColor" : "none"} />)}
                  </div>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Button variant="ghost" onClick={() => { setEditingItem(t); setShowModal("Testimonial"); }}><Edit size={14} /></Button>
                  <Button variant="destructive" onClick={() => handleDelete('testimonials', t.id)}><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const renderBranches = () => (
    <div className="space-y-[20px]">
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] font-[700] text-[#111]">Our Branches</h2>
        <Button onClick={() => { setEditingItem(null); setShowModal("Branch"); }}><Plus size={14} /> Add Branch</Button>
      </div>
      <div className="grid grid-cols-2 gap-[20px]">
        {data.branches.map((b: any, i: number) => (
          <Card key={i} className="flex gap-6 items-start">
            <div className="w-[60px] h-[60px] bg-[#FEF2F1] rounded-[16px] flex items-center justify-center text-[#A93226] shrink-0">
              <MapPin size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[16px] font-[700] text-[#111]">{b.name}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" className="!p-2" onClick={() => { setEditingItem(b); setShowModal("Branch"); }}><Edit size={14} /></Button>
                  <Button variant="destructive" className="!p-2" onClick={() => handleDelete('branches', b.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
              <div className="space-y-2 text-[12px] text-[#666]">
                <p className="flex items-center gap-2"><MapPin size={14} className="text-[#BBB]" /> {b.addr}</p>
                <div className="grid grid-cols-2 gap-2">
                  <p className="flex items-center gap-2"><Phone size={14} className="text-[#BBB]" /> {b.phone}</p>
                  <p className="flex items-center gap-2"><User size={14} className="text-[#BBB]" /> {b.mgr}</p>
                </div>
                <p className="flex items-center gap-2"><Clock size={14} className="text-[#BBB]" /> {b.hours}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );


  const renderSettings = () => (
    <div className="space-y-[20px] max-w-4xl">
      <Card><h3 className="text-[15px] font-[700] text-[#111] mb-6">Site Information</h3>
        <div className="grid grid-cols-2 gap-[14px]">
          <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Site Name</label><input type="text" value={data.settings.siteName || ''} onChange={e => setData({...data, settings: {...data.settings, siteName: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
          <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Tagline</label><input type="text" value={data.settings.tagline || ''} onChange={e => setData({...data, settings: {...data.settings, tagline: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
          <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Contact Email</label><input type="text" value={data.settings.email || ''} onChange={e => setData({...data, settings: {...data.settings, email: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
          <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Phone</label><input type="text" value={data.settings.phone || ''} onChange={e => setData({...data, settings: {...data.settings, phone: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#EDE8E8]">
          <h3 className="text-[13px] font-[700] text-[#111] mb-6">Social Media & Communication</h3>
          <div className="grid grid-cols-2 gap-[14px]">
            <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Facebook URL</label><input type="text" value={data.settings.facebookUrl || ''} onChange={e => setData({...data, settings: {...data.settings, facebookUrl: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
            <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Instagram URL</label><input type="text" value={data.settings.instagramUrl || ''} onChange={e => setData({...data, settings: {...data.settings, instagramUrl: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
            <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">LinkedIn URL</label><input type="text" value={data.settings.linkedinUrl || ''} onChange={e => setData({...data, settings: {...data.settings, linkedinUrl: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
            <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">WhatsApp Number</label><input type="text" value={data.settings.whatsappNumber || ''} onChange={e => setData({...data, settings: {...data.settings, whatsappNumber: e.target.value}})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" placeholder="e.g. 9779851315991" /></div>
          </div>
        </div>

      </Card>
      <Button className="px-10 py-3 text-[14px]" loading={loading} onClick={() => handleSave('settings', data.settings)}>Save All Settings</Button>
    </div>
  );

  // ─── MAIN ───

  return (
    <div className="flex h-screen bg-[#F7F3F3] text-[#555] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif !important; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* SIDEBAR */}
      <aside className="w-[232px] bg-white border-r border-[#EDE8E8] flex flex-col h-full shrink-0">
        <div className="px-5 py-4 border-b border-[#F0ECEC] bg-white">
          <img
            src="https://vlrhwdcqzpfqpbqeaqyr.supabase.co/storage/v1/object/public/media/2021/05/Logo-png_website.png"
            alt="Transit Education"
            className="w-full max-w-[152px] h-auto object-contain"
          />
          <div className="mt-2 inline-flex items-center gap-1 bg-[#FEF2F1] border border-[#F5C4BF] rounded-full px-[8px] py-[3px]">
            <div className="w-[5px] h-[5px] rounded-full bg-[#A93226]" />
            <span className="text-[#A93226] text-[9px] font-[700] tracking-[0.1em] uppercase">CMS Portal</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebarGroups.map((g: any, i: number) => (
            <div key={i} className="mb-4">
              <div className="px-[20px] py-[8px] text-[9px] font-[700] uppercase tracking-[0.12em] text-[#C4BCBC]">{g.label}</div>
              {g.items.map((item: any) => {
                const isActive = activeSection === item.id;
                return (
                  <button key={item.id} onClick={() => {setActiveSection(item.id as Section); setEditingItem(null);}} className={`w-[calc(100%-16px)] flex items-center justify-between px-[12px] py-[9px] rounded-[8px] mx-[8px] my-[1px] transition-all duration-200 ${isActive ? "bg-[#A93226] text-white shadow-lg shadow-red-900/20" : "text-[#666] hover:bg-[#FEF2F1] hover:text-[#A93226]"}`}>
                    <div className="flex items-center gap-[10px]"><item.icon size={16} /><span className="text-[12.5px] font-[500] tracking-tight">{item.id}</span></div>
                    {item.badge !== null && <span className={`text-[10px] font-[700] px-[7px] py-[2px] rounded-[10px] ${isActive ? "bg-white/25 text-white" : "bg-[#FEF2F1] text-[#A93226]"}`}>{item.badge}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="p-[16px] border-t border-[#F0ECEC] bg-[#F9F4F4]">
          <div className="flex items-center gap-[10px]">
            <div className="w-[32px] h-[32px] bg-[#A93226] text-white rounded-full flex items-center justify-center font-[700] text-[12px] shadow-md shadow-red-900/20">
              {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-[600] text-[#111] truncate">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] text-[#A93226] font-[700] uppercase tracking-widest">{profile?.role || 'USER'}</p>
            </div>
            <button onClick={handleLogout} className="text-[#BBB] hover:text-[#A93226] transition-colors"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[56px] bg-white border-b border-[#EDE8E8] flex items-center justify-between px-[28px] shrink-0">
          <h1 className="text-[16px] font-[700] text-[#111] tracking-tight">{activeSection}</h1>
          <div className="flex items-center gap-[16px]"><span className="text-[9px] font-[700] text-[#A93226] bg-[#FEF2F1] border border-[#F5C4BF] px-[12px] py-[4px] rounded-full uppercase tracking-[0.04em]">{profile?.role || 'USER'}</span><Button onClick={() => { setEditingItem(null); setShowModal("Student"); }}><Plus size={14} /> Add Student</Button><div className="w-[32px] h-[32px] rounded-full bg-[#A93226] text-white flex items-center justify-center font-[700] text-[11px] border border-white shadow-sm">{(profile?.full_name || user?.email || 'U')[0].toUpperCase()}</div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-[28px] pt-[24px]">
          {loading && !data.students.length && <div className="flex items-center justify-center py-20 text-[#A93226]"><Loader2 className="animate-spin" size={40} /></div>}
          {activeSection === "Dashboard" && renderDashboard()}
          {activeSection === "Students" && renderStudents()}
          {activeSection === "Blog Posts" && renderBlog()}
          {activeSection === "FAQ Manager" && renderFaqs()}
          {activeSection === "Country Pages" && renderCountries()}
          {activeSection === "Success Stories" && renderStories()}
          {activeSection === "Resources" && renderResources()}
          {activeSection === "Media Library" && renderMediaLibrary()}
          {activeSection === "Testimonials" && renderTestimonials()}
          {activeSection === "Branches" && renderBranches()}
          {activeSection === "Settings" && renderSettings()}
        </main>
      </div>

      {/* MODAL SYSTEM */}
      {showModal && (
        <Modal 
          title={editingItem?.id ? `Edit ${showModal}` : `New ${showModal}`}
          onClose={() => { setShowModal(null); setEditingItem(null); }} 
          onSave={() => {
            const sectionMap: Record<string, string> = {
              "Student": "students",
              "Blog": "blog",
              "Story": "success-stories",
              "FAQ": "faqs",
              "Testimonial": "testimonials",
              "Branch": "branches",
              "Resource": "resources"
            };
            handleSave(sectionMap[showModal] || showModal.toLowerCase(), editingItem);
          }}
          loading={loading}
        >
          {showModal === "Student" && (
            <>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Full Name</label><input type="text" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Phone</label><input type="text" value={editingItem?.phone || ''} onChange={e => setEditingItem({...editingItem, phone: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Email</label><input type="text" value={editingItem?.email || ''} onChange={e => setEditingItem({...editingItem, email: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Branch</label><select value={editingItem?.branch || ''} onChange={e => setEditingItem({...editingItem, branch: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="">Select Branch</option>{data.branches.map((b:any) => <option key={b.id}>{b.name}</option>)}</select></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Country</label><select value={editingItem?.country || ''} onChange={e => setEditingItem({...editingItem, country: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="">Select Country</option>{data.countries.map((c:any) => <option key={c.id}>{c.name}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Counselor</label><input type="text" value={editingItem?.counselor || ''} onChange={e => setEditingItem({...editingItem, counselor: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Status</label><select value={editingItem?.status || 'PENDING'} onChange={e => setEditingItem({...editingItem, status: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="PENDING">Pending</option><option value="IN PROGRESS">In Progress</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></div>
              </div>
            </>
          )}
          {showModal === "FAQ" && (
            <>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Question</label><input type="text" value={editingItem?.question || ''} onChange={e => setEditingItem({...editingItem, question: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none focus:border-[#A93226]" /></div>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Answer</label><textarea rows={4} value={editingItem?.answer || ''} onChange={e => setEditingItem({...editingItem, answer: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none focus:border-[#A93226] resize-none"></textarea></div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Category</label><select value={editingItem?.category || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="">Select Category</option>{["General", "Canada", "Australia", "UK", "USA", "Germany", "New Zealand", "Japan", "South Korea", "Ireland", "Italy"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Appears On Page</label><select value={editingItem?.page || 'Homepage'} onChange={e => setEditingItem({...editingItem, page: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="Homepage">Homepage</option><option value="Blog">Blog</option><option value="About">About</option><option value="Contact">Contact</option><option value="Services">Services</option>{data.countries.map((c:any) => <option key={c.id} value={`study-abroad/${c.id}`}>study-abroad/{c.id}</option>)}</select></div>

              </div>
              <div className="grid grid-cols-3 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Status</label><select value={editingItem?.status || 'Draft'} onChange={e => setEditingItem({...editingItem, status: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="Draft">Draft</option><option value="Published">Published</option></select></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Order</label><input type="number" value={editingItem?.order || 1} onChange={e => setEditingItem({...editingItem, order: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="flex flex-col justify-center pt-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editingItem?.featured || false} onChange={e => setEditingItem({...editingItem, featured: e.target.checked})} className="accent-[#A93226]" /><span className="text-[11px] font-[700] text-[#111]">Featured</span></label></div>
              </div>
            </>
          )}
          {showModal === "Story" && (
            <>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Student Name</label><input type="text" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">University</label><input type="text" value={editingItem?.university || ''} onChange={e => setEditingItem({...editingItem, university: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Year</label><input type="text" value={editingItem?.year || ''} onChange={e => setEditingItem({...editingItem, year: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              </div>
                            <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Course</label><input type="text" value={editingItem?.course || ''} onChange={e => setEditingItem({...editingItem, course: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              <div className="space-y-[6px]">
                <label className="text-[10px] font-[700] text-[#999] uppercase">Approval Image</label>
                <div className="flex gap-2">
                  <input type="text" value={editingItem?.approvalImage || ''} onChange={e => setEditingItem({...editingItem, approvalImage: e.target.value})} className="flex-1 px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" placeholder="/media/year/month/filename.png" />
                  <input ref={storyImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleStoryImageUpload} />
                  <button type="button" onClick={() => storyImageInputRef.current?.click()} className="px-3 py-2 bg-[#F7F3F3] border border-[#E0DADA] rounded-[8px] text-[11px] font-[700] text-[#A93226] hover:bg-[#FEF2F1] whitespace-nowrap">Upload</button>
                </div>
                {editingItem?.approvalImage && (
                  <img src={editingItem.approvalImage} alt="preview" className="w-full h-32 object-cover rounded-[8px] border border-[#E0DADA]" />
                )}
              </div>

            </>
          )}
          {showModal === "Resource" && (
            <>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Title</label><input type="text" value={editingItem?.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Category</label><select value={editingItem?.category || ''} onChange={e => setEditingItem({...editingItem, category: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="">Select Category</option><option value="Visa Documents">Visa Documents</option><option value="Official Links">Official Links</option><option value="Test Prep Materials">Test Prep Materials</option></select></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Type</label><select value={editingItem?.type || 'PDF'} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none bg-white"><option value="PDF">PDF</option><option value="External">External Link</option><option value="DOCX">Word Document</option></select></div>
              </div>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">URL / Link</label><input type="text" value={editingItem?.url || ''} onChange={e => setEditingItem({...editingItem, url: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" placeholder="https://... or /media/..." /></div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">File Size / Label</label><input type="text" value={editingItem?.file_size || ''} onChange={e => setEditingItem({...editingItem, file_size: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" placeholder="e.g. 1.2 MB or Link" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Display Order</label><input type="number" value={editingItem?.display_order || 0} onChange={e => setEditingItem({...editingItem, display_order: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              </div>
            </>
          )}
          {showModal === "Testimonial" && (
            <>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Student Name</label><input type="text" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">University</label><input type="text" value={editingItem?.university || ''} onChange={e => setEditingItem({...editingItem, university: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Course</label><input type="text" value={editingItem?.course || ''} onChange={e => setEditingItem({...editingItem, course: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Country</label><input type="text" value={editingItem?.country || ''} onChange={e => setEditingItem({...editingItem, country: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Rating (1-5)</label><input type="number" min="1" max="5" value={editingItem?.rating || 5} onChange={e => setEditingItem({...editingItem, rating: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              </div>
                            <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Testimonial Body</label><textarea rows={4} value={editingItem?.body || ''} onChange={e => setEditingItem({...editingItem, body: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none"></textarea></div>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Photo URL</label><input type="text" value={editingItem?.photo || ''} onChange={e => setEditingItem({...editingItem, photo: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" placeholder="/media/year/month/filename.png" /></div>

            </>
          )}
          {showModal === "Branch" && (
            <>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Branch Name</label><input type="text" value={editingItem?.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Address</label><input type="text" value={editingItem?.addr || ''} onChange={e => setEditingItem({...editingItem, addr: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              <div className="grid grid-cols-2 gap-[14px]">
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Phone</label><input type="text" value={editingItem?.phone || ''} onChange={e => setEditingItem({...editingItem, phone: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
                <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Manager</label><input type="text" value={editingItem?.mgr || ''} onChange={e => setEditingItem({...editingItem, mgr: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" /></div>
              </div>
              <div className="space-y-[6px]"><label className="text-[10px] font-[700] text-[#999] uppercase">Working Hours</label><input type="text" value={editingItem?.hours || ''} onChange={e => setEditingItem({...editingItem, hours: e.target.value})} className="w-full px-4 py-2 border border-[#E0DADA] rounded-[8px] text-[13px] outline-none" placeholder="e.g. Sun-Fri 9am-6pm" /></div>
            </>
          )}
        </Modal>
      )}

      {/* MEDIA PREVIEW LIGHTBOX */}
      {previewMedia && (
        <div onClick={() => setPreviewMedia(null)} className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-6">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-[16px] overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col">
            <div className="relative">
              <img src={previewMedia.path} alt={previewMedia.name} className="w-full max-h-[60vh] object-contain bg-[#F5F5F5]" />
              <button onClick={() => setPreviewMedia(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-[13px] font-[700] text-[#111] truncate">{previewMedia.name}</p>
              <p className="text-[11px] text-[#999]">{previewMedia.size}</p>
              <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-[8px] px-3 py-2">
                <code className="flex-1 text-[11px] text-[#555] truncate">{previewMedia.path}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(previewMedia.path); setToast("URL copied!"); }}
                  className="shrink-0 text-[11px] font-[700] text-[#A93226] hover:underline"
                >Copy URL</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-[24px] right-[24px] z-[200] animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#111111] text-white px-[20px] py-[12px] rounded-[10px] shadow-2xl flex items-center gap-[12px]">
            <div className={`w-[7px] h-[7px] rounded-full bg-[#22c55e]`} /><span className="text-[12px] font-[500]">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
