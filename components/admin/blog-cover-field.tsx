"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2, ImageIcon, Link2, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { uploadBlogCoverImageAction } from "@/app/admin/(protected)/blogs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeBlogImageUrl, isValidBlogImageUrl } from "@/lib/blog/image-url";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";
import { cn } from "@/lib/utils";

type CoverImageMode = "upload" | "url";

type BlogCoverFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function BlogCoverField({ value, onChange, error }: BlogCoverFieldProps) {
  const [mode, setMode] = useState<CoverImageMode>("url");
  const [isUploading, setIsUploading] = useState(false);
  const [previewErroredUrl, setPreviewErroredUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewUrl = value.trim()
    ? resolveStorageImageSrc(normalizeBlogImageUrl(value))
    : "";
  const hasValidPreview =
    Boolean(previewUrl) &&
    (previewUrl.startsWith("/api/media/") || isValidBlogImageUrl(previewUrl)) &&
    previewErroredUrl !== previewUrl;

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const result = await uploadBlogCoverImageAction(formData);
    setIsUploading(false);

    if (!result.ok || !result.data) {
      toast.error(result.message);
      return;
    }

    onChange(result.data.coverImageUrl);
    toast.success("Imagem de capa enviada.");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          className="h-9 rounded-xl"
          onClick={() => setMode("upload")}
        >
          <UploadCloud className="size-4" aria-hidden />
          Upload do computador
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          className="h-9 rounded-xl"
          onClick={() => setMode("url")}
        >
          <Link2 className="size-4" aria-hidden />
          Usar URL
        </Button>
      </div>

      {mode === "url" ? (
        <Input
          id="coverImage"
          className="h-10 rounded-xl"
          placeholder="https://..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              void handleUpload(file);
              event.currentTarget.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-border/70"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Enviando...
              </>
            ) : (
              <>
                <UploadCloud className="size-4" aria-hidden />
                Selecionar imagem
              </>
            )}
          </Button>
          {value ? (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="size-3.5" aria-hidden />
              Imagem pronta para salvar
            </span>
          ) : null}
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/70 bg-muted/20",
          hasValidPreview ? "aspect-16/10" : "flex min-h-40 items-center justify-center",
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-brand" aria-hidden />
            Enviando imagem...
          </div>
        ) : hasValidPreview ? (
          <Image
            src={previewUrl}
            alt="Pré-visualização da capa"
            fill
            unoptimized={previewUrl.startsWith("/api/media/")}
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-cover"
            onError={() => setPreviewErroredUrl(previewUrl)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <ImageIcon className="size-8 text-muted-foreground/70" aria-hidden />
            {mode === "upload"
              ? "Selecione uma imagem para ver a pré-visualização."
              : "Cole a URL da imagem para ver a pré-visualização."}
          </div>
        )}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {value ? (
        <p className="truncate text-xs text-muted-foreground" title={value}>
          {value}
        </p>
      ) : null}
    </div>
  );
}
