import { redirect } from "next/navigation";

export default function LegacyNewPromotionPage() {
  redirect("/admin/packages/new");
}
