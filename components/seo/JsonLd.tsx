// Shared JSON-LD emitter. Mirrors the inline `<script type="application/ld+json">`
// pattern the PDP already uses (app/(store)/shop/[slug]/page.tsx), so structured
// data renders identically wherever it's needed. Server-safe; `data` is any
// JSON-serializable schema.org node (or array of nodes).
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
