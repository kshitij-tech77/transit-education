"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, MapPin, Phone, User, Clock } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface BranchesSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function BranchesSection({ data, actionsLoading, onSave, onDelete, onToast }: BranchesSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({}); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("Branch", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("branches", id);
    onToast(result.message);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Our Branches</h2>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Branch</CmsButton>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {data.branches.map((b, i) => (
            <CmsCard key={i} className="flex gap-6 items-start">
              <div className="w-15 h-15 bg-brand-surface rounded-2xl flex items-center justify-center text-brand shrink-0">
                <MapPin size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-bold text-black">{b.name}</h3>
                  <div className="flex gap-2">
                    <CmsButton variant="ghost" className="!p-2" onClick={() => openEdit(b as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" className="!p-2" onClick={() => handleDelete(b.id)}><Trash2 size={14} /></CmsButton>
                  </div>
                </div>
                <div className="space-y-2 text-[12px] text-gray-600">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {b.addr}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {b.phone}</p>
                    <p className="flex items-center gap-2"><User size={14} className="text-gray-400" /> {b.mgr}</p>
                  </div>
                  <p className="flex items-center gap-2"><Clock size={14} className="text-gray-400" /> {b.hours}</p>
                </div>
              </div>
            </CmsCard>
          ))}
        </div>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Branch" : "New Branch"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
        >
          <FormField label="Branch Name">
            <input className={CMS_INPUT_CLS} value={(editingItem?.name as string) ?? ''} onChange={e => update('name', e.target.value)} />
          </FormField>
          <FormField label="Address">
            <input className={CMS_INPUT_CLS} value={(editingItem?.addr as string) ?? ''} onChange={e => update('addr', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Phone">
              <input className={CMS_INPUT_CLS} value={(editingItem?.phone as string) ?? ''} onChange={e => update('phone', e.target.value)} />
            </FormField>
            <FormField label="Manager">
              <input className={CMS_INPUT_CLS} value={(editingItem?.mgr as string) ?? ''} onChange={e => update('mgr', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Working Hours">
            <input className={CMS_INPUT_CLS} value={(editingItem?.hours as string) ?? ''} onChange={e => update('hours', e.target.value)} placeholder="e.g. Sun–Fri 9am–6pm" />
          </FormField>
        </CmsModal>
      )}
    </>
  );
}
