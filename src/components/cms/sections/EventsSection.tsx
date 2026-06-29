"use client";

import { useState, useRef } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult, UploadResult } from "@/hooks/useCmsActions";
import { StatusBadge, CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface EventsSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
  onUpload: (file: File) => Promise<UploadResult>;
}

export function EventsSection({ data, actionsLoading, onSave, onDelete, onToast, onUpload }: EventsSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ is_published: false, location: 'Online' }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("Event", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("Event", id);
    onToast(result.message);
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const result = await onUpload(file);
    onToast(result.message);
    if (result.ok && result.path) update('banner_image', result.path);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Events & Webinars</h2>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Event</CmsButton>
        </div>

        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.events.map((ev, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-black max-w-xs truncate">{ev.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(ev.event_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">{ev.location}</td>
                  <td className="px-6 py-4"><StatusBadge status={ev.is_published ? 'PUBLISHED' : 'DRAFT'} /></td>
                  <td className="px-6 py-4 flex gap-2">
                    <CmsButton variant="ghost" onClick={() => openEdit(ev as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" onClick={() => handleDelete(ev.id)}><Trash2 size={14} /></CmsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Event" : "New Event"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
          className="w-140"
        >
          <FormField label="Event Title">
            <input className={CMS_INPUT_CLS} value={(editingItem?.title as string) ?? ''} onChange={e => update('title', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Date & Time">
              <input
                type="datetime-local"
                className={CMS_INPUT_CLS}
                value={editingItem?.event_date ? (editingItem.event_date as string).slice(0, 16) : ''}
                onChange={e => update('event_date', e.target.value)}
              />
            </FormField>
            <FormField label="Location">
              <input className={CMS_INPUT_CLS} value={(editingItem?.location as string) ?? 'Online'} onChange={e => update('location', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea rows={3} className={`${CMS_INPUT_CLS} resize-none`} value={(editingItem?.description as string) ?? ''} onChange={e => update('description', e.target.value)} />
          </FormField>
          <FormField label="Registration Link">
            <input className={CMS_INPUT_CLS} value={(editingItem?.registration_link as string) ?? ''} onChange={e => update('registration_link', e.target.value)} placeholder="https://..." />
          </FormField>
          <FormField label="Banner / Flyer Image">
            <div className="flex gap-2 items-center">
              <input
                className={CMS_INPUT_CLS}
                value={(editingItem?.banner_image as string) ?? ''}
                onChange={e => update('banner_image', e.target.value)}
                placeholder="/media/year/month/filename.jpg"
              />
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              <CmsButton variant="secondary" onClick={() => bannerInputRef.current?.click()} loading={actionsLoading}>
                <ImageIcon size={13} /> Upload
              </CmsButton>
            </div>
            {!!editingItem?.banner_image && (
              <img src={editingItem.banner_image as string} alt="banner preview" className="mt-2 w-full h-28 object-cover rounded-lg border border-gray-200" />
            )}
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(editingItem?.is_published as boolean) ?? false} onChange={e => update('is_published', e.target.checked)} className="accent-brand" />
            <span className="text-[12px] font-bold text-black">Published (visible on homepage)</span>
          </label>
        </CmsModal>
      )}
    </>
  );
}
