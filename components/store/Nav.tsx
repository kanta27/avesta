import Link from "next/link";
import { Button } from "@/components/ui/Button";

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

export function Nav() {
  return (
    <nav>
      <div className="wrap nav-in">
        <Link className="logo" href="/" aria-label="Avesta Health home">
          <span className="dot" aria-hidden />
          AVESTA&nbsp;HEALTH
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="nav-cta">
          {/* Cart is a non-functional placeholder until the Cart feature. */}
          <div className="cart-ic" role="img" aria-label="Cart, 2 items">
            <span aria-hidden>🛒</span>
            <span aria-hidden>2</span>
          </div>
          <Button variant="primary" href="/shop">
            Shop Now
          </Button>
        </div>
      </div>
    </nav>
  );
}
