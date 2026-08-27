"use client";

import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { CmsDataState } from "@/types/cms";
import type { ActionResult } from "@/hooks/useCmsActions";
import { StatusBadge, CmsCard, CmsButton } from "@/components/cms/shared";

interface BlogSectionProps {
  data: CmsDataState;
  actionsLoading: boolean;
  onDelete: (section: string, id: string) => Promise<ActionResult>;
  onToast: (msg: string) => void;
}

export function BlogSection({ data, onDelete, onToast }: BlogSectionProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    const result = await onDelete("blog", id);
    onToast(result.message);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-[18px] font-bold text-black">Blog Management</h2>
        <CmsButton onClick={() => router.push("/cms/blog/new")}><Plus size={14} /> New Post</CmsButton>
      </div>

      <CmsCard noPadding className="overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b">
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.posts.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400 text-[13px]">No posts yet.</td></tr>
            )}
            {data.posts.map((p, i) => (
              <tr key={i} className="text-[13px] hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-black max-w-xs truncate">{p.title}</td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[11px] font-bold uppercase">{p.category}</span>
                </td>
                <td className="px-6 py-4">{p.author ?? p.authorName}</td>
                <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                <td className="px-6 py-4 text-gray-400">{p.date ?? p.publishDate}</td>
                <td className="px-6 py-4 flex gap-2">
                  <CmsButton variant="ghost" onClick={() => router.push(`/cms/blog/edit/${p.id}`)}><Edit size={14} /></CmsButton>
                  <CmsButton variant="destructive" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></CmsButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CmsCard>
    </div>
  );
}
