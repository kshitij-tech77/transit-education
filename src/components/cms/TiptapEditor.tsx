"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Image } from "@tiptap/extension-image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
  Minus,
  Code as CodeIcon,
  WandSparkles,
  Table as TableIcon,
  ImagePlus,
  Trash2,
  Loader2,
} from "lucide-react";

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

// ── HTML-paste detection ─────────────────────────────────────────
// Catch the common mistake of pasting HTML *source* into the rich-text area
// (Tiptap would otherwise store it as literal `&lt;p&gt;…` text).
const HTML_TAG_RE =
  /<\/?(?:p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|section|article|span|strong|em|b|i|u|a|br|hr|blockquote|img|figure|pre|code)\b[^>]*>/i;
const ESCAPED_TAG_RE =
  /&lt;\/?(?:p|div|h[1-6]|ul|ol|li|table|section|article|span|strong|em|b|i|u|a|br|hr|blockquote|img|figure|pre|code)\b/i;

const looksLikeHtml = (text: string) => HTML_TAG_RE.test(text);
const isEscapedHtml = (text: string) => ESCAPED_TAG_RE.test(text);

// Reverse HTML-entity encoding. `&amp;` is decoded last so a single pass on
// double-encoded input (`&amp;lt;`) still collapses one level cleanly.
const decodeEntities = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

const BLOCK_SELECTOR =
  "p,h1,h2,h3,h4,h5,h6,ul,ol,table,blockquote,pre,figure,div,section,article,hr";

// Unwrap `<p>` tags that (invalidly) contain block-level elements — the
// artefact left behind when previously-escaped HTML is decoded.
const tidyHtml = (html: string): string => {
  if (typeof window === "undefined" || !html) return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  let unwrapped = true;
  while (unwrapped) {
    unwrapped = false;
    doc.body.querySelectorAll("p").forEach((p) => {
      if (p.querySelector(BLOCK_SELECTOR)) {
        p.replaceWith(...Array.from(p.childNodes));
        unwrapped = true;
      }
    });
  }
  return doc.body.innerHTML.trim();
};

// Tags the visual editor's schema can represent. Anything else would be
// dropped by `setContent`, so we refuse to switch rather than lose it.
const SUPPORTED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "a", "span",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "hr", "pre", "code",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
  "img",
]);

const unsupportedTags = (html: string): string[] => {
  if (typeof window === "undefined" || !html.trim()) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const found = new Set<string>();
  doc.body.querySelectorAll("*").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (!SUPPORTED_TAGS.has(tag)) found.add(tag);
  });
  return [...found];
};

function ToolbarButton({
  onClick,
  active,
  children,
  title,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        "p-2 rounded-md transition-all",
        active ? "bg-brand text-white" : "text-gray-500 hover:bg-gray-200",
        disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
      )}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "text-brand underline font-bold" },
        },
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      // A paste of HTML *source text* (no rich clipboard payload) is parsed
      // and inserted as HTML instead of literal characters.
      handlePaste: (_view, event) => {
        const clip = event.clipboardData;
        if (!clip) return false;
        if (clip.getData("text/html")) return false; // real rich content — let Tiptap handle it
        let text = clip.getData("text/plain");
        if (!text) return false;
        if (isEscapedHtml(text)) text = decodeEntities(text);
        if (!looksLikeHtml(text)) return false;
        editorRef.current?.commands.insertContent(tidyHtml(text));
        return true;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  if (!editor) return null;

  const inTable = editor.isActive("table");

  const openSource = () => {
    setSource(editor.getHTML());
    setShowSource(true);
  };

  const onSourceChange = (next: string) => {
    setSource(next);
    onChange(next); // the textarea is the source of truth while it's open
  };

  const applyAndCloseSource = () => {
    const unsupported = unsupportedTags(source);
    if (unsupported.length > 0) {
      toast.error(
        `The HTML contains ${unsupported
          .map((t) => `<${t}>`)
          .join(", ")} which the visual editor can't display. Keep editing here so nothing is lost.`
      );
      return;
    }
    editor.commands.setContent(tidyHtml(source), { emitUpdate: false });
    setShowSource(false);
  };

  const fixEscapedSource = () => onSourceChange(tidyHtml(decodeEntities(source)));

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cms/media", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { path } = await res.json();
      editor.chain().focus().setImage({ src: path }).run();
      toast.success(`Inserted ${file.name}`);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-[#F9F4F4] p-1.5 border border-[#EDE8E8]">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold" disabled={showSource}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic" disabled={showSource}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline" disabled={showSource}>
          <UnderlineIcon size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1" disabled={showSource}>
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2" disabled={showSource}>
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3" disabled={showSource}>
          <Heading3 size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List" disabled={showSource}>
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List" disabled={showSource}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote" disabled={showSource}>
          <Quote size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider" disabled={showSource}>
          <Minus size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
          title="Insert Link"
          disabled={showSource}
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert table"
          disabled={showSource}
        >
          <TableIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => imageInputRef.current?.click()}
          title="Insert image"
          disabled={showSource || uploadingImage}
        >
          {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton
          onClick={showSource ? applyAndCloseSource : openSource}
          active={showSource}
          title={showSource ? "Back to rich text" : "Edit / paste HTML source"}
        >
          <CodeIcon size={16} />
        </ToolbarButton>
        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={showSource}>
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={showSource}>
          <Redo size={16} />
        </ToolbarButton>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageFile} />

      {/* Contextual table controls */}
      {!showSource && inTable && (
        <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-[600] text-[#555]">
          <span className="text-[10px] font-[700] uppercase tracking-widest text-[#999] mr-1">Table</span>
          <button type="button" className="px-2 py-1 rounded-md bg-white border border-[#EDE8E8] hover:border-brand" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Row</button>
          <button type="button" className="px-2 py-1 rounded-md bg-white border border-[#EDE8E8] hover:border-brand" onClick={() => editor.chain().focus().deleteRow().run()}>− Row</button>
          <button type="button" className="px-2 py-1 rounded-md bg-white border border-[#EDE8E8] hover:border-brand" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Col</button>
          <button type="button" className="px-2 py-1 rounded-md bg-white border border-[#EDE8E8] hover:border-brand" onClick={() => editor.chain().focus().deleteColumn().run()}>− Col</button>
          <button type="button" className="px-2 py-1 rounded-md bg-white border border-[#EDE8E8] hover:border-brand" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Header row</button>
          <button type="button" className="px-2 py-1 rounded-md bg-white border border-red-200 text-red-600 hover:border-red-400 flex items-center gap-1" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash2 size={12} /> Delete table
          </button>
        </div>
      )}

      {showSource ? (
        <div className="space-y-2">
          {isEscapedHtml(source) && (
            <button
              type="button"
              onClick={fixEscapedSource}
              className="flex items-center gap-2 text-[12px] font-[600] text-brand bg-brand-surface border border-brand/30 rounded-[8px] px-3 py-2 hover:bg-brand/10 transition-colors"
            >
              <WandSparkles size={14} />
              This looks like escaped HTML (&amp;lt;p&amp;gt;…) — click to decode &amp; clean it
            </button>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            <textarea
              value={source}
              onChange={(e) => onSourceChange(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[500px] rounded-xl border border-[#EDE8E8] bg-[#1C1C1C] text-[#E5E7EB] font-mono text-[13px] leading-relaxed p-4 outline-none focus:border-brand resize-y"
              placeholder="<p>Paste or edit raw HTML here…</p>"
            />
            <div className="min-h-[500px] max-h-[70vh] overflow-y-auto rounded-xl border border-[#EDE8E8] bg-white p-5">
              <p className="text-[10px] font-[700] uppercase tracking-widest text-[#999] mb-3">Live preview</p>
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(source) }}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#999]">
            Editing HTML directly — you can save from here. Click the <CodeIcon size={11} className="inline -mt-0.5" /> button
            to return to rich text (blocked if the HTML has elements the visual editor can&apos;t show).
          </p>
        </div>
      ) : (
        <div className="tiptap-editor min-h-[500px] prose prose-slate max-w-none focus:outline-none">
          <EditorContent editor={editor} className="focus:outline-none min-h-[500px]" />
        </div>
      )}
    </div>
  );
}
