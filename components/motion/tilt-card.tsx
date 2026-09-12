"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { useMotionReady } from "@/hooks/use-motion-ready";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Inclinação máxima em graus. */
  tilt?: number;
  scale?: number;
  lift?: number;
};

const spring = { stiffness: 70, damping: 20, mass: 1.1 };

/**
 * Card que cresce, sobe e inclina levemente seguindo o mouse. Springs físicas
 * (nada de transição CSS) pra entrada e saída ficarem suaves.
 */
export function TiltCard({
  children,
  className,
  style,
  tilt = 6,
  scale = 1.07,
  lift = 16,
}: TiltCardProps) {
  const { shouldAnimate } = useMotionReady();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const hover = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [0, 1], [tilt, -tilt]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-tilt, tilt]), spring);
  const s = useSpring(useTransform(hover, [0, 1], [1, scale]), spring);
  const y = useSpring(useTransform(hover, [0, 1], [0, -lift]), spring);

  if (!shouldAnimate) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("group", className)}
      style={{ ...style, rotateX, rotateY, scale: s, y, transformPerspective: 1000 }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        px.set((event.clientX - rect.left) / rect.width);
        py.set((event.clientY - rect.top) / rect.height);
      }}
      onPointerEnter={() => hover.set(1)}
      onPointerLeave={() => {
        hover.set(0);
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}
