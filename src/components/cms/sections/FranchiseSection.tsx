"use client";

import { Trash2 } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { FRANCHISE_STATUSES } from "@/constants/cms";
import { CmsCard, CmsButton } from "@/components/cms/shared";

interface FranchiseSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function FranchiseSection({ data, onSave, onDelete, onToast }: FranchiseSectionProps) {
  async function handleStatusChange(id: string, status: string) {
    const result = await onSave("FranchiseInquiry", { id, status });
    onToast(result.message);
  }

  async function handleDelete(id: string) {
    const result = await onDelete("FranchiseInquiry", id);
    onToast(result.message);
  }

  return (
    <div className="space-y-5">
      <h2 className="text-[18px] font-bold text-black">Franchise Inquiries</h2>

      <CmsCard noPadding className="overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.franchiseInquiries.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-[13px]">No franchise inquiries yet.</td></tr>
            )}
            {data.franchiseInquiries.map((inq, i) => (
              <tr key={i} className="text-[13px] hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-black">{inq.full_name}</td>
                <td className="px-6 py-4">{inq.email}</td>
                <td className="px-6 py-4">{inq.phone}</td>
                <td className="px-6 py-4">{inq.city}</td>
                <td className="px-6 py-4">
                  <select
                    value={inq.status}
                    onChange={e => void handleStatusChange(inq.id, e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-[11px] outline-none bg-white"
                  >
                    {FRANCHISE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <CmsButton variant="destructive" onClick={() => handleDelete(inq.id)}><Trash2 size={14} /></CmsButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CmsCard>
    </div>
  );
}
