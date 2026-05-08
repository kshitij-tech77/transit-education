"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Info, 
  Globe, 
  User, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import TiptapEditor from "@/components/cms/TiptapEditor";
import { cn } from "@/lib/utils";
import { BlogPost, FAQItem } from "@/lib/types/blog";
import { toast } from "sonner";

type BlogEditorProps = {
  initialData?: BlogPost;
  isEdit?: boolean;
};

export default function BlogEditor({ initialData, isEdit }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [tagsInput, setTagsInput] = useState((initialData?.tags || []).join(", "));
  const featuredImageInputRef = React.useRef<HTMLInputElement>(null);

  // ─── STATE ───
  const [formData, setFormData] = useState<Partial<BlogPost>>(
    initialData || {
      title: "",
      slug: "",
      body: "",
      category: "Visa Tips",
      status: "draft",
      tags: [],
      authorName: "Kshitij Dhamala",
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
    }
  );

  // ─── AUTO-GENERATE SLUG ───
  useEffect(() => {
    if (!isEdit && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: prev.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      }));
    }
  }, [formData.title, isEdit]);

  // ─── READING TIME ───
  const readingTime = useMemo(() => {
    const words = formData.body?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    const time = Math.ceil(words / 200);
    return `${time} min read`;
  }, [formData.body]);

  // ─── HANDLERS ───
  const handleChange = (field: keyof BlogPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
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

      if (!res.ok) throw new Error("Failed to save");

      toast.success(isEdit ? "Post updated!" : "Post created!");
      setIsSaved(true);
      if (!isEdit) router.push("/cms");
    } catch (error) {
      toast.error("Error saving post");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#F7F3F3] pb-24">
      {/* Top Header */}
      <header className="h-[64px] bg-white border-b border-[#EDE8E8] sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-[#FEF2F1] rounded-full text-[#A93226] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="text-[14px] font-[700] text-[#111]">
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
              className="w-full text-[42px] font-[800] text-[#111] placeholder-[#E0DADA] outline-none mb-2 border-none bg-transparent"
            />
            <div className="flex items-center gap-2 mb-8 group">
              <span className="text-[13px] text-[#BBB]">Slug:</span>
              <input 
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="text-[13px] text-[#A93226] font-[500] border-b border-transparent focus:border-[#A93226] outline-none bg-transparent min-w-[200px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none focus:border-[#A93226]"
                >
                  <option>Visa Tips</option>
                  <option>University Guide</option>
                  <option>Student Lifestyle</option>
                  <option>News & Updates</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Author Name</label>
                <input 
                  type="text"
                  value={formData.authorName}
                  onChange={(e) => handleChange("authorName", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none focus:border-[#A93226]"
                />
              </div>
            </div>

            <TiptapEditor 
              value={formData.body || ""} 
              onChange={(html) => handleChange("body", html)} 
            />
          </div>

          {/* AEO CARD */}
          <div className="bg-white rounded-[20px] p-8 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Info size={18} />
              </div>
              <h3 className="text-[16px] font-[700] text-[#111]">AEO & FAQ (Answer Engine Optimization)</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Primary Question post answers</label>
                <input 
                  type="text"
                  placeholder="e.g. How do I apply for a Canada student visa from Nepal?"
                  value={formData.primaryQuestion}
                  onChange={(e) => handleChange("primaryQuestion", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Answer Summary (2-3 sentences)</label>
                <textarea 
                  rows={3}
                  value={formData.answerSummary}
                  onChange={(e) => handleChange("answerSummary", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[10px] px-4 py-2.5 text-[13px] outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-[#EDE8E8]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[13px] font-[700] text-[#111]">FAQ Schema Items</h4>
                  <button onClick={addFAQ} className="text-[#A93226] text-[11px] font-[700] flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.faqItems?.map((faq, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-[12px] relative group">
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
                        className="w-full bg-transparent font-[600] text-[13px] outline-none mb-2"
                      />
                      <textarea 
                        placeholder="Answer..."
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFAQ(i, "answer", e.target.value)}
                        className="w-full bg-transparent text-[13px] outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - PANELS */}
        <div className="col-span-4 space-y-6">
          {/* SEO SETTINGS */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-[#A93226]" />
              <h3 className="text-[13px] font-[700] text-[#111] uppercase tracking-widest">SEO Settings</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-[700] uppercase tracking-widest text-[#999]">
                  <label>Meta Title</label>
                  <span className={cn(formData.metaTitle?.length && formData.metaTitle.length > 60 && "text-red-500")}>
                    {formData.metaTitle?.length || 0}/60
                  </span>
                </div>
                <input 
                  type="text"
                  maxLength={60}
                  value={formData.metaTitle}
                  onChange={(e) => handleChange("metaTitle", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-[700] uppercase tracking-widest text-[#999]">
                  <label>Meta Description</label>
                  <span>{formData.metaDescription?.length || 0}/160</span>
                </div>
                <textarea 
                  rows={3}
                  maxLength={160}
                  value={formData.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Focus Keyword</label>
                <input 
                  type="text"
                  value={formData.focusKeyword}
                  onChange={(e) => handleChange("focusKeyword", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none"
                />
              </div>
            </div>
          </div>

          {/* EEAT SIGNALS */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-[#A93226]" />
              <h3 className="text-[13px] font-[700] text-[#111] uppercase tracking-widest">EEAT Signals</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Author Credential</label>
                <input 
                  type="text"
                  placeholder="e.g. Certified Visa Consultant"
                  value={formData.authorCredential}
                  onChange={(e) => handleChange("authorCredential", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Last Reviewed Date</label>
                <input 
                  type="date"
                  value={formData.lastReviewed}
                  onChange={(e) => handleChange("lastReviewed", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-[700] text-[#999] uppercase tracking-widest">Author Bio</label>
                <textarea 
                  rows={2}
                  value={formData.authorBio}
                  onChange={(e) => handleChange("authorBio", e.target.value)}
                  className="w-full bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] px-3 py-2 text-[12px] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* PUBLISH SETTINGS */}
          <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EDE8E8]">
            <div className="flex items-center gap-2 mb-4">
              <Plus size={16} className="text-[#A93226]" />
              <h3 className="text-[13px] font-[700] text-[#111] uppercase tracking-widest">Publish Settings</h3>
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
                  <button type="button" onClick={() => featuredImageInputRef.current?.click()} className="px-3 py-2 bg-[#F9F4F4] border border-[#EDE8E8] rounded-[8px] text-[11px] font-[700] text-[#A93226] hover:bg-[#FEF2F1] whitespace-nowrap">Upload</button>
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
              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-[#BBB]">Reading Time:</span>
                <span className="text-[11px] font-[700] text-[#A93226]">{readingTime}</span>
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
            {isSaved ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-[#A93226] animate-pulse" />}
            {isSaved ? "All changes saved" : "Unsaved changes"}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave("draft")}
            className="px-6 py-2.5 rounded-[10px] border border-[#E0DADA] text-[#555] font-[600] text-[13px] hover:bg-gray-50 transition-all"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSave("published")}
            disabled={loading}
            className="px-10 py-2.5 rounded-[10px] bg-[#A93226] text-white font-[600] text-[13px] hover:bg-[#7E2219] shadow-lg shadow-red-900/10 transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            {formData.status === "published" ? "Update Post" : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return <Clock className={cn("animate-spin", className)} size={size} />;
}
