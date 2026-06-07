"use client";

import dynamic from "next/dynamic";

import type { TestimonialsModernProps } from "@/components/sections/testimonials/testimonials-modern";

const TestimonialsModern = dynamic(
  () =>
    import("@/components/sections/testimonials/testimonials-modern").then(
      (module) => module.TestimonialsModern,
    ),
  { ssr: false },
);

export function TestimonialsModernLazy(props: TestimonialsModernProps) {
  return <TestimonialsModern {...props} />;
}
