"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const reduce = useReducedMotion();

  if (reduce) {
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
