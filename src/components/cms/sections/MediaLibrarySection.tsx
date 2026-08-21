"use client";

import { useId, useRef, useState } from "react";
import { Search, Plus, Filter, Eye, Trash2, Image as ImageIcon, X } from "lucide-react";
import type { CmsDataState, MediaFile } from "@/types/cms";
import type { ActionResult, UploadResult } from "@/hooks/useCmsActions";
import { CmsCard, CmsButton, useModalA11y } from "@/components/cms/shared";

interface MediaLibrarySectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onToast: (msg: string) => void;
  onUpload: (file: File) => Promise<UploadResult>;
  onDeleteMedia: (filePath: string) => Promise<ActionResult>;
}

export function MediaLibrarySection({ data, onToast, onUpload, onDeleteMedia }: MediaLibrarySectionProps) {
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = Object.keys(data.media ?? {}).sort();

  const allFiles = (
    (folderFilter ? (data.media?.[folderFilter] ?? []) : Object.values(data.media ?? {}).flat()) as MediaFile[]
  )
    .filter(f => !search.trim() || f.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => (b.mtimeMs ?? 0) - (a.mtimeMs ?? 0));

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const result = await onUpload(file);
    onToast(result.message);
  }

  async function handleDelete(filePath: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    const result = await onDeleteMedia(filePath);
    onToast(result.message);
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search media..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <CmsButton variant="secondary" onClick={() => setShowFolderMenu(v => !v)}>
                <Filter size={14} /> {folderFilter || "Filter"}
              </CmsButton>
              {showFolderMenu && (
                <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                  <button
                    onClick={() => { setFolderFilter(""); setShowFolderMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-[12px] font-medium hover:bg-gray-50"
                  >
                    All Folders
                  </button>
                  {folders.map(folder => (
                    <button
                      key={folder}
                      onClick={() => { setFolderFilter(folder); setShowFolderMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-[12px] font-medium hover:bg-gray-50 truncate"
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
            <CmsButton onClick={() => fileInputRef.current?.click()}><Plus size={14} /> Upload New</CmsButton>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {allFiles.map((file, i) => (
            <div
              key={i}
              onClick={() => setPreviewFile(file)}
              className="group relative aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-brand transition-all cursor-pointer"
            >
              <img src={file.path} alt={file.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                <p className="text-white text-[10px] font-bold truncate w-full">{file.name}</p>
                <p className="text-white/70 text-[8px] mb-2">{file.size}</p>
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setPreviewFile(file); }}
                    className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); void handleDelete(file.path); }}
                    className="p-1.5 bg-white/20 hover:bg-red-500/40 rounded-full text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {allFiles.length === 0 && (
            <div className="col-span-6 py-20 text-center text-gray-400">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>{search || folderFilter ? "No media files match your search/filter" : "No media files found"}</p>
            </div>
          )}
        </div>
      </div>

      {previewFile && (
        <MediaPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onToast={onToast} />
      )}
    </>
  );
}

interface MediaPreviewModalProps {
  file: MediaFile;
  onClose: () => void;
  onToast: (msg: string) => void;
}

// Conditionally mounted by the parent (only while `previewFile` is set), so
// useModalA11y's mount/unmount effect lines up with the modal's own open/close
// lifecycle — calling the hook from the always-mounted section itself would
// install the Escape/focus-trap listeners even while no modal is open.
function MediaPreviewModal({ file, onClose, onToast }: MediaPreviewModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useModalA11y(panelRef, onClose);

  return (
    <div onClick={onClose} className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-6">
      <div
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col outline-none"
      >
        <div className="relative">
          <img src={file.path} alt={file.name} className="w-full max-h-[60vh] object-contain bg-gray-50" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
            aria-label="Close preview"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p id={titleId} className="text-[13px] font-bold text-black truncate">{file.name}</p>
          <p className="text-[11px] text-gray-400">{file.size}</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <code className="flex-1 text-[11px] text-gray-600 truncate">{file.path}</code>
            <button
              onClick={() => { void navigator.clipboard.writeText(file.path); onToast("URL copied!"); }}
              className="shrink-0 text-[11px] font-bold text-brand hover:underline"
            >
              Copy URL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
