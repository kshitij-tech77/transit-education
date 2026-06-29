"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from "@/constants/cms";
import { CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface ResourcesSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function ResourcesSection({ data, actionsLoading, onSave, onDelete, onToast }: ResourcesSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ status: 'published', type: 'PDF' }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("Resource", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("resources", id);
    onToast(result.message);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Student Resources</h2>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Resource</CmsButton>
        </div>

        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Size / Link</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.resources.map((r, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-black">{r.title}</td>
                  <td className="px-6 py-4 text-gray-600">{r.category}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase">{r.type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{r.file_size}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <CmsButton variant="ghost" onClick={() => openEdit(r as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" onClick={() => handleDelete(r.id)}><Trash2 size={14} /></CmsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Resource" : "New Resource"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
        >
          <FormField label="Title">
            <input className={CMS_INPUT_CLS} value={(editingItem?.title as string) ?? ''} onChange={e => update('title', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Category">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.category as string) ?? ''} onChange={e => update('category', e.target.value)}>
                <option value="">Select Category</option>
                {RESOURCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Type">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.type as string) ?? 'PDF'} onChange={e => update('type', e.target.value)}>
                {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="URL / Link">
            <input className={CMS_INPUT_CLS} value={(editingItem?.url as string) ?? ''} onChange={e => update('url', e.target.value)} placeholder="https://... or /media/..." />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="File Size / Label">
              <input className={CMS_INPUT_CLS} value={(editingItem?.file_size as string) ?? ''} onChange={e => update('file_size', e.target.value)} placeholder="e.g. 1.2 MB or Link" />
            </FormField>
            <FormField label="Display Order">
              <input type="number" className={CMS_INPUT_CLS} value={(editingItem?.display_order as number) ?? 0} onChange={e => update('display_order', parseInt(e.target.value))} />
            </FormField>
          </div>
        </CmsModal>
      )}
    </>
  );
}
