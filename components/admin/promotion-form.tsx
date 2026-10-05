"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createPromotionAction,
  updatePromotionAction,
  uploadPromotionImageAction,
} from "@/app/admin/(protected)/promotions/actions";
import { PackageImageField } from "@/components/admin/package-image-field";
import { PromotionCard, getPromotionHref } from "@/components/promotion/promotion-popup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidBlogImageUrl } from "@/lib/blog/image-url";
import { normalizeSlug } from "@/lib/blog/utils";
import {
  EMPTY_PROMOTION_FORM_VALUES,
  RECOMMENDED_PROMOTION_IMAGE_SIZE,
  promotionFormSchema,
  type PromotionFormValues,
} from "@/lib/promotion/schemas";

type PromotionFormProps = {
  /** Ausente = criando uma promoção nova. */
  promotionId?: string;
  initialValues?: PromotionFormValues;
};

// "10/10" vira "10-10", não "1010".
const toSlug = (value: string) => normalizeSlug(value.replaceAll("/", "-"));

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null;
}

export function PromotionForm({
  promotionId,
  initialValues = EMPTY_PROMOTION_FORM_VALUES,
}: PromotionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const isEditing = Boolean(promotionId);

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const errors = form.formState.errors;
  const [name, slug, image, ctaLabel] = useWatch({
    control: form.control,
    name: ["name", "slug", "image", "ctaLabel"],
  });
  const previewImage = localPreviewUrl ?? (isValidBlogImageUrl(image) ? image : null);

  function onSubmit(values: PromotionFormValues) {
    startTransition(async () => {
      const result = promotionId
        ? await updatePromotionAction(promotionId, values)
        : await createPromotionAction(values);

      if (!result.ok) {
        toast.error(result.message);
        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (messages?.[0]) {
            form.setError(field as keyof PromotionFormValues, { message: messages[0] });
          }
        }
        return;
      }

      toast.success(result.message);
      router.push("/admin/promotions");
      router.refresh();
    });
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            {isEditing ? "Editar promoção" : "Nova promoção"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Pop-up no site + página só com os pacotes vinculados a ela.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={getPromotionHref(initialValues.slug)} target="_blank">
                <ExternalLink className="size-4" aria-hidden />
                Ver página
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/admin/promotions">
              <ArrowLeft className="size-4" aria-hidden />
              Voltar
            </Link>
          </Button>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="promotion-name" className="text-sm font-medium text-foreground">
              Nome da promoção
            </label>
            <Input
              id="promotion-name"
              placeholder="Ex.: Promoções do 10/10"
              className="h-10 rounded-xl"
              {...form.register("name", {
                onChange: (event) => {
                  // Na criação o link acompanha o nome até ser editado à mão.
                  if (!isEditing && !form.getFieldState("slug").isDirty) {
                    form.setValue("slug", toSlug(event.target.value));
                  }
                },
              })}
            />
            <p className="text-xs text-muted-foreground">Vira o título da página da promoção.</p>
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-2">
            <label htmlFor="promotion-slug" className="text-sm font-medium text-foreground">
              Link da página
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <span className="shrink-0 border-r border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                /promocoes/
              </span>
              <input
                id="promotion-slug"
                placeholder="promocoes-do-10-10"
                autoCapitalize="none"
                spellCheck={false}
                className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none"
                {...form.register("slug", {
                  setValueAs: toSlug,
                })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A página fica fora do menu fixo e do Google. Chega nela quem clica no pop-up ou em
              &ldquo;Ofertas especiais&rdquo; no menu, ou quem recebe o link.
            </p>
            <FieldError message={errors.slug?.message} />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Imagem do pop-up</span>
            <PackageImageField
              value={image}
              onChange={(next) =>
                form.setValue("image", next, { shouldDirty: true, shouldValidate: true })
              }
              onLocalPreview={setLocalPreviewUrl}
              upload={uploadPromotionImageAction}
              hint={`Recomendado: ${RECOMMENDED_PROMOTION_IMAGE_SIZE}, o mesmo tamanho do post do Instagram. A arte aparece inteira, sem corte.`}
              error={errors.image?.message}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="promotion-cta" className="text-sm font-medium text-foreground">
              Texto do botão
            </label>
            <Input
              id="promotion-cta"
              className="h-10 rounded-xl"
              maxLength={40}
              {...form.register("ctaLabel")}
            />
            <FieldError message={errors.ctaLabel?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="promotion-starts" className="text-sm font-medium text-foreground">
                Começa em
              </label>
              <Input
                id="promotion-starts"
                type="datetime-local"
                className="h-10 rounded-xl"
                {...form.register("startsAt")}
              />
              <FieldError message={errors.startsAt?.message} />
            </div>
            <div className="space-y-2">
              <label htmlFor="promotion-ends" className="text-sm font-medium text-foreground">
                Termina em
              </label>
              <Input
                id="promotion-ends"
                type="datetime-local"
                className="h-10 rounded-xl"
                {...form.register("endsAt")}
              />
              <FieldError message={errors.endsAt?.message} />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Horário de Brasília. Nesse período, e só se tiver pelo menos um pacote ativo
              vinculado, o pop-up abre no site e o item &ldquo;Ofertas especiais&rdquo; aparece no menu. Pra
              vincular, edite o pacote e escolha a promoção no campo &ldquo;Promoção&rdquo;. Depois
              do fim, o link da página leva pra /pacotes.
            </p>
          </div>

          <Button type="submit" disabled={isPending} className="h-10 rounded-xl px-5">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Salvando...
              </>
            ) : isEditing ? (
              "Salvar alterações"
            ) : (
              "Criar promoção"
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Prévia do pop-up</p>
          <div className="overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-black/10 lg:sticky lg:top-6">
            {previewImage ? (
              <PromotionCard
                name={name || "Prévia da promoção"}
                image={previewImage}
                ctaLabel={ctaLabel || "Texto do botão"}
              />
            ) : (
              <div className="flex aspect-[4/5] items-center justify-center bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                A imagem do pop-up aparece aqui.
              </div>
            )}
          </div>
          {slug ? (
            <p className="break-all text-xs text-muted-foreground">
              O botão leva pra {getPromotionHref(slug)}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
