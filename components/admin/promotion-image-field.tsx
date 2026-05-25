"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Link2, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { uploadPromotionImageAction } from "@/app/admin/(protected)/promotions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ImageMode = "upload" | "url";

type PromotionImageFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onLocalPreview?: (url: string | null) => void;
  error?: string;
};

export function PromotionImageField({
  value,
  onChange,
  onLocalPreview,
  error,
}: PromotionImageFieldProps) {
  const [mode, setMode] = useState<ImageMode>("url");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const localPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  function setLocalPreview(file: File | null) {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }

    if (!file) {
      onLocalPreview?.(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    localPreviewRef.current = objectUrl;
    onLocalPreview?.(objectUrl);
  }

  async function handleUpload(file: File) {
    setLocalPreview(file);

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const result = await uploadPromotionImageAction(formData);
    setIsUploading(false);

    if (!result.ok || !result.data) {
      toast.error(result.message);
      return;
    }

    onChange(result.data.imageUrl);
    toast.success("Imagem enviada com sucesso.");
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
          id="image"
          className="h-10 rounded-xl"
          placeholder="https://..."
          value={value}
          onChange={(event) => {
            setLocalPreview(null);
            onChange(event.target.value);
          }}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
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

      <p className="text-xs text-muted-foreground">Envie JPG, PNG, WEBP ou AVIF com até 5MB.</p>

      {value ? (
        <p className="break-all text-xs text-muted-foreground" title={value}>
          {value}
        </p>
      ) : null}

      {error ? <p className={cn("text-xs text-destructive")}>{error}</p> : null}
    </div>
  );
}
