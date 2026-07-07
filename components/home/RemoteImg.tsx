"use client";

/* eslint-disable @next/next/no-img-element */

import type { ImgHTMLAttributes } from "react";

/**
 * The reference's `<img onerror="this.remove()">` pattern for the remote
 * avesthagen.com photos — if one 404s, the element removes itself instead of
 * showing a broken-image icon. Client component purely for the onError handler.
 */
export function RemoteImg(props: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...props}
      alt={props.alt ?? ""}
      onError={(e) => e.currentTarget.remove()}
    />
  );
}
