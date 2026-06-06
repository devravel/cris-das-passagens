import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CouponEditScreen } from "@/components/admin/coupon-edit-screen";
import { getAdminCouponById } from "@/lib/coupon/queries";

type EditCouponPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar Cupom | Admin",
  description: "Edite um cupom promocional no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const { id } = await params;
  const coupon = await getAdminCouponById(id);

  if (!coupon) {
    notFound();
  }

  return <CouponEditScreen coupon={coupon} />;
}
