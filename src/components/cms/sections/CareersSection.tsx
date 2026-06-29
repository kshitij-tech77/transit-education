"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { JOB_TYPES } from "@/constants/cms";
import { StatusBadge, CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface CareersSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function CareersSection({ data, actionsLoading, onSave, onDelete, onToast }: CareersSectionProps) {
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ is_active: true, type: 'Full-time', location: 'Kathmandu' }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSave() {
    if (!editingItem) return;
    const result = await onSave("JobOpening", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDelete(id: string) {
    const result = await onDelete("JobOpening", id);
    onToast(result.message);
  }

  const selectedLocations = (editingItem?.location as string ?? '').split(',').map(s => s.trim()).filter(Boolean);

  function toggleLocation(name: string) {
    const next = selectedLocations.includes(name)
      ? selectedLocations.filter(s => s !== name)
      : [...selectedLocations, name];
    update('location', next.join(', '));
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Careers</h2>
          <CmsButton onClick={openCreate}><Plus size={14} /> Add Opening</CmsButton>
        </div>

        <h3 className="text-[13px] font-bold text-gray-600 uppercase tracking-widest mt-4">Job Openings</h3>
        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Dept</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Active</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.jobOpenings.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-[13px]">No job openings yet.</td></tr>
              )}
              {data.jobOpenings.map((job, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-black">{job.title}</td>
                  <td className="px-6 py-4">{job.department ?? '—'}</td>
                  <td className="px-6 py-4">{job.location}</td>
                  <td className="px-6 py-4">{job.type}</td>
                  <td className="px-6 py-4"><StatusBadge status={job.is_active ? 'LIVE' : 'DRAFT'} /></td>
                  <td className="px-6 py-4 flex gap-2">
                    <CmsButton variant="ghost" onClick={() => openEdit(job as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                    <CmsButton variant="destructive" onClick={() => handleDelete(job.id)}><Trash2 size={14} /></CmsButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>

        <h3 className="text-[13px] font-bold text-gray-600 uppercase tracking-widest mt-6">Applications Received</h3>
        <CmsCard noPadding className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">CV</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.jobApplications.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-[13px]">No applications yet.</td></tr>
              )}
              {data.jobApplications.map((app, i) => (
                <tr key={i} className="text-[13px] hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-black">{app.full_name}</td>
                  <td className="px-6 py-4">{app.email}</td>
                  <td className="px-6 py-4">{app.phone}</td>
                  <td className="px-6 py-4">{app.position}</td>
                  <td className="px-6 py-4">
                    {app.cv_url
                      ? <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="text-brand font-semibold hover:underline text-[11px]">View CV</a>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={app.status?.toUpperCase() ?? 'NEW'} /></td>
                  <td className="px-6 py-4 text-gray-400">{new Date(app.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CmsCard>
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Job Opening" : "New Job Opening"}
          onClose={closeModal}
          onSave={handleSave}
          loading={actionsLoading}
        >
          <FormField label="Job Title">
            <input className={CMS_INPUT_CLS} value={(editingItem?.title as string) ?? ''} onChange={e => update('title', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Department">
              <input className={CMS_INPUT_CLS} value={(editingItem?.department as string) ?? ''} onChange={e => update('department', e.target.value)} placeholder="e.g. Counselling" />
            </FormField>
            <FormField label="Type">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={(editingItem?.type as string) ?? 'Full-time'} onChange={e => update('type', e.target.value)}>
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Locations">
            {data.branches.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                {data.branches.map(b => (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer text-[12px] font-semibold text-black">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(b.name)}
                      className="accent-brand"
                      onChange={() => toggleLocation(b.name)}
                    />
                    {b.name}
                  </label>
                ))}
              </div>
            ) : (
              <input className={CMS_INPUT_CLS} value={(editingItem?.location as string) ?? ''} onChange={e => update('location', e.target.value)} placeholder="e.g. Kathmandu" />
            )}
            {!!editingItem?.location && <p className="text-[10px] text-gray-400 mt-1">Selected: {editingItem.location as string}</p>}
          </FormField>
          <FormField label="Description">
            <textarea rows={3} className={`${CMS_INPUT_CLS} resize-none`} value={(editingItem?.description as string) ?? ''} onChange={e => update('description', e.target.value)} />
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(editingItem?.is_active as boolean) ?? true} onChange={e => update('is_active', e.target.checked)} className="accent-brand" />
            <span className="text-[12px] font-bold text-black">Active (visible on careers page)</span>
          </label>
        </CmsModal>
      )}
    </>
  );
}
