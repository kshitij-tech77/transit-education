/**
 * Static asset URL constants.
 *
 * The Supabase project URL is already in the environment as
 * NEXT_PUBLIC_SUPABASE_URL — we derive all storage URLs from it
 * rather than embedding the raw project ID (vlrhwdcqzpfqpbqeaqyr)
 * directly in source code.
 *
 * This is the single location to update if the storage bucket
 * or project URL ever changes.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Base path for all Supabase Storage public objects. */
export const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/` as const;

/** Name of the primary media storage bucket. */
export const MEDIA_BUCKET = "media" as const;

/** Full URL base for the media bucket (append relative path to use). */
export const MEDIA_BASE = `${STORAGE_BASE}${MEDIA_BUCKET}/` as const;

/**
 * Transit Education primary logo.
 * Used in: Header.tsx, Portal.tsx sidebar.
 */
export const TRANSIT_LOGO_URL =
  `${MEDIA_BASE}2021/05/Logo-png_website.png` as const;
