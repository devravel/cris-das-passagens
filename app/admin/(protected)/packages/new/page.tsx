import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PackageCreateScreen } from "@/components/admin/package-create-screen";
import { getPackageIncludedItemSuggestions } from "@/lib/package/queries";

export const metadata: Metadata = {
  title: "Novo Pacote | Admin",
  description: "Crie um novo pacote turístico no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

type NewPackagePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewPackagePage({ searchParams }: NewPackagePageProps) {
  const params = (await searchParams) ?? {};

  if (params.done === "1") {
    redirect("/admin/packages");
  }

  const includedItemSuggestions = await getPackageIncludedItemSuggestions();

  return <PackageCreateScreen includedItemSuggestions={includedItemSuggestions} />;
}
