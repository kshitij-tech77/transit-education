"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

type TiptapEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

// Does this plain-text blob look like HTML markup (either raw or
// entity-encoded)? Used to catch the common mistake of pasting HTML source
// into the rich-text area, which Tiptap would otherwise store as literal
// text (`&lt;p&gt;…`).
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

// Unwrap `<p>` tags that (invalidly) contain block-level elements. Decoding
// previously-escaped content leaves a stray `<p>…entire document…</p>`
// wrapper behind — this strips it without touching valid markup.
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

const hasNestedBlockParagraph = (html: string) =>
  /<p>\s*<(?:p|h[1-6]|ul|ol|table|blockquote|pre|figure|div)\b/i.test(html);

// Elements the rich-text editor's schema can't represent — switching to the
// visual view would silently drop them.
const RICH_LOSSY_RE = /<(?:table|img|iframe|figure|video|audio)\b/i;

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
  const [showSource, setShowSource] = useState(false);
  const [source, setSource] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-brand underline font-bold" } }),
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      Blockquote,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      // Intercept a paste of HTML *source text* (no real rich clipboard
      // payload) and insert it as parsed HTML instead of literal characters.
      handlePaste: (_view, event) => {
        const clip = event.clipboardData;
        if (!clip) return false;
        if (clip.getData("text/html")) return false; // genuine rich content — let Tiptap handle it
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

  const openSource = () => {
    setSource(editor.getHTML());
    setShowSource(true);
  };

  const onSourceChange = (next: string) => {
    setSource(next);
    onChange(next); // the textarea is the source of truth while it's open
  };

  const applyAndCloseSource = () => {
    if (
      RICH_LOSSY_RE.test(source) &&
      !window.confirm(
        "The visual editor can't display tables or images — switching to it will remove them from this post.\n\nOK to switch anyway, or Cancel to keep editing the HTML."
      )
    ) {
      return;
    }
    editor.commands.setContent(source, { emitUpdate: false });
    setShowSource(false);
  };

  const fixEscapedSource = () => onSourceChange(tidyHtml(decodeEntities(source)));
  const tidySource = () => onSourceChange(tidyHtml(source));

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

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
          disabled={showSource}
        >
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
          disabled={showSource}
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
          disabled={showSource}
        >
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

        <ToolbarButton
          onClick={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
          title="Insert Link"
          disabled={showSource}
        >
          <LinkIcon size={16} />
        </ToolbarButton>

        <div className="w-px h-6 bg-gray-200 mx-1 self-center" />

        <ToolbarButton
          onClick={showSource ? applyAndCloseSource : openSource}
          active={showSource}
          title={showSource ? "Back to rich text" : "Edit / paste HTML source"}
        >
          <CodeIcon size={16} />
        </ToolbarButton>

        <div className="flex-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={showSource}>
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={showSource}>
          <Redo size={16} />
        </ToolbarButton>
      </div>

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
          {!isEscapedHtml(source) && hasNestedBlockParagraph(source) && (
            <button
              type="button"
              onClick={tidySource}
              className="flex items-center gap-2 text-[12px] font-[600] text-brand bg-brand-surface border border-brand/30 rounded-[8px] px-3 py-2 hover:bg-brand/10 transition-colors"
            >
              <WandSparkles size={14} />
              Stray &lt;p&gt; wrapper around the whole document — click to clean it up
            </button>
          )}
          <textarea
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[500px] rounded-xl border border-[#EDE8E8] bg-[#1C1C1C] text-[#E5E7EB] font-mono text-[13px] leading-relaxed p-4 outline-none focus:border-brand resize-y"
            placeholder="<p>Paste or edit raw HTML here…</p>"
          />
          <p className="text-[11px] text-[#999]">
            Editing HTML directly — you can save from here. Tables and images only survive in this view;
            the <CodeIcon size={11} className="inline -mt-0.5" /> rich-text view drops them.
          </p>
        </div>
      ) : (
        <div className="min-h-[500px] prose prose-slate max-w-none focus:outline-none">
          <EditorContent editor={editor} className="focus:outline-none min-h-[500px]" />
        </div>
      )}
    </div>
  );
}
