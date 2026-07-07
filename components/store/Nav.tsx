"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CartButton } from "@/components/store/cart/CartButton";

// `/shop` and `/bundles` are real routes; the rest are homepage sections,
// addressed as `/#…` so they resolve from any page (e.g. while on /shop), not
// only the homepage.
const LINKS = [
  { href: "/#concerns", label: "Shop by Concern" },
  { href: "/shop", label: "Products" },
  { href: "/bundles", label: "Bundles" },
  { href: "/#science", label: "The Science" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#blog", label: "Blog" },
] as const;

export function Nav({ authed = false }: { authed?: boolean }) {
  // Header starts borderless over the page; a hairline + shadow fade in once
  // the user scrolls (reference.html `header.scrolled` behavior).
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={scrolled ? "scrolled" : undefined}>
      <div className="wrap nav-in">
        <Link className="logo" href="/" aria-label="Avesta Nordic home">
          <span className="dot" aria-hidden />
          AVESTA&nbsp;NORDIC
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-cta">
          <Link
            className="nav-account"
            href={authed ? "/account" : "/login"}
            aria-label={authed ? "Your account" : "Sign in"}
          >
            {authed ? "Account" : "Sign in"}
          </Link>
          <CartButton />
          <Button variant="primary" href="/shop">
            Shop Now
          </Button>
        </div>
      </div>
    </nav>
  );
}
