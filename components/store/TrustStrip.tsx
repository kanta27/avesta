const ITEMS = [
  { icon: "⚗", label: "CLINICALLY VALIDATED" },
  { icon: "🧬", label: "SCIENCE-BACKED FORMULAS" },
  { icon: "✓", label: "FSSAI LICENSED" },
  { icon: "🔒", label: "SECURE PREPAID CHECKOUT" },
  { icon: "🚚", label: "PAN-INDIA DELIVERY" },
  { icon: "★", label: "RATED 4.5 ON AMAZON" },
] as const;

export function TrustStrip() {
  // Rendered twice so the CSS `translateX(-50%)` marquee loops seamlessly
  // (the demo duplicated the markup via JS; here it's just JSX).
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="trust">
      <div className="marquee" aria-hidden>
        {loop.map((item, i) => (
          <span key={`${item.label}-${i}`}>
            <i>{item.icon}</i> {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
