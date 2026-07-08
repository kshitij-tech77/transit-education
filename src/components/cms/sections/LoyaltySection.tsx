"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Check, X, Gift } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { StatusBadge, CmsCard, CmsButton, CmsModal, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface LoyaltySectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

type Tab = "Rewards" | "Redemptions" | "Members";

export function LoyaltySection({ data, actionsLoading, onSave, onDelete, onToast }: LoyaltySectionProps) {
  const [tab, setTab] = useState<Tab>("Rewards");
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [showModal, setShowModal] = useState(false);

  function update(key: string, value: unknown) {
    setEditingItem(prev => ({ ...(prev ?? {}), [key]: value }));
  }

  function openCreate() { setEditingItem({ active: true }); setShowModal(true); }
  function openEdit(item: Record<string, unknown>) { setEditingItem(item); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditingItem(null); }

  async function handleSaveReward() {
    if (!editingItem) return;
    const result = await onSave("LoyaltyReward", editingItem);
    onToast(result.message);
    if (result.ok) closeModal();
  }

  async function handleDeleteReward(id: string) {
    const result = await onDelete("loyalty/rewards", id);
    onToast(result.message);
  }

  async function handleRedemptionDecision(id: string, status: "FULFILLED" | "REJECTED") {
    const result = await onSave("LoyaltyRedemption", { id, status });
    onToast(result.message);
  }

  const TABS: Tab[] = ["Rewards", "Redemptions", "Members"];

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-bold text-black">Loyalty Program</h2>
          {tab === "Rewards" && (
            <CmsButton onClick={openCreate}><Plus size={14} /> Add Reward</CmsButton>
          )}
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors ${
                tab === t ? "border-brand text-brand" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Rewards" && (
          <CmsCard noPadding className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">Reward</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Active</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.loyaltyRewards.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-[13px]">No rewards yet — add one to get started.</td></tr>
                )}
                {data.loyaltyRewards.map(r => (
                  <tr key={r.id} className="text-[13px] hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-surface flex items-center justify-center text-brand shrink-0">
                          <Gift size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-black">{r.title}</p>
                          {r.description && <p className="text-[11px] text-gray-400 max-w-xs truncate">{r.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-black">{r.pointsCost}</td>
                    <td className="px-6 py-4">{r.stock === null ? "Unlimited" : r.stock}</td>
                    <td className="px-6 py-4"><StatusBadge status={r.active ? "LIVE" : "DRAFT"} /></td>
                    <td className="px-6 py-4 flex gap-2">
                      <CmsButton variant="ghost" onClick={() => openEdit(r as unknown as Record<string, unknown>)}><Edit size={14} /></CmsButton>
                      <CmsButton variant="destructive" onClick={() => handleDeleteReward(r.id)}><Trash2 size={14} /></CmsButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CmsCard>
        )}

        {tab === "Redemptions" && (
          <CmsCard noPadding className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Reward</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Requested</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.loyaltyRedemptions.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-[13px]">No redemption requests yet.</td></tr>
                )}
                {data.loyaltyRedemptions.map(rd => (
                  <tr key={rd.id} className="text-[13px] hover:bg-gray-50">
                    <td className="px-6 py-4">{rd.memberEmail ?? rd.memberId.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-black">{rd.rewardTitle}</td>
                    <td className="px-6 py-4">{rd.pointsSpent}</td>
                    <td className="px-6 py-4"><StatusBadge status={rd.status} /></td>
                    <td className="px-6 py-4 text-gray-400">{new Date(rd.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {rd.status === "PENDING" ? (
                        <>
                          <CmsButton variant="ghost" onClick={() => handleRedemptionDecision(rd.id, "FULFILLED")}><Check size={14} /> Fulfill</CmsButton>
                          <CmsButton variant="destructive" onClick={() => handleRedemptionDecision(rd.id, "REJECTED")}><X size={14} /> Reject</CmsButton>
                        </>
                      ) : (
                        <span className="text-gray-300 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CmsCard>
        )}

        {tab === "Members" && (
          <CmsCard noPadding className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4">Referred By</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.loyaltyMembers.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-[13px]">No loyalty members yet.</td></tr>
                )}
                {data.loyaltyMembers.map(m => (
                  <tr key={m.id} className="text-[13px] hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-black">{m.email ?? m.id.slice(0, 8)}</td>
                    <td className="px-6 py-4"><span className="font-mono text-[12px] bg-brand-surface text-brand px-2 py-0.5 rounded">{m.referralCode}</span></td>
                    <td className="px-6 py-4">{m.referredByCode ?? "—"}</td>
                    <td className="px-6 py-4 font-semibold text-black">{m.pointsBalance}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CmsCard>
        )}
      </div>

      {showModal && (
        <CmsModal
          title={editingItem?.id ? "Edit Reward" : "New Reward"}
          onClose={closeModal}
          onSave={handleSaveReward}
          loading={actionsLoading}
        >
          <FormField label="Title">
            <input className={CMS_INPUT_CLS} value={(editingItem?.title as string) ?? ''} onChange={e => update('title', e.target.value)} placeholder="e.g. Movie ticket" />
          </FormField>
          <FormField label="Description">
            <textarea rows={2} className={`${CMS_INPUT_CLS} resize-none`} value={(editingItem?.description as string) ?? ''} onChange={e => update('description', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Points Cost">
              <input type="number" min="1" className={CMS_INPUT_CLS} value={(editingItem?.points_cost as number) ?? ''} onChange={e => update('points_cost', parseInt(e.target.value))} />
            </FormField>
            <FormField label="Stock (blank = unlimited)">
              <input
                type="number"
                min="0"
                className={CMS_INPUT_CLS}
                value={editingItem?.stock === null || editingItem?.stock === undefined ? '' : (editingItem.stock as number)}
                onChange={e => update('stock', e.target.value === '' ? null : parseInt(e.target.value))}
              />
            </FormField>
          </div>
          <FormField label="Image URL">
            <input className={CMS_INPUT_CLS} value={(editingItem?.image_url as string) ?? ''} onChange={e => update('image_url', e.target.value)} placeholder="/media/year/month/filename.png" />
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(editingItem?.active as boolean) ?? true} onChange={e => update('active', e.target.checked)} className="accent-brand" />
            <span className="text-[12px] font-bold text-black">Active (visible in student portal)</span>
          </label>
        </CmsModal>
      )}
    </>
  );
}
