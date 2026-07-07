"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/home/icons";
import { CartButton } from "@/components/store/cart/CartButton";

/**
 * Reference header (design/reference.html) as the site-wide nav. Markup and
 * copy are the reference's; only the link targets are real routes/anchors and
 * the cart button is wired to the live cart store. The reference's on-page
 * anchors are addressed as `/#…` so they resolve from any route.
 */
const LINKS = [
  { href: "/#shop", label: "Shop" },
  { href: "/#science", label: "Science" },
  { href: "/#diagnostics", label: "Diagnostics" },
  { href: "/#nutrition", label: "Nutrition" },
  { href: "/#crops", label: "Crops" },
  { href: "/#insights", label: "Insights" },
] as const;

const MOBILE_LINKS = [
  { href: "/#shop", label: "Shop" },
  { href: "/#science", label: "Science" },
  { href: "/#avestagenome", label: "The Avestagenome Project" },
  { href: "/#diagnostics", label: "Diagnostics" },
  { href: "/#nutrition", label: "Nutrition & Functional Foods" },
  { href: "/#pharma", label: "Bio-Pharmaceuticals" },
  { href: "/#crops", label: "Adjusted Crops" },
  { href: "/#research", label: "Research & Network" },
  { href: "/#insights", label: "Insights" },
] as const;

export function Nav({ authed = false }: { authed?: boolean }) {
  // Reference `header.scrolled`: hairline + shadow fade in past 8px of scroll.
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header id="top" className={scrolled ? "scrolled" : undefined}>
      <div className="wrap nav">
        <Link className="brand" href="/" aria-label="Avesta Wellbeing home">
          <BrandMark className="mark" />
          <span className="name">
            Avesta Wellbeing
            <span className="sub">Est. 1998</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          {/* Not in the reference: account entry, kept for the real auth flow. */}
          <Link href={authed ? "/account" : "/login"}>
            {authed ? "Account" : "Sign in"}
          </Link>
        </nav>
        <div className="nav-cta">
          <CartButton />
          <Link className="btn brass" href="/#contact">
            Book a consultation
          </Link>
          <button
            className="burger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        {MOBILE_LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={closeMenu}>
            {l.label}
          </Link>
        ))}
        <Link href={authed ? "/account" : "/login"} onClick={closeMenu}>
          {authed ? "Account" : "Sign in"}
        </Link>
        <Link className="btn brass" href="/#contact" onClick={closeMenu}>
          Book a consultation
        </Link>
      </div>
    </header>
  );
}
