"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState, useCallback } from "react";
import { IconBold as Bold, IconItalic as Italic, IconList as List, IconListNumbers as ListOrdered, IconH2 as Heading2, IconH3 as Heading3, IconArrowBackUp as Undo, IconArrowForwardUp as Redo, IconQuote as Quote, IconMinus as Minus, IconLink as LinkIcon, IconUnlink as Unlink } from "@tabler/icons-react";

export default function BlogEditor({
  value,
  onChange,
  dir = "ltr",
}: {
  value: string;
  onChange: (html: string) => void;
  dir?: "ltr" | "rtl";
}) {
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-[#CC0000] underline" },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[320px] px-4 py-3 outline-none prose prose-sm max-w-none",
        dir,
      },
    },
  });

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .setLink({ href: url.startsWith("http") ? url : `https://${url}` })
        .run();
    }
    setLinkInputVisible(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  if (!editor) return null;

  const btnCls = (active?: boolean) =>
    `p-1.5 rounded transition-colors ${
      active ? "bg-[#CC0000] text-white" : "text-gray-500 hover:bg-gray-100"
    }`;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-100 bg-gray-50">
        <button
          type="button"
          title="Gras"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnCls(editor.isActive("bold"))}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          title="Italique"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnCls(editor.isActive("italic"))}
        >
          <Italic size={15} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          title="Titre 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btnCls(editor.isActive("heading", { level: 2 }))}
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          title="Titre 3"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btnCls(editor.isActive("heading", { level: 3 }))}
        >
          <Heading3 size={15} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          title="Liste à puces"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnCls(editor.isActive("bulletList"))}
        >
          <List size={15} />
        </button>
        <button
          type="button"
          title="Liste numérotée"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnCls(editor.isActive("orderedList"))}
        >
          <ListOrdered size={15} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          title="Citation"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnCls(editor.isActive("blockquote"))}
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          title="Séparateur horizontal"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnCls()}
        >
          <Minus size={15} />
        </button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Link button */}
        <button
          type="button"
          title="Insérer un lien"
          onClick={() => {
            const current = editor.getAttributes("link").href ?? "";
            setLinkUrl(current);
            setLinkInputVisible((v) => !v);
          }}
          className={btnCls(editor.isActive("link"))}
        >
          <LinkIcon size={15} />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            title="Supprimer le lien"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className={btnCls()}
          >
            <Unlink size={15} />
          </button>
        )}

        <div className="flex-1" />

        <button
          type="button"
          title="Annuler"
          onClick={() => editor.chain().focus().undo().run()}
          className={btnCls()}
        >
          <Undo size={15} />
        </button>
        <button
          type="button"
          title="Rétablir"
          onClick={() => editor.chain().focus().redo().run()}
          className={btnCls()}
        >
          <Redo size={15} />
        </button>
      </div>

      {/* Inline link input */}
      {linkInputVisible && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-blue-50">
          <LinkIcon size={14} className="text-blue-500 shrink-0" />
          <input
            autoFocus
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") { setLinkInputVisible(false); setLinkUrl(""); }
            }}
            className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
          />
          <button
            type="button"
            onClick={applyLink}
            className="text-xs font-semibold text-white bg-[#CC0000] px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => { setLinkInputVisible(false); setLinkUrl(""); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
