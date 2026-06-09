"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";

import { uploadBlogContentImageAction } from "@/app/admin/(protected)/blogs/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

function normalizeLinkUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function isInternalLink(url: string) {
  return url.startsWith("/") || url.startsWith("#");
}

function buildLinkHtml(text: string, url: string) {
  const safeText = escapeHtml(text);
  const safeUrl = escapeHtml(url);
  const externalAttrs = isInternalLink(url)
    ? ""
    : ' target="_blank" rel="noopener noreferrer"';

  return `<a href="${safeUrl}" class="blog-content-link"${externalAttrs}>${safeText}</a>`;
}

const editorContentClassName = [
  "min-h-56 rounded-b-xl px-4 py-3 text-sm leading-7 text-foreground focus:outline-none",
  "[&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold",
  "[&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold",
  "[&_p]:mt-3",
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6",
  "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-brand/40 [&_blockquote]:pl-3 [&_blockquote]:italic",
  "[&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline",
  "[&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-xl",
  "[&_figure]:my-6 [&_figure_img]:my-0",
  "[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-muted-foreground",
].join(" ");

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Escreva o conteúdo do post...",
}: TiptapEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
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
      Link.configure({
        openOnClick: false,
        autolink: false,
        linkOnPaste: false,
        HTMLAttributes: {
          class: "blog-content-link",
        },
      }),
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
        class: editorContentClassName,
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

  function openLinkDialog() {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    let nextText = "";
    let nextUrl = "";
    let editing = false;

    if (editorInstance.isActive("link")) {
      editorInstance.chain().focus().extendMarkRange("link").run();
      const { from, to } = editorInstance.state.selection;
      nextText = editorInstance.state.doc.textBetween(from, to);
      nextUrl = editorInstance.getAttributes("link").href ?? "";
      editing = true;
    } else {
      const { from, to, empty } = editorInstance.state.selection;
      if (!empty) {
        nextText = editorInstance.state.doc.textBetween(from, to);
      }
    }

    setLinkText(nextText);
    setLinkUrl(nextUrl);
    setIsEditingLink(editing);
    setIsLinkDialogOpen(true);
  }

  function closeLinkDialog() {
    setIsLinkDialogOpen(false);
    setLinkText("");
    setLinkUrl("");
    setIsEditingLink(false);
  }

  function applyLink() {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    const text = linkText.trim();
    const url = normalizeLinkUrl(linkUrl);

    if (!text) {
      toast.error("Informe o texto que aparecerá no post.");
      return;
    }

    if (!url) {
      toast.error("Informe o endereço do link.");
      return;
    }

    const { empty } = editorInstance.state.selection;

    if (!empty || editorInstance.isActive("link")) {
      editorInstance.chain().focus().deleteSelection().run();
    }

    editorInstance
      .chain()
      .focus()
      .insertContent(buildLinkHtml(text, url))
      .run();

    closeLinkDialog();
    toast.success(isEditingLink ? "Link atualizado." : "Link adicionado.");
  }

  function removeLink() {
    const editorInstance = editorRef.current;
    if (!editorInstance) return;

    editorInstance.chain().focus().extendMarkRange("link").unsetLink().run();
    closeLinkDialog();
    toast.success("Link removido.");
  }

  return (
    <div
      data-blog-editor="tiptap"
      className="rounded-xl border border-border/70 bg-card shadow-sm"
    >
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 rounded-lg border-border/70 bg-background/70 px-2.5",
            editor.isActive("link") && "border-brand/40 bg-brand/10 text-brand",
          )}
          onClick={openLinkDialog}
          aria-label="Inserir link"
          title="Inserir link"
        >
          <Link2 className="size-4" aria-hidden />
          Link
        </Button>
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

      <BubbleMenu
        editor={editor}
        className="flex items-center gap-1 rounded-lg border border-border/70 bg-card p-1 shadow-md"
        shouldShow={({ editor: currentEditor }) => {
          const { empty } = currentEditor.state.selection;
          return !empty;
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-lg border-border/70 bg-background px-2.5"
          onClick={openLinkDialog}
        >
          <Link2 className="size-4" aria-hidden />
          Adicionar link
        </Button>
      </BubbleMenu>

      <EditorContent editor={editor} />
      {editor.isEmpty ? (
        <p className="pointer-events-none -mt-44 px-4 py-3 text-sm text-muted-foreground/70">
          {placeholder}
        </p>
      ) : null}

      <Dialog
        open={isLinkDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeLinkDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingLink ? "Editar link" : "Inserir link"}</DialogTitle>
            <DialogDescription>
              Defina o texto que aparecerá no post e o endereço de destino. Links externos abrem em
              nova aba.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="blog-link-text" className="text-sm font-medium text-foreground">
                Texto do link
              </label>
              <Input
                id="blog-link-text"
                className="h-10 rounded-xl"
                placeholder='Ex.: Clique aqui'
                value={linkText}
                onChange={(event) => setLinkText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyLink();
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="blog-link-url" className="text-sm font-medium text-foreground">
                Endereço (URL)
              </label>
              <Input
                id="blog-link-url"
                className="h-10 rounded-xl"
                placeholder="Ex.: https://crisdaspassagens.com.br/pacotes"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyLink();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Use https:// para links externos ou /caminho para páginas do site.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {isEditingLink ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={removeLink}
              >
                <Unlink className="size-4" aria-hidden />
                Remover link
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="rounded-xl" onClick={closeLinkDialog}>
                Cancelar
              </Button>
              <Button type="button" className="rounded-xl" onClick={applyLink}>
                {isEditingLink ? "Salvar link" : "Adicionar link"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
