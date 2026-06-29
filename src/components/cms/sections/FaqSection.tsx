"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { FAQ_CATEGORIES, FAQ_STATIC_PAGES } from "@/constants/cms";
import { StatusBadge, CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface FaqSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function FaqSection({ data, actionsLoading, onSave, onDelete, onToast }: FaqSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ status: 'Published', featured: false, order: 1 }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("FAQ", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("faqs", id);
    onToast(result.message);
  }

  async function toggleFeatured(faq: Record<string, unknown>) {
    const result = await onSave("FAQ", { ...faq, featured: !faq.featured });
    onToast(result.message);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="Search FAQs..." className={`${CMS_INPUT_CLS} pl-10`} />
            </div>
            <select className={`${CMS_INPUT_CLS} bg-white w-44`}>
              <option>All Categories</option>
              {FAQ_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className={`${CMS_INPUT_CLS} bg-white w-44`}>
              <option>All Pages</option>
              {FAQ_STATIC_PAGES.map(p => <option key={p} value={p}>{p}</option>)}
              {data.countries.map(c => (
                <option key={c.id} value={`study-abroad/${c.id}`}>study-abroad/{c.id}</option>
              ))}
            </select>
          </div>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add FAQ</CmsButton>
        </div>

        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4 w-20">Order</th>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Page</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.faqs.map((f, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-400">#{f.order}</td>
                  <td className="px-6 py-4 font-semibold text-black max-w-md truncate">{f.question}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${f.category === 'Canada' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                      {f.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{f.page}</td>
                  <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                  <td className="px-6 py-4">
                    <div
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${f.featured ? 'bg-brand' : 'bg-gray-200'}`}
                      onClick={() => toggleFeatured(f as unknown as Record<string, unknown>)}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${f.featured ? 'left-6' : 'left-1'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <CmsButton variant="ghost" onClick={() => openEdit(f as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" onClick={() => handleDelete(f.id)}><Trash2 size={14} /></CmsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit FAQ" : "New FAQ"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
        >
          <FormField label="Question">
            <input className={CMS_INPUT_CLS} value={(editingItem?.question as string) ?? ''} onChange={e => update('question', e.target.value)} />
          </FormField>
          <FormField label="Answer">
            <textarea rows={4} className={`${CMS_INPUT_CLS} resize-none`} value={(editingItem?.answer as string) ?? ''} onChange={e => update('answer', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Category">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.category as string) ?? ''} onChange={e => update('category', e.target.value)}>
                <option value="">Select Category</option>
                {FAQ_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Appears On Page">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.page as string) ?? 'Homepage'} onChange={e => update('page', e.target.value)}>
                {FAQ_STATIC_PAGES.map(p => <option key={p} value={p}>{p}</option>)}
                {data.countries.map(c => (
                  <option key={c.id} value={`study-abroad/${c.id}`}>study-abroad/{c.id}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3.5">
            <FormField label="Status">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.status as string) ?? 'Draft'} onChange={e => update('status', e.target.value)}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </FormField>
            <FormField label="Order">
              <input type="number" className={CMS_INPUT_CLS} value={(editingItem?.order as number) ?? 1} onChange={e => update('order', parseInt(e.target.value))} />
            </FormField>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(editingItem?.featured as boolean) ?? false} onChange={e => update('featured', e.target.checked)} className="accent-brand" />
                <span className="text-[11px] font-bold text-black">Featured</span>
              </label>
            </div>
          </div>
        </CmsModal>
      )}
    </>
  );
}
