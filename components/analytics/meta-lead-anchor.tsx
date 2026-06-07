"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import {
  trackMetaLead,
  trackMetaLeadFromHref,
  type MetaLeadParams,
} from "@/lib/meta-pixel";

type MetaLeadAnchorProps = ComponentPropsWithoutRef<"a"> & {
  leadParams?: MetaLeadParams;
};

export function MetaLeadAnchor({
  leadParams,
  onClick,
  href,
  ...props
}: MetaLeadAnchorProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (href) {
      trackMetaLeadFromHref(href, leadParams);
    } else {
      trackMetaLead(leadParams);
    }

    onClick?.(event);
  }

  return <a href={href} onClick={handleClick} {...props} />;
}
