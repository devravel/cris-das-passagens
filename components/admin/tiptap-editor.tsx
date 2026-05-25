"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
} from "lucide-react";
import { toast } from "sonner";

import { uploadBlogContentImageAction } from "@/app/admin/(protected)/blogs/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TiptapEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

function ToolbarButton({ active, label, onClick, disabled, children }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn(
        "rounded-lg border-border/70 bg-background/70",
        active && "border-brand/40 bg-brand/10 text-brand",
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      {children}
    </Button>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildImageHtml(url: string, alt: string, caption?: string) {
  const safeAlt = escapeHtml(alt);
  const safeUrl = escapeHtml(url);

  if (caption?.trim()) {
    const safeCaption = escapeHtml(caption.trim());
    return `<figure class="blog-figure"><img src="${safeUrl}" alt="${safeAlt}" loading="lazy" decoding="async" class="blog-content-image" /><figcaption>${safeCaption}</figcaption></figure>`;
  }

  return `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy" decoding="async" class="blog-content-image" />`;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Escreva o conteúdo do post...",
}: TiptapEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const uploadAndInsertImage = useCallback(async (file: File) => {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingImage(true);
    const result = await uploadBlogContentImageAction(formData);
    setIsUploadingImage(false);

    if (!result.ok || !result.data) {
      toast.error(result.message);
      return;
    }

    const caption = window.prompt("Legenda da imagem (opcional):") ?? "";
    const alt = caption.trim() || file.name.replace(/\.[^.]+$/, "") || "Imagem do post";

    editorInstance
      .chain()
      .focus()
      .insertContent(buildImageHtml(result.data.imageUrl, alt, caption))
      .run();

    toast.success("Imagem inserida no conteúdo.");
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "blog-content-image",
          loading: "lazy",
          decoding: "async",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-56 rounded-b-xl px-4 py-3 text-sm leading-7 text-foreground focus:outline-none [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-brand/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-xl [&_figure]:my-6 [&_figure_img]:my-0 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground",
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) {
          return false;
        }

        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          file.type.startsWith("image/"),
        );

        if (files.length === 0) {
          return false;
        }

        event.preventDefault();
        void uploadAndInsertImage(files[0]);
        return true;
      },
      handlePaste: (_view, event) => {
        const items = Array.from(event.clipboardData?.items ?? []);
        const imageItem = items.find((item) => item.type.startsWith("image/"));

        if (!imageItem) {
          return false;
        }

        const file = imageItem.getAsFile();
        if (!file) {
          return false;
        }

        event.preventDefault();
        void uploadAndInsertImage(file);
        return true;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-4 text-sm text-muted-foreground">
        Carregando editor...
      </div>
    );
  }

  function handleSelectImage() {
    fileInputRef.current?.click();
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          void uploadAndInsertImage(file);
          event.currentTarget.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-1 border-b border-border/70 p-2">
        <ToolbarButton
          label="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Título H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Título H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Lista"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Citação"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          label="Inserir imagem"
          onClick={handleSelectImage}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="size-4" aria-hidden />
          )}
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
      {editor.isEmpty ? (
        <p className="pointer-events-none -mt-44 px-4 py-3 text-sm text-muted-foreground/70">
          {placeholder}
        </p>
      ) : null}
    </div>
  );
}
