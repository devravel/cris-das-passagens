"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { useMotionReady } from "@/hooks/use-motion-ready";
import { motionEase, scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = scrollRevealDefaults.y,
}: ScrollRevealProps) {
  const { shouldAnimate } = useMotionReady();

  if (!shouldAnimate) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: scrollRevealDefaults.viewportMargin }}
      transition={{
        duration: scrollRevealDefaults.duration,
        ease: motionEase,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
