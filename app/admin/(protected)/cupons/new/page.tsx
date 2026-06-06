import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CouponCreateScreen } from "@/components/admin/coupon-create-screen";

export const metadata: Metadata = {
  title: "Novo Cupom | Admin",
  description: "Crie um novo cupom promocional no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

type NewCouponPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewCouponPage({ searchParams }: NewCouponPageProps) {
  const params = (await searchParams) ?? {};

  if (params.done === "1") {
    redirect("/admin/cupons");
  }

  return <CouponCreateScreen />;
}
