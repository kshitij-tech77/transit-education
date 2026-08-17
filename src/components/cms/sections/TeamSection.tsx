"use client";

import { useRef, useState } from "react";
import { Plus, Edit, Trash2, EyeOff } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult, UploadResult } from "@/hooks/useCmsActions";
import { CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS, CMS_LABEL_CLS } from "@/components/cms/shared";

interface TeamSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
  onUpload: (file: File) => Promise<UploadResult>;
}

export function TeamSection({ data, actionsLoading, onSave, onDelete, onToast, onUpload }: TeamSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ displayOrder: data.teamMembers.length, isVisible: true }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("TeamMember", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("team-members", id);
    onToast(result.message);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const result = await onUpload(file);
    onToast(result.message);
    if (result.ok && result.path) update('photo', result.path);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Team Members</h2>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Team Member</CmsButton>
        </div>

        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.teamMembers.map(m => (
                <tr key={m.id} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-surface overflow-hidden border border-gray-200">
                        {m.photo
                          ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                          : <span className="w-full h-full flex items-center justify-center text-brand font-bold">{m.name[0]}</span>
                        }
                      </div>
                      <p className="font-semibold text-black">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.role}</td>
                  <td className="px-6 py-4 text-gray-600">{m.branch ?? '—'}</td>
                  <td className="px-6 py-4">
                    {m.isVisible
                      ? <span className="text-[11px] font-bold text-green-700 bg-green-100 rounded-full px-2.5 py-0.5">Visible</span>
                      : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5"><EyeOff size={11} /> Hidden</span>
                    }
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <CmsButton variant="ghost" onClick={() => openEdit(m as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" onClick={() => handleDelete(m.id)}><Trash2 size={14} /></CmsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Team Member" : "New Team Member"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
        >
          <FormField label="Name">
            <input className={CMS_INPUT_CLS} value={(editingItem?.name as string) ?? ''} onChange={e => update('name', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Role / Title">
              <input className={CMS_INPUT_CLS} value={(editingItem?.role as string) ?? ''} onChange={e => update('role', e.target.value)} placeholder="e.g. Senior Counsellor" />
            </FormField>
            <FormField label="Branch">
              <select className={CMS_INPUT_CLS} value={(editingItem?.branchId as string) ?? ''} onChange={e => update('branchId', e.target.value)}>
                <option value="">— None —</option>
                {data.branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label="Photo">
            <div className="flex gap-2">
              <input
                className={CMS_INPUT_CLS}
                value={(editingItem?.photo as string) ?? ''}
                onChange={e => update('photo', e.target.value)}
                placeholder="/media/year/month/filename.png"
              />
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-brand hover:bg-brand-surface whitespace-nowrap"
              >
                Upload
              </button>
            </div>
            {!!editingItem?.photo && (
              <img src={editingItem.photo as string} alt="preview" className="w-full h-32 object-cover rounded-lg border border-gray-200 mt-2" />
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Display Order">
              <input type="number" className={CMS_INPUT_CLS} value={(editingItem?.displayOrder as number) ?? 0} onChange={e => update('displayOrder', parseInt(e.target.value) || 0)} />
            </FormField>
            <div className="space-y-1.5">
              <label className={CMS_LABEL_CLS}>Visibility</label>
              <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={(editingItem?.isVisible as boolean) ?? true}
                  onChange={e => update('isVisible', e.target.checked)}
                />
                Show on public team page
              </label>
            </div>
          </div>
        </CmsModal>
      )}
    </>
  );
}
