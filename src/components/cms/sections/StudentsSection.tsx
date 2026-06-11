"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { STUDENT_STATUS } from "@/constants/cms";
import { StatusBadge, CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface StudentsSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function StudentsSection({ data, actionsLoading, onSave, onDelete, onToast }: StudentsSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ status: STUDENT_STATUS.PENDING }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("Student", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("students", id);
    onToast(result.message);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex gap-3 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input type="text" placeholder="Search students..." className={`${CMS_INPUT_CLS} pl-10`} />
            </div>
            <select className={`${CMS_INPUT_CLS} bg-white w-40`}>
              <option>All Branches</option>
              {data.branches.map(b => <option key={b.id}>{b.name}</option>)}
            </select>
            <select className={`${CMS_INPUT_CLS} bg-white w-40`}>
              <option>All Status</option>
              {Object.values(STUDENT_STATUS).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Student</CmsButton>
        </div>

        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Counselor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.students.map((s, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-black">{s.name}</td>
                  <td className="px-6 py-4 text-gray-600">{s.phone}</td>
                  <td className="px-6 py-4">{s.branch}</td>
                  <td className="px-6 py-4">{s.country}</td>
                  <td className="px-6 py-4">{s.counselor}</td>
                  <td className="px-6 py-4"><StatusBadge status={s.status} /></td>
                  <td className="px-6 py-4 flex gap-2">
                    <CmsButton variant="ghost" onClick={() => openEdit(s as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></CmsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Student" : "New Student"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
        >
          <FormField label="Full Name">
            <input className={CMS_INPUT_CLS} value={(editingItem?.name as string) ?? ''} onChange={e => update('name', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Phone">
              <input className={CMS_INPUT_CLS} value={(editingItem?.phone as string) ?? ''} onChange={e => update('phone', e.target.value)} />
            </FormField>
            <FormField label="Email">
              <input className={CMS_INPUT_CLS} value={(editingItem?.email as string) ?? ''} onChange={e => update('email', e.target.value)} />
            </FormField>
            <FormField label="Branch">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.branch as string) ?? ''} onChange={e => update('branch', e.target.value)}>
                <option value="">Select Branch</option>
                {data.branches.map(b => <option key={b.id}>{b.name}</option>)}
              </select>
            </FormField>
            <FormField label="Country">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.country as string) ?? ''} onChange={e => update('country', e.target.value)}>
                <option value="">Select Country</option>
                {data.countries.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Counselor">
              <input className={CMS_INPUT_CLS} value={(editingItem?.counselor as string) ?? ''} onChange={e => update('counselor', e.target.value)} />
            </FormField>
            <FormField label="Status">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.status as string) ?? STUDENT_STATUS.PENDING} onChange={e => update('status', e.target.value)}>
                {Object.entries(STUDENT_STATUS).map(([k, v]) => (
                  <option key={k} value={v}>{v}</option>
                ))}
              </select>
            </FormField>
          </div>
        </CmsModal>
      )}
    </>
  );
}
