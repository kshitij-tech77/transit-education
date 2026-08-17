"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import type { CmsDataState, Country, CountryEditState, VisaStep } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { StatusBadge, CmsCard, CmsButton, FormField, CMS_INPUT_CLS, CMS_LABEL_CLS } from "@/components/cms/shared";

interface CountryPagesSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onSave: (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

function toEditState(c: Country): CountryEditState {
  return {
    ...c,
    entryRequirements: (c.entryRequirements && !Array.isArray(c.entryRequirements))
      ? c.entryRequirements
      : { ug: [], pg: [] },
    visaProcess:        Array.isArray(c.visaProcess)         ? c.visaProcess        : [],
    requiredDocuments:  Array.isArray(c.requiredDocuments)   ? c.requiredDocuments  : [],
    costOfLiving:       c.costOfLiving    ? JSON.stringify(c.costOfLiving,    null, 2) : '',
    scholarshipData:    c.scholarshipData ? JSON.stringify(c.scholarshipData, null, 2) : '',
    cityGuides:         c.cityGuides      ? JSON.stringify(c.cityGuides,      null, 2) : '',
    universityList:     c.universityList  ? JSON.stringify(c.universityList,  null, 2) : '',
    visaExtended:       c.visaExtended    ? JSON.stringify(c.visaExtended,    null, 2) : '',
  };
}

const BLANK_COUNTRY: CountryEditState = {
  id: '', code: '', flag: '', name: '', status: 'DRAFT',
  heroTitle: '', whyStudy: '', intakes: '', visaTime: '', tuition: '', universities: '',
  majorIntakesDescription: '', metaTitle: '', metaDescription: '', lastEdited: null,
  entryRequirements: { ug: [], pg: [] }, visaProcess: [], requiredDocuments: [],
  costOfLiving: '', scholarshipData: '', cityGuides: '', universityList: '', visaExtended: '',
};

function slugify(raw: string): string {
  return raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function CountryPagesSection({ data, actionsLoading, onSave, onDelete, onToast }: CountryPagesSectionProps) {
  const [editing, setEditing] = useState<CountryEditState | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  // Kept separate from editing.id: useCmsActions.save() decides POST-vs-PUT by
  // checking Boolean(item.id), so the new-country slug can't live on editing.id
  // without every "Add Country" save being misrouted as a PUT to a row that
  // doesn't exist yet.
  const [newSlug, setNewSlug] = useState('');

  function set<K extends keyof CountryEditState>(key: K, value: CountryEditState[K]) {
    setEditing(prev => prev ? { ...prev, [key]: value } : null);
  }

  function openCreate() {
    setEditing({ ...BLANK_COUNTRY });
    setIsCreating(true);
    setSlugTouched(false);
    setNewSlug('');
  }

  function openEdit(c: Country) {
    setEditing(toEditState(c));
    setIsCreating(false);
  }

  function closeEditor() {
    setEditing(null);
    setIsCreating(false);
  }

  function handleNameChange(name: string) {
    set('name', name);
    if (!slugTouched) setNewSlug(slugify(name));
  }

  function setER(level: 'ug' | 'pg', items: string[]) {
    setEditing(prev => prev
      ? { ...prev, entryRequirements: { ...prev.entryRequirements, [level]: items } }
      : null
    );
  }

  function setVisa(steps: VisaStep[]) { set('visaProcess', steps); }
  function setDocs(docs: string[])     { set('requiredDocuments', docs); }

  async function handleSave() {
    if (!editing) return;
    if (isCreating && (!editing.name?.trim() || !newSlug.trim() || editing.code?.trim().length !== 2)) {
      onToast("Name, a URL slug, and a 2-letter country code are required");
      return;
    }
    // Creates must NOT carry an `id` — useCmsActions.save() routes to PUT
    // whenever item.id is truthy, which would 404/400 against a row that
    // doesn't exist yet. The new slug goes over as `slug`; the POST route
    // derives the row's id from it.
    const payload = isCreating
      ? { ...editing, id: undefined, slug: newSlug }
      : editing;
    const result = await onSave("Country Pages", payload as unknown as Record<string, unknown>);
    onToast(result.message);
    if (result.ok) closeEditor();
  }

  async function handleDelete() {
    if (!editing?.id) return;
    if (!confirm(`Delete ${editing.name}? This removes the entire country page and cannot be undone.`)) return;
    const result = await onDelete("countries", editing.id);
    onToast(result.message);
    if (result.ok) closeEditor();
  }

  if (editing) {
    const ugReqs  = editing.entryRequirements?.ug ?? [];
    const pgReqs  = editing.entryRequirements?.pg ?? [];
    const visaSteps = Array.isArray(editing.visaProcess) ? editing.visaProcess : [];
    const reqDocs   = Array.isArray(editing.requiredDocuments) ? editing.requiredDocuments : [];

    return (
      <div className="animate-in slide-in-from-right duration-300 space-y-5 max-w-4xl pb-10">
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 sticky top-0 z-10">
          <button onClick={closeEditor} className="p-1.5 hover:bg-brand-surface rounded-full text-brand">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-[15px] font-bold text-black">{isCreating ? 'New Country' : `Edit ${editing.name}`}</h2>
            <p className="text-[10px] text-gray-400">Changes saved to database and reflected live</p>
          </div>
          <div className="ml-auto flex gap-3">
            {!isCreating && (
              <CmsButton variant="destructive" onClick={handleDelete}><Trash2 size={13} /> Delete</CmsButton>
            )}
            <CmsButton variant="secondary" onClick={closeEditor}>Cancel</CmsButton>
            <CmsButton loading={actionsLoading} onClick={handleSave}><Save size={13} /> Save All</CmsButton>
          </div>
        </div>

        {isCreating && (
          <CmsCard>
            <h3 className={`${CMS_LABEL_CLS} mb-4`}>Country Identity</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Country Name">
                <input className={CMS_INPUT_CLS} value={editing.name ?? ''} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Sweden" />
              </FormField>
              <FormField label="Flag Emoji">
                <input className={CMS_INPUT_CLS} value={editing.flag ?? ''} onChange={e => set('flag', e.target.value)} placeholder="🇸🇪" />
              </FormField>
              <FormField label="URL Slug">
                <input
                  className={CMS_INPUT_CLS}
                  value={newSlug}
                  onChange={e => { setSlugTouched(true); setNewSlug(slugify(e.target.value)); }}
                  placeholder="sweden"
                />
              </FormField>
              <FormField label="Country Code (2 letters)">
                <input
                  className={CMS_INPUT_CLS}
                  value={editing.code ?? ''}
                  maxLength={2}
                  onChange={e => set('code', e.target.value.toUpperCase())}
                  placeholder="SE"
                />
              </FormField>
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Will publish at transiteducation.com.np/study-abroad/{newSlug || '…'}</p>
          </CmsCard>
        )}

        <CmsCard>
          <h3 className={`${CMS_LABEL_CLS} mb-4`}>Basic Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Hero Title">
              <input className={CMS_INPUT_CLS} value={editing.heroTitle ?? ''} onChange={e => set('heroTitle', e.target.value)} placeholder="Study in Canada" />
            </FormField>
            <FormField label="Status">
              <select className={`${CMS_INPUT_CLS} bg-white`} value={editing.status ?? 'DRAFT'} onChange={e => set('status', e.target.value as 'LIVE' | 'DRAFT')}>
                <option value="LIVE">LIVE</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </FormField>
            <FormField label="Major Intakes">
              <input className={CMS_INPUT_CLS} value={editing.intakes ?? ''} onChange={e => set('intakes', e.target.value)} placeholder="Feb, July, November" />
            </FormField>
            <FormField label="Visa Processing Time">
              <input className={CMS_INPUT_CLS} value={editing.visaTime ?? ''} onChange={e => set('visaTime', e.target.value)} placeholder="4–6 weeks" />
            </FormField>
            <FormField label="Tuition Range">
              <input className={CMS_INPUT_CLS} value={editing.tuition ?? ''} onChange={e => set('tuition', e.target.value)} placeholder="CAD 15,000–35,000/year" />
            </FormField>
            <FormField label="Top Universities (comma-separated)">
              <input className={CMS_INPUT_CLS} value={editing.universities ?? ''} onChange={e => set('universities', e.target.value)} placeholder="University of Toronto, UBC..." />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Why Study Here">
              <textarea rows={3} className={`${CMS_INPUT_CLS} resize-none`} value={editing.whyStudy ?? ''} onChange={e => set('whyStudy', e.target.value)} />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Major Intakes Description">
              <textarea rows={2} className={`${CMS_INPUT_CLS} resize-none`} value={editing.majorIntakesDescription ?? ''} onChange={e => set('majorIntakesDescription', e.target.value)} placeholder="Describe the intake periods in detail..." />
            </FormField>
          </div>
        </CmsCard>

        <CmsCard>
          <h3 className={`${CMS_LABEL_CLS} mb-4`}>Entry Requirements</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-bold text-brand uppercase">Undergraduate / Bachelors</h4>
                <button onClick={() => setER('ug', [...ugReqs, ''])} className="text-[10px] font-bold text-brand flex items-center gap-1 hover:opacity-70"><Plus size={11} /> Add</button>
              </div>
              <div className="space-y-2">
                {ugReqs.map((req, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</div>
                    <input
                      className={`${CMS_INPUT_CLS} flex-1`}
                      value={req}
                      onChange={e => { const u = [...ugReqs]; u[i] = e.target.value; setER('ug', u); }}
                      placeholder="e.g. IELTS 6.0 or equivalent"
                    />
                    <button onClick={() => setER('ug', ugReqs.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={11} /></button>
                  </div>
                ))}
                {ugReqs.length === 0 && <p className="text-[11px] text-gray-400">No requirements added.</p>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] font-bold text-black uppercase">Masters / Postgraduate</h4>
                <button onClick={() => setER('pg', [...pgReqs, ''])} className="text-[10px] font-bold text-black flex items-center gap-1 hover:opacity-70"><Plus size={11} /> Add</button>
              </div>
              <div className="space-y-2">
                {pgReqs.map((req, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold shrink-0">{i + 1}</div>
                    <input
                      className={`${CMS_INPUT_CLS} flex-1`}
                      value={req}
                      onChange={e => { const u = [...pgReqs]; u[i] = e.target.value; setER('pg', u); }}
                      placeholder="e.g. Bachelors from recognized university"
                    />
                    <button onClick={() => setER('pg', pgReqs.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={11} /></button>
                  </div>
                ))}
                {pgReqs.length === 0 && <p className="text-[11px] text-gray-400">No requirements added.</p>}
              </div>
            </div>
          </div>
        </CmsCard>

        <CmsCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className={CMS_LABEL_CLS}>Visa Process Steps</h3>
            <button onClick={() => setVisa([...visaSteps, { title: '', text: '' }])} className="text-[10px] font-bold text-brand flex items-center gap-1 hover:opacity-70"><Plus size={11} /> Add Step</button>
          </div>
          <div className="space-y-3">
            {visaSteps.map((step, i) => (
              <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">{i + 1}</div>
                <div className="flex-1 space-y-2">
                  <input
                    className={CMS_INPUT_CLS}
                    value={step.title}
                    onChange={e => { const u = [...visaSteps]; u[i] = { ...u[i], title: e.target.value }; setVisa(u); }}
                    placeholder="Step title (e.g. Gather Documents)"
                  />
                  <textarea
                    rows={2}
                    className={`${CMS_INPUT_CLS} resize-none`}
                    value={step.text}
                    onChange={e => { const u = [...visaSteps]; u[i] = { ...u[i], text: e.target.value }; setVisa(u); }}
                    placeholder="Brief description of this step..."
                  />
                </div>
                <button onClick={() => setVisa(visaSteps.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg self-start"><Trash2 size={12} /></button>
              </div>
            ))}
            {visaSteps.length === 0 && <p className="text-[12px] text-gray-400 text-center py-4">No steps yet. Click "Add Step" to begin.</p>}
          </div>
        </CmsCard>

        <CmsCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className={CMS_LABEL_CLS}>Required Documents</h3>
            <button onClick={() => setDocs([...reqDocs, ''])} className="text-[10px] font-bold text-brand flex items-center gap-1 hover:opacity-70"><Plus size={11} /> Add</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {reqDocs.map((doc, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={`${CMS_INPUT_CLS} flex-1`}
                  value={doc}
                  onChange={e => { const u = [...reqDocs]; u[i] = e.target.value; setDocs(u); }}
                  placeholder="e.g. Passport Copy"
                />
                <button onClick={() => setDocs(reqDocs.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={11} /></button>
              </div>
            ))}
            {reqDocs.length === 0 && <p className="col-span-2 text-[11px] text-gray-400">No documents listed.</p>}
          </div>
        </CmsCard>

        <CmsCard>
          <h3 className={`${CMS_LABEL_CLS} mb-4`}>SEO Settings</h3>
          <div className="space-y-4">
            <FormField label="Meta Title" charCount={(editing.metaTitle ?? '').length} charLimit={60}>
              <input className={CMS_INPUT_CLS} value={editing.metaTitle ?? ''} onChange={e => set('metaTitle', e.target.value)} placeholder={`Study in ${editing.name} | Transit Education`} />
            </FormField>
            <FormField label="Meta Description" charCount={(editing.metaDescription ?? '').length} charLimit={160}>
              <textarea rows={3} className={`${CMS_INPUT_CLS} resize-none`} value={editing.metaDescription ?? ''} onChange={e => set('metaDescription', e.target.value)} placeholder={`Complete guide to studying in ${editing.name} for Nepali students.`} />
            </FormField>
          </div>
        </CmsCard>

        <CmsCard>
          <h3 className={`${CMS_LABEL_CLS} mb-1`}>Sub-Page Content (JSON)</h3>
          <p className="text-[11px] text-gray-400 mb-4">Powers /visa, /scholarships, /cost, /universities sub-pages. Paste valid JSON or leave blank to use built-in static content.</p>
          <div className="space-y-5">
            {[
              { key: 'costOfLiving'    as const, label: 'Cost of Living',          placeholder: '{"currency":"CAD","cities":[{"name":"Toronto","total_estimate":"CA$1,500–$2,500/month"}]}' },
              { key: 'scholarshipData' as const, label: 'Scholarship Data',        placeholder: '{"scholarships":[{"name":"Vanier","amount":"CA$50,000/yr","level":"PhD"}]}' },
              { key: 'cityGuides'      as const, label: 'City Guides',             placeholder: '{"cities":[{"name":"Toronto","description":"Canada\'s largest city"}]}' },
              { key: 'universityList'  as const, label: 'University List',         placeholder: '{"universities":[{"name":"U of Toronto","rank":25}]}' },
              { key: 'visaExtended'    as const, label: 'Visa Extended Content',   placeholder: '{"steps":[{"title":"Apply","text":"Submit online"}]}' },
            ].map(({ key, label, placeholder }) => (
              <FormField key={key} label={label}>
                <textarea
                  rows={6}
                  className={`${CMS_INPUT_CLS} resize-y font-mono text-[11px]`}
                  value={editing[key] ?? ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  spellCheck={false}
                />
              </FormField>
            ))}
          </div>
        </CmsCard>

        <div className="flex gap-3">
          <CmsButton loading={actionsLoading} onClick={handleSave} className="px-8"><Save size={13} /> Save All Changes</CmsButton>
          <CmsButton variant="secondary" onClick={closeEditor}>Cancel</CmsButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] font-bold text-black">Country Pages</h2>
        <CmsButton onClick={openCreate}><Plus size={14} /> Add Country</CmsButton>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {data.countries.map((c, i) => (
          <CmsCard
            key={i}
            className="hover:border-brand/30 transition-all cursor-pointer"
            onClick={() => openEdit(c)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-[32px]">{c.flag}</div>
              <StatusBadge status={c.status} />
            </div>
            <h3 className="text-[15px] font-semibold text-black mb-1">{c.name}</h3>
            <p className="text-[11px] text-gray-400 mb-4">
              {c.visaProcess?.length > 0 ? `${c.visaProcess.length} visa steps` : 'No visa steps'}{' · '}
              {(c.entryRequirements?.ug?.length ?? 0) + (c.entryRequirements?.pg?.length ?? 0)} requirements
            </p>
            <CmsButton variant="ghost" className="w-full">Edit Content</CmsButton>
          </CmsCard>
        ))}
      </div>
    </div>
  );
}
