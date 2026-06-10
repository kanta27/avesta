import type { Faq } from "@/lib/products/types";

/**
 * FAQ accordion using native <details>/<summary> — accessible and works with
 * no JS. Renders nothing when there are no FAQs.
 */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <div className="faq">
      {faqs.map((f) => (
        <details key={f.q} className="faq-item">
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
