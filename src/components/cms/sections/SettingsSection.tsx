"use client";

import { useState, useEffect } from "react";
import type { CmsDataState, SiteSettings } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { CmsCard, CmsButton, FormField, CMS_INPUT_CLS } from "@/components/cms/shared";

interface SettingsSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function SettingsSection({ data, actionsLoading, onSave, onToast }: SettingsSectionProps) {
  const [form, setForm] = useState<SiteSettings>({});

  useEffect(() => {
    setForm(data.settings);
  }, [data.settings]);

  function update(key: keyof SiteSettings, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const result = await onSave("settings", form as Record<string, unknown>);
    onToast(result.message);
  }

  const inputCls = CMS_INPUT_CLS;

  return (
    <div className="space-y-5 max-w-4xl">
      <CmsCard>
        <h3 className="text-[15px] font-bold text-black mb-6">Site Information</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="Site Name">
            <input className={inputCls} value={form.siteName ?? ''} onChange={e => update('siteName', e.target.value)} />
          </FormField>
          <FormField label="Tagline">
            <input className={inputCls} value={form.tagline ?? ''} onChange={e => update('tagline', e.target.value)} />
          </FormField>
          <FormField label="Contact Email">
            <input className={inputCls} value={form.email ?? ''} onChange={e => update('email', e.target.value)} />
          </FormField>
          <FormField label="Phone">
            <input className={inputCls} value={form.phone ?? ''} onChange={e => update('phone', e.target.value)} />
          </FormField>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-[13px] font-bold text-black mb-6">Social Media & Communication</h3>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Facebook URL">
              <input className={inputCls} value={form.facebookUrl ?? ''} onChange={e => update('facebookUrl', e.target.value)} />
            </FormField>
            <FormField label="Instagram URL">
              <input className={inputCls} value={form.instagramUrl ?? ''} onChange={e => update('instagramUrl', e.target.value)} />
            </FormField>
            <FormField label="LinkedIn URL">
              <input className={inputCls} value={form.linkedinUrl ?? ''} onChange={e => update('linkedinUrl', e.target.value)} />
            </FormField>
            <FormField label="WhatsApp Number">
              <input className={inputCls} value={form.whatsappNumber ?? ''} onChange={e => update('whatsappNumber', e.target.value)} placeholder="e.g. 9779851315991" />
            </FormField>
          </div>
        </div>
      </CmsCard>

      <CmsCard>
        <h3 className="text-[15px] font-bold text-black mb-6">CEO Message Section</h3>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="CEO Name">
            <input className={inputCls} value={form.ceo_name ?? ''} onChange={e => update('ceo_name', e.target.value)} placeholder="e.g. Bidhan Khadka" />
          </FormField>
          <FormField label="CEO Title">
            <input className={inputCls} value={form.ceo_title ?? ''} onChange={e => update('ceo_title', e.target.value)} placeholder="e.g. CEO & Founder" />
          </FormField>
          <FormField label="CEO Photo URL" className="col-span-2">
            <input className={inputCls} value={form.ceo_photo_url ?? ''} onChange={e => update('ceo_photo_url', e.target.value)} placeholder="/media/year/month/ceo.jpg" />
          </FormField>
          <FormField label="CEO Message" className="col-span-2">
            <textarea rows={5} className={`${inputCls} resize-none`} value={form.ceo_message ?? ''} onChange={e => update('ceo_message', e.target.value)} placeholder="CEO message text..." />
          </FormField>
        </div>
      </CmsCard>

      <CmsButton className="px-10 py-3 text-sm" loading={actionsLoading} onClick={handleSave}>
        Save All Settings
      </CmsButton>
    </div>
  );
}
