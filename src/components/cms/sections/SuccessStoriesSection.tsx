"use client";

import { useState, useRef } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult, UploadResult } from "@/hooks/useCmsActions";
import { CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface SuccessStoriesSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
  onUpload: (file: File) => Promise<UploadResult>;
}

export function SuccessStoriesSection({ data, actionsLoading, onSave, onDelete, onToast, onUpload }: SuccessStoriesSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ year: String(new Date().getFullYear()) }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("Story", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("success-stories", id);
    onToast(result.message);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const result = await onUpload(file);
    onToast(result.message);
    if (result.ok && result.path) update('approvalImage', result.path);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Success Stories</h2>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Story</CmsButton>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {data.successStories.map((s, i) => (
            <CmsCard key={i}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-surface text-brand flex items-center justify-center font-bold overflow-hidden border border-gray-200">
                  {s.approvalImage
                    ? <img src={s.approvalImage} alt={s.name} className="w-full h-full object-cover" />
                    : s.name[0]
                  }
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-black">{s.name}</h4>
                  <p className="text-[11px] text-brand font-bold">{s.flag} {s.country}</p>
                </div>
              </div>
              <div className="text-[12px] text-gray-600 space-y-1 mb-4">
                <p className="truncate"><strong>Uni:</strong> {s.university}</p>
                <p className="truncate"><strong>Course:</strong> {s.course}</p>
                <p><strong>Year:</strong> {s.year}</p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <CmsButton variant="ghost" className="flex-1" onClick={() => openEdit(s as unknown as Record<string, unknown>)}><Edit size={12} /></CmsButton>
                <CmsButton variant="destructive" className="flex-1" onClick={() => handleDelete(s.id)}><Trash2 size={12} /></CmsButton>
              </div>
            </CmsCard>
          ))}
        </div>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Story" : "New Story"}
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
            <FormField label="Year">
              <input className={CMS_INPUT_CLS} value={(editingItem?.year as string) ?? ''} onChange={e => update('year', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Course">
            <input className={CMS_INPUT_CLS} value={(editingItem?.course as string) ?? ''} onChange={e => update('course', e.target.value)} />
          </FormField>
          <FormField label="Approval Image">
            <div className="flex gap-2">
              <input
                className={CMS_INPUT_CLS}
                value={(editingItem?.approvalImage as string) ?? ''}
                onChange={e => update('approvalImage', e.target.value)}
                placeholder="/media/year/month/filename.png"
              />
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-brand hover:bg-brand-surface whitespace-nowrap"
              >
                Upload
              </button>
            </div>
            {!!editingItem?.approvalImage && (
              <img src={editingItem.approvalImage as string} alt="preview" className="w-full h-32 object-cover rounded-lg border border-gray-200 mt-2" />
            )}
          </FormField>
        </CmsModal>
      )}
    </>
  );
}
