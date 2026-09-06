"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Globe,
  User,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BookOpen,
  TrendingUp,
  Link2,
  ExternalLink,
} from "lucide-react";
import TiptapEditor from "@/components/cms/TiptapEditor";
import { cn } from "@/lib/utils";
import { BlogPost, FAQItem } from "@/lib/types/blog";
import { toast } from "sonner";
import { useCmsAuth } from "@/hooks/useCmsAuth";

type BlogEditorProps = {
  initialData?: BlogPost;
  isEdit?: boolean;
};

export default function BlogEditor({ initialData, isEdit }: BlogEditorProps) {
  const router = useRouter();
  const { profile } = useCmsAuth();
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [tagsInput, setTagsInput] = useState((initialData?.tags || []).join(", "));
  const [secondaryKwInput, setSecondaryKwInput] = useState((initialData?.secondaryKeywords || []).join(", "));
  const featuredImageInputRef = React.useRef<HTMLInputElement>(null);

  // ─── CATEGORIES (DB-driven) ───
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  // ─── STATE ───
  const [formData, setFormData] = useState<Partial<BlogPost>>(
    initialData || {
      title: "",
      slug: "",
      body: "",
      category: "Visa Tips",
      status: "draft",
      tags: [],
      authorName: "",
      metaTitle: "",
      metaDescription: "",
      faqItems: [],
      sources: [],
      primaryQuestion: "",
      answerSummary: "",
      focusKeyword: "",
      authorCredential: "",
      lastReviewed: "",
      authorBio: "",
      featuredImage: "",
      secondaryKeywords: [],
      ogDescription: "",
      noindex: false,
    }
  );

  // ─── DEFAULT AUTHOR TO THE LOGGED-IN USER ───
  // Profile loads asynchronously after this component mounts, so it can't be
  // read at useState-initializer time; fill it in once it arrives, but only
  // for a brand-new post the user hasn't already typed an author name into.
  useEffect(() => {
    const defaultAuthorName = profile?.full_name;
    if (!isEdit && !formData.authorName && defaultAuthorName) {
      setFormData(prev => ({ ...prev, authorName: defaultAuthorName }));
    }
  }, [isEdit, formData.authorName, profile?.full_name]);

  // ─── AUTO-GENERATE SLUG ───
  useEffect(() => {
    if (!isEdit && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: prev.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      }));
    }
  }, [formData.title, isEdit]);

  // ─── LOAD CATEGORIES ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cms/blog/categories');
        if (!res.ok) throw new Error();
        const data: string[] = await res.json();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) toast.error('Failed to load categories');
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Merges in the post's current category in case it predates the fetched
  // list (e.g. a draft-only category not yet covered by a published post).
  const categoryOptions = useMemo(() => {
    const set = new Set(categories);
    if (formData.category) set.add(formData.category);
    return Array.from(set).sort();
  }, [categories, formData.category]);

  // ─── READING TIME ───
  const readingTime = useMemo(() => {
    const words = formData.body?.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length || 0;
    const time = Math.ceil(words / 200);
    return `${time} min read`;
  }, [formData.body]);

  // ─── INTERNAL LINKS ───
  const internalLinks = useMemo(() => {
    const body = formData.body || '';
    const matches = [...body.matchAll(/href="(\/[^"]*|https?:\/\/(?:www\.)?transiteducation\.com\.np[^"]*)"/gi)];
    return matches.map(m => m[1]);
  }, [formData.body]);

  // ─── SEO SCORE ───
  const seoScore = useMemo(() => {
    const kw = (formData.focusKeyword || '').toLowerCase();
    const checks: { label: string; pts: number; pass: boolean }[] = [
      { label: "Meta title 50–60 chars", pts: 10, pass: (formData.metaTitle?.length || 0) >= 50 && (formData.metaTitle?.length || 0) <= 60 },
      { label: "Meta description 120–160 chars", pts: 10, pass: (formData.metaDescription?.length || 0) >= 120 && (formData.metaDescription?.length || 0) <= 160 },
      { label: "Focus keyword set", pts: 10, pass: !!kw },
      { label: "Keyword in title", pts: 10, pass: !!(kw && formData.title?.toLowerCase().includes(kw)) },
      { label: "Keyword in meta description", pts: 5, pass: !!(kw && formData.metaDescription?.toLowerCase().includes(kw)) },
      { label: "3+ tags", pts: 5, pass: (formData.tags?.length || 0) >= 3 },
      { label: "Quick answer filled", pts: 10, pass: !!formData.answerSummary },
      { label: "3+ FAQ items", pts: 10, pass: (formData.faqItems?.length || 0) >= 3 },
      { label: "Sources referenced", pts: 5, pass: (formData.sources?.length || 0) >= 1 },
      { label: "Author credential", pts: 5, pass: !!formData.authorCredential },
      { label: "Review date set", pts: 5, pass: !!formData.lastReviewed },
      { label: "Secondary keywords", pts: 5, pass: (formData.secondaryKeywords?.length || 0) >= 1 },
      { label: "Internal links in body", pts: 10, pass: internalLinks.length > 0 },
    ];
    const score = checks.reduce((acc, c) => acc + (c.pass ? c.pts : 0), 0);
    return { checks, score };
  }, [formData, internalLinks]);

  // ─── HANDLERS ───
  const handleChange = (field: keyof BlogPost, value: any) => {
    if (field === 'slug' && typeof value === 'string') {
      value = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const commitNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed) {
      handleChange("category", trimmed);
      setCategories(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    }
    setIsAddingCategory(false);
    setNewCategoryInput("");
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/cms/media', { method: 'POST', body: form });
      if (!res.ok) throw new Error();
      const { path } = await res.json();
      handleChange('featuredImage', path);
      toast.success(`Uploaded: ${file.name}`);
    } catch {
      toast.error('Upload failed');
    }
  };

  const handleSave = async (statusOverride?: "draft" | "published") => {
    setLoading(true);
    const finalStatus = statusOverride || formData.status;
    const payload = { ...formData, status: finalStatus, readingTime };

    try {
      const url = isEdit ? `/api/cms/blog/${formData.id}` : "/api/cms/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        toast.error("That URL slug is already used by another post — change the slug and try again.");
        return;
      }
      if (!res.ok) throw new Error("Failed to save");

      toast.success(isEdit ? "Post updated!" : "Post created!");
      setIsSaved(true);
      if (!isEdit) router.push("/cms");
    } catch {
      toast.error("Error saving post");
    } finally {
      setLoading(false);
    }
  };

  // Warn before losing unsaved edits (tab close / reload / hard nav).
  useEffect(() => {
    if (isSaved) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isSaved]);

  const leaveEditor = () => {
    if (isSaved || window.confirm("You have unsaved changes. Leave without saving?")) {
      router.back();
    }
  };

  const addFAQ = () => {
    const items = [...(formData.faqItems || []), { question: "", answer: "" }];
    handleChange("faqItems", items);
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    const items = [...(formData.faqItems || [])];
    items[index] = { ...items[index], [field]: value };
    handleChange("faqItems", items);
  };

  const removeFAQ = (index: number) => {
    const items = formData.faqItems?.filter((_, i) => i !== index);
    handleChange("faqItems", items);
  };

  const scoreColor = seoScore.score >= 80 ? "text-green-700 bg-green-50" : seoScore.score >= 50 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  const barColor = seoScore.score >= 80 ? "bg-green-500" : seoScore.score >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="min-h-screen bg-off-white pb-24">
      {/* Top Header */}
      <header className="h-[64px] bg-white border-b border-[#EDE8E8] sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={leaveEditor}
            className="p-2 hover:bg-brand-surface rounded-full text-brand transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="text-[14px] font-[700] text-black">
            {isEdit ? "Edit Blog Post" : "New Blog Post"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#999]">
            {isSaved ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500" /> Changes saved</span>
            ) : (
              <span className="flex items-center gap-1.5 animate-pulse"><Clock size={14} /> Unsaved changes...</span>
            )}
          </span>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-8 grid grid-cols-12 gap-8">
        {/* LEFT COLUMN - WRITING AREA */}
        <div className="col-span-8 space-y-6">
          <div className="bg-white rounded-[20px] p-10 shadow-sm border border-[#EDE8E8]">
            <input
              type="text"
              placeholder="Post Title..."
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full text-[42px] font-[800] text-black placeholder-[#E0DADA] outline-none mb-2 border-none bg-transparent"
            />
            <div className="flex items-center gap-2 mb-8 group">
              <span className="text-[13px] text-[#BBB]">Slug:</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="text-[13px] text-brand font-[500] border-b border-transparent focus:border-brand outline-none bg-transparent min-w-[200px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Category</label>
                {isAddingCategory ? (
                  <input
                    type="text"
                    autoFocus
                    placeholder="New category name..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onBlur={commitNewCategory}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); commitNewCategory(); }
                      if (e.key === 'Escape') { setIsAddingCategory(false); setNewCategoryInput(""); }
                    }}
                    className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none focus:border-brand"
                  />
                ) : (
                  <select
                    value={formData.category}
                    disabled={categoriesLoading}
                    onChange={(e) => {
                      if (e.target.value === "__add_new__") {
                        setIsAddingCategory(true);
                      } else {
                        handleChange("category", e.target.value);
                      }
                    }}
                    className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none focus:border-brand disabled:opacity-60"
                  >
                    {categoriesLoading ? (
                      <option>Loading categories...</option>
                    ) : (
                      <>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__add_new__">+ Add new category…</option>
                      </>
                    )}
                  </select>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Author Name</label>
                <input
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => handleChange("authorName", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none focus:border-brand"
                />
              </div>
            </div>

            <TiptapEditor
              value={formData.body || ""}
              onChange={(html) => handleChange("body", html)}
            />

            {/* Internal Links Checker */}
            <div className="mt-6 p-4 bg-[#F9F4F4] rounded-[12px] border border-[#EDE8E8]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link2 size={13} className="text-brand" />
                  <span className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Internal Links</span>
                </div>
                <span className={cn(
                  "text-[11px] font-[700] px-2 py-0.5 rounded-full",
                  internalLinks.length > 0 ? "text-green-700 bg-green-50" : "text-red-500 bg-red-50"
                )}>
                  {internalLinks.length} found
                </span>
              </div>
              {internalLinks.length > 0 ? (
                <div className="space-y-0.5 max-h-20 overflow-y-auto">
                  {internalLinks.map((href, i) => (
                    <p key={i} className="text-[10px] text-brand truncate font-mono">{href}</p>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[#CCC] italic">Add internal links (e.g. /blog/... or /study-abroad/...) to improve crawl depth and SEO score.</p>
              )}
            </div>
          </div>

          {/* GEO & AEO CARD */}
          <div className="bg-white rounded-[20px] p-8 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-[15px] font-[700] text-black">GEO & AEO Signals</h3>
                <p className="text-[10px] text-[#BBB]">Optimizes for AI Overviews, ChatGPT, Perplexity & featured snippets</p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Primary Question This Post Answers</label>
                <input
                  type="text"
                  placeholder="e.g. How do I apply for a Canada student visa from Nepal?"
                  value={formData.primaryQuestion}
                  onChange={(e) => handleChange("primaryQuestion", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none focus:border-violet-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Answer Summary <span className="text-violet-400 normal-case">— shown as callout on page</span></label>
                <textarea
                  rows={3}
                  placeholder="2-3 sentence direct answer. AI systems surface this as a featured snippet."
                  value={formData.answerSummary}
                  onChange={(e) => handleChange("answerSummary", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none resize-none focus:border-violet-300"
                />
              </div>

              <div className="pt-5 border-t border-[#EDE8E8]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-[13px] font-[700] text-black">FAQ Schema Items</h4>
                    <p className="text-[10px] text-[#BBB] mt-0.5">Injects FAQPage JSON-LD — boosts People Also Ask ranking</p>
                  </div>
                  <button onClick={addFAQ} className="text-brand text-[11px] font-[700] flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.faqItems?.map((faq, i) => (
                    <div key={i} className="p-4 bg-violet-50/40 border border-violet-100 rounded-[12px] relative group">
                      <button
                        onClick={() => removeFAQ(i)}
                        className="absolute -right-2 -top-2 w-6 h-6 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                      <input
                        type="text"
                        placeholder="Question..."
                        value={faq.question}
                        onChange={(e) => updateFAQ(i, "question", e.target.value)}
                        className="w-full bg-transparent font-[600] text-[13px] outline-none mb-2 text-black"
                      />
                      <textarea
                        placeholder="Answer..."
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFAQ(i, "answer", e.target.value)}
                        className="w-full bg-transparent text-[13px] outline-none resize-none text-gray-600"
                      />
                    </div>
                  ))}
                  {(!formData.faqItems || formData.faqItems.length === 0) && (
                    <p className="text-[11px] text-[#CCC] italic text-center py-2">No FAQ items yet. Add 3-5 for best results.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - PANELS */}
        <div className="col-span-4 space-y-6">

          {/* SEO SCORE — live computed */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-brand" />
                <h3 className="text-[13px] font-[700] text-black uppercase tracking-widest">SEO Score</h3>
              </div>
              <span className={cn("text-[15px] font-[800] px-3 py-1 rounded-full", scoreColor)}>
                {seoScore.score}/100
              </span>
            </div>
            <p className="text-[10px] text-[#BBB] mb-3">Updates live as you write.</p>
            <div className="h-1.5 bg-gray-100 rounded-full mb-4">
              <div
                className={cn("h-full rounded-full transition-all duration-500", barColor)}
                style={{ width: `${seoScore.score}%` }}
              />
            </div>
            <div className="space-y-1">
              {seoScore.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span className={cn("text-[11px] font-[700] w-3 shrink-0", c.pass ? "text-green-500" : "text-[#DDD]")}>
                    {c.pass ? "✓" : "✗"}
                  </span>
                  <span className={cn("flex-1 text-[11px]", c.pass ? "text-[#555]" : "text-[#BBB]")}>{c.label}</span>
                  <span className={cn("text-[10px] font-[700] tabular-nums shrink-0", c.pass ? "text-green-600" : "text-[#DDD]")}>+{c.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* E-E-A-T SIGNALS */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand" />
                <h3 className="text-[13px] font-[700] text-black uppercase tracking-widest">E-E-A-T Signals</h3>
              </div>
              {(() => {
                const score = [formData.authorName, formData.authorCredential, formData.authorBio, formData.lastReviewed, formData.sources?.[0]].filter(Boolean).length;
                const pct = Math.round((score / 5) * 100);
                const color = pct >= 80 ? "text-green-600 bg-green-50" : pct >= 40 ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50";
                return (
                  <span className={`text-[10px] font-[700] px-2 py-0.5 rounded-full ${color}`}>{pct}% complete</span>
                );
              })()}
            </div>
            <p className="text-[10px] text-[#BBB] mb-5">Google's E-E-A-T framework — Experience, Expertise, Authoritativeness, Trust.</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Author Credential <span className="text-[#CCC] normal-case">— shown as verified badge</span></label>
                <input
                  type="text"
                  placeholder="e.g. Certified Visa Consultant, 8+ years"
                  value={formData.authorCredential}
                  onChange={(e) => handleChange("authorCredential", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Author Bio</label>
                <textarea
                  rows={2}
                  placeholder="Short bio highlighting expertise relevant to this article..."
                  value={formData.authorBio}
                  onChange={(e) => handleChange("authorBio", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none resize-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Last Reviewed Date <span className="text-[#CCC] normal-case">— displays trust banner</span></label>
                <input
                  type="date"
                  value={formData.lastReviewed}
                  onChange={(e) => handleChange("lastReviewed", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Sources / References <span className="text-[#CCC] normal-case">— one URL per line</span></label>
                <textarea
                  rows={3}
                  placeholder={"https://immi.homeaffairs.gov.au/...\nhttps://studyaustralia.gov.au/..."}
                  value={(formData.sources || []).join("\n")}
                  onChange={(e) => handleChange("sources", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none resize-none focus:border-brand font-mono"
                />
              </div>
            </div>
          </div>

          {/* SEO SETTINGS */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-brand" />
              <h3 className="text-[13px] font-[700] text-black uppercase tracking-widest">SEO Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-[700] uppercase tracking-widest text-[#999]">
                  <label>Meta Title</label>
                  <span className={cn(formData.metaTitle?.length && formData.metaTitle.length > 60 ? "text-red-500" : "")}>
                    {formData.metaTitle?.length || 0}/60
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={formData.metaTitle}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-[700] uppercase tracking-widest text-[#999]">
                  <label>Meta Description</label>
                  <span className={cn(formData.metaDescription?.length && formData.metaDescription.length > 155 ? "text-amber-500" : "")}>
                    {formData.metaDescription?.length || 0}/160
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={160}
                  value={formData.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none resize-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">OG Description <span className="text-[#CCC] normal-case">— social card override</span></label>
                <textarea
                  rows={2}
                  maxLength={200}
                  placeholder="Leave blank to use meta description. Custom text for Facebook / X cards."
                  value={formData.ogDescription || ''}
                  onChange={(e) => handleChange("ogDescription", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none resize-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Focus Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Australia student visa Nepal"
                  value={formData.focusKeyword}
                  onChange={(e) => handleChange("focusKeyword", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Secondary Keywords <span className="text-[#CCC] normal-case">— comma separated</span></label>
                <input
                  type="text"
                  placeholder="study abroad Nepal, visa consultant Kathmandu"
                  value={secondaryKwInput}
                  onChange={(e) => setSecondaryKwInput(e.target.value)}
                  onBlur={() => handleChange("secondaryKeywords", secondaryKwInput.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none focus:border-brand"
                />
              </div>
              <label className="flex items-center gap-2 pt-2 border-t border-[#EDE8E8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!formData.noindex}
                  onChange={(e) => handleChange("noindex", e.target.checked)}
                  className="w-4 h-4 accent-brand"
                />
                <span className="text-[12px] text-[#555]">Hide from search engines (noindex)</span>
              </label>
            </div>
          </div>

          {/* PUBLISH SETTINGS */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-brand" />
              <h3 className="text-[13px] font-[700] text-black uppercase tracking-widest">Publish Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Featured Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/media/..."
                    value={formData.featuredImage}
                    onChange={(e) => handleChange("featuredImage", e.target.value)}
                    className="flex-1 bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none"
                  />
                  <input ref={featuredImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} />
                  <button type="button" onClick={() => featuredImageInputRef.current?.click()} className="px-3 py-2 bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] text-[11px] font-[700] text-brand hover:bg-brand-surface whitespace-nowrap">Upload</button>
                </div>
                {formData.featuredImage && (
                  <img src={formData.featuredImage} alt="preview" className="w-full h-28 object-cover rounded-[8px] border border-[#EDE8E8] mt-1" />
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onBlur={() => handleChange("tags", tagsInput.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  placeholder="visa, canada, study abroad"
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none"
                />
              </div>
              <div className="pt-2 border-t border-[#EDE8E8] flex items-center justify-between">
                <span className="text-[11px] text-[#BBB] flex items-center gap-1.5"><Clock size={11} /> Reading Time</span>
                <span className="text-[11px] font-[700] text-brand">{readingTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-white border-t border-[#EDE8E8] flex items-center px-10 justify-between z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 text-[12px] font-[500]",
            isSaved ? "text-green-600" : "text-[#999]"
          )}>
            {isSaved ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />}
            {isSaved ? "All changes saved" : "Unsaved changes"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {formData.slug && (
            formData.status === "published" && isSaved ? (
              <a
                href={`/blog/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open the live post in a new tab"
                className="px-6 py-2.5 rounded-[10px] border border-[#E0DADA] text-[#555] font-[600] text-[13px] hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <ExternalLink size={15} />
                Preview
              </a>
            ) : (
              <span
                title={
                  formData.status === "published"
                    ? "Save your changes first, then preview"
                    : "Publish the post to preview it on the live site"
                }
                className="px-6 py-2.5 rounded-[10px] border border-[#E0DADA] text-[#BBB] font-[600] text-[13px] cursor-not-allowed flex items-center gap-2"
              >
                <ExternalLink size={15} />
                Preview
              </span>
            )
          )}
          <button
            onClick={() => handleSave("draft")}
            className="px-6 py-2.5 rounded-[10px] border border-[#E0DADA] text-[#555] font-[600] text-[13px] hover:bg-gray-50 transition-all"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={loading}
            className="px-10 py-2.5 rounded-[10px] bg-brand text-white font-[600] text-[13px] hover:bg-brand-dark shadow-lg shadow-red-900/10 transition-all flex items-center gap-2"
          >
            {loading ? <Clock className="animate-spin" size={16} /> : <Send size={16} />}
            {formData.status === "published" ? "Update Post" : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
