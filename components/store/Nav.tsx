import { Button } from "@/components/ui/Button";

const LINKS = [
  { href: "#concerns", label: "Shop by Concern" },
  { href: "#shop", label: "Products" },
  { href: "#science", label: "The Science" },
  { href: "#reviews", label: "Reviews" },
  { href: "#blog", label: "Blog" },
] as const;

export function Nav() {
  return (
    <nav>
      <div className="wrap nav-in">
        <a className="logo" href="#" aria-label="Avesta Health home">
          <span className="dot" aria-hidden />
          AVESTA&nbsp;HEALTH
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-cta">
          {/* Cart is a non-functional placeholder until the Cart feature. */}
          <div className="cart-ic" role="img" aria-label="Cart, 2 items">
            <span aria-hidden>🛒</span>
            <span aria-hidden>2</span>
          </div>
          <Button variant="primary" href="#shop">
            Shop Now
          </Button>
        </div>
      </div>
    </nav>
  );
}
