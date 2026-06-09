import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PackageEditScreen } from "@/components/admin/package-edit-screen";
import {
  getAdminPackageById,
  getPackageIncludedItemSuggestions,
} from "@/lib/package/queries";

type EditPackagePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar Pacote | Admin",
  description: "Edite um pacote turístico no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params;
  const [pkg, includedItemSuggestions] = await Promise.all([
    getAdminPackageById(id),
    getPackageIncludedItemSuggestions(),
  ]);

  if (!pkg) {
    notFound();
  }

  return (
    <PackageEditScreen
      pkg={pkg}
      includedItemSuggestions={includedItemSuggestions}
    />
  );
}
