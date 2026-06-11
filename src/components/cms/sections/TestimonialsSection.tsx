"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Star } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface TestimonialsSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function TestimonialsSection({ data, actionsLoading, onSave, onDelete, onToast }: TestimonialsSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ rating: 5 }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("Testimonial", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("testimonials", id);
    onToast(result.message);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Student Testimonials</h2>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Testimonial</CmsButton>
        </div>

        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Testimonial</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.testimonials.map((t, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-surface overflow-hidden border border-gray-200">
                        {t.photo
                          ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                          : <span className="w-full h-full flex items-center justify-center text-brand font-bold">{t.name[0]}</span>
                        }
                      </div>
                      <div>
                        <p className="font-semibold text-black">{t.name}</p>
                        <p className="text-[11px] text-gray-400">{t.course}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{t.country}</td>
                  <td className="px-6 py-4 max-w-md truncate text-gray-600">{t.body}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-0.5 text-yellow-400">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} size={12} fill={idx < t.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <CmsButton variant="ghost" onClick={() => openEdit(t as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" onClick={() => handleDelete(t.id)}><Trash2 size={14} /></CmsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Testimonial" : "New Testimonial"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
        >
          <FormField label="Student Name">
            <input className={CMS_INPUT_CLS} value={(editingItem?.name as string) ?? ''} onChange={e => update('name', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="University">
              <input className={CMS_INPUT_CLS} value={(editingItem?.university as string) ?? ''} onChange={e => update('university', e.target.value)} />
            </FormField>
            <FormField label="Course">
              <input className={CMS_INPUT_CLS} value={(editingItem?.course as string) ?? ''} onChange={e => update('course', e.target.value)} />
            </FormField>
            <FormField label="Country">
              <input className={CMS_INPUT_CLS} value={(editingItem?.country as string) ?? ''} onChange={e => update('country', e.target.value)} />
            </FormField>
            <FormField label="Rating (1–5)">
              <input type="number" min="1" max="5" className={CMS_INPUT_CLS} value={(editingItem?.rating as number) ?? 5} onChange={e => update('rating', parseInt(e.target.value))} />
            </FormField>
          </div>
          <FormField label="Testimonial Body">
            <textarea rows={4} className={`${CMS_INPUT_CLS} resize-none`} value={(editingItem?.body as string) ?? ''} onChange={e => update('body', e.target.value)} />
          </FormField>
          <FormField label="Photo URL">
            <input className={CMS_INPUT_CLS} value={(editingItem?.photo as string) ?? ''} onChange={e => update('photo', e.target.value)} placeholder="/media/year/month/filename.png" />
          </FormField>
        </CmsModal>
      )}
    </>
  );
}
