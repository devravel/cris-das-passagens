"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/footer";

export function SiteFooter() {
  const pathname = usePathname();
  const showAddress = pathname === "/";

  return <Footer showAddress={showAddress} />;
}
