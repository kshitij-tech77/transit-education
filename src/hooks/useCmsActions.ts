"use client";

/**
 * useCmsActions — CRUD + media upload operations for the CMS portal.
 *
 * NOT yet wired into Portal.tsx. Drop-in replacement for Portal's
 * handleSave / handleDelete / handleUpload* functions once Phase 4 begins.
 *
 * Design decisions vs Portal.tsx:
 *  • Single unified CMS_API_PATH map (from constants/cms.ts) replaces two
 *    independent, diverging ternary chains — fixing the silent bug where
 *    "Success Stories" was not kebab-cased correctly in handleDelete.
 *  • Returns ActionResult objects instead of calling setToast directly,
 *    keeping the hook decoupled from display concerns.
 *  • Three separate upload handlers (story image, event image, general)
 *    are collapsed into one `uploadMedia` that returns the path, letting
 *    callers apply the result to whatever field they need.
 */

import { useState, useCallback } from "react";
import { CMS_API_PATH } from "@/constants/cms";

// ─── Return Types ─────────────────────────────────────────────────────────────

export interface ActionResult {
  ok: boolean;
  message: string;
}

export interface UploadResult extends ActionResult {
  /** Relative public path returned by the media API (e.g. /media/2026/05/img.jpg). */
  path?: string;
}

// ─── Path Resolution ──────────────────────────────────────────────────────────

/**
 * Resolves a section key or modal key to its API path segment.
 * Falls back to kebab-casing unknown keys (e.g. "my section" → "my-section").
 */
function resolveApiPath(section: string): string {
  return CMS_API_PATH[section] ?? section.toLowerCase().replace(/\s+/g, "-");
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCmsActionsReturn {
  save:        (section: string, item: Record<string, unknown>) => Promise<ActionResult>;
  remove:      (section: string, id: string)                   => Promise<ActionResult>;
  deleteMedia: (filePath: string)                              => Promise<ActionResult>;
  uploadMedia: (file: File)                                    => Promise<UploadResult>;
  loading: boolean;
}

/**
 * @param onSuccess  Called after any successful mutation. Pass `refetch` from
 *                   useCmsData to keep data in sync.
 */
export function useCmsActions(onSuccess: () => void): UseCmsActionsReturn {
  const [loading, setLoading] = useState(false);

  // ── save ───────────────────────────────────────────────────────────────────

  const save = useCallback(
    async (
      section: string,
      item: Record<string, unknown>
    ): Promise<ActionResult> => {
      setLoading(true);
      try {
        const isSettings = section === "settings";
        const isEdit     = isSettings || Boolean(item.id);
        const apiPath    = resolveApiPath(section);

        const url = isSettings
          ? "/api/cms/settings"
          : isEdit
            ? `/api/cms/${apiPath}/${(item.id as string | undefined) ?? (item.code as string | undefined) ?? ""}`
            : `/api/cms/${apiPath}`;

        const res = await fetch(url, {
          method:  isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(item),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`${res.status} — ${text.slice(0, 120)}`);
        }

        onSuccess();
        return {
          ok:      true,
          message: isEdit ? "Updated successfully" : "Created successfully",
        };
      } catch (err) {
        return {
          ok:      false,
          message: err instanceof Error ? err.message : "Error saving changes",
        };
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  // ── remove ─────────────────────────────────────────────────────────────────

  const remove = useCallback(
    async (section: string, id: string): Promise<ActionResult> => {
      setLoading(true);
      try {
        const apiPath = resolveApiPath(section);
        const res     = await fetch(`/api/cms/${apiPath}/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error(`${res.status}`);

        onSuccess();
        return { ok: true, message: "Deleted successfully" };
      } catch (err) {
        return {
          ok:      false,
          message: err instanceof Error ? err.message : "Error deleting item",
        };
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  // ── deleteMedia ────────────────────────────────────────────────────────────

  const deleteMedia = useCallback(
    async (filePath: string): Promise<ActionResult> => {
      setLoading(true);
      try {
        const res = await fetch("/api/cms/media", {
          method:  "DELETE",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ filePath }),
        });

        if (!res.ok) throw new Error(`${res.status}`);

        onSuccess();
        return { ok: true, message: "Media deleted successfully" };
      } catch (err) {
        return {
          ok:      false,
          message: err instanceof Error ? err.message : "Error deleting media",
        };
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  // ── uploadMedia ────────────────────────────────────────────────────────────
  // Replaces three separate handlers in Portal.tsx (general, story image,
  // event image). The returned `path` lets callers set it on whatever field
  // they need (approvalImage, banner_image, etc.).

  const uploadMedia = useCallback(
    async (file: File): Promise<UploadResult> => {
      setLoading(true);
      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/cms/media", {
          method: "POST",
          body:   form,
        });

        if (!res.ok) throw new Error(`${res.status}`);

        const json = (await res.json()) as { path?: string };
        onSuccess();
        return {
          ok:      true,
          message: `Uploaded: ${file.name}`,
          path:    json.path,
        };
      } catch (err) {
        return {
          ok:      false,
          message: err instanceof Error ? err.message : "Error uploading file",
        };
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return { save, remove, deleteMedia, uploadMedia, loading };
}
