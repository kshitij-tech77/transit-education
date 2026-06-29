"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CmsButton } from "./CmsButton";

interface CmsModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  loading?: boolean;
  /** Override modal panel width. Defaults to w-[480px]. */
  className?: string;
}

export function CmsModal({
  title,
  children,
  onClose,
  onSave,
  loading = false,
  className,
}: CmsModalProps) {
  return (
    // Overlay — z-[100] is intentional layering for CMS modals above portal chrome
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* Panel — stop propagation so clicks inside don't close the modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "bg-white w-120 rounded-2xl shadow-2xl border border-gray-200",
          "animate-in fade-in zoom-in duration-200",
          className,
        )}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-4 flex justify-between items-center">
          <h2 className="text-base font-bold text-black">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-brand-surface rounded-full text-brand transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 pb-7 space-y-3.5">{children}</div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2.5">
          <CmsButton variant="secondary" onClick={onClose}>
            Cancel
          </CmsButton>
          <CmsButton onClick={onSave} loading={loading}>
            Save Changes
          </CmsButton>
        </div>
      </div>
    </div>
  );
}
