/* Inline SVGs lifted verbatim from design/reference.html so every section
   component can reuse them without re-pasting markup. Paths/attrs must stay
   byte-identical to the reference — they are part of the 1:1 visual port. */

/** Header brand mark (blue/green leaf orbit). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" stroke="#27a9e0" strokeWidth="1.3" />
      <path d="M20 6c-5 4-5 10 0 14s5 10 0 14" stroke="#27a9e0" strokeWidth="1.6" fill="none" />
      <path d="M20 6c5 4 5 10 0 14s-5 10 0 14" stroke="#5aa72f" strokeWidth="1.6" fill="none" />
      <path d="M20 13c2.6-1.2 5-1 6.4.6-2 .8-4.4.6-6.4-.6Z" fill="#5aa72f" />
      <path d="M20 27c-2.6 1.2-5 1-6.4-.6 2-.8 4.4-.6 6.4.6Z" fill="#27a9e0" />
    </svg>
  );
}

/** Footer variant of the brand mark (green ring). */
export function FootMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="19" stroke="#5aa72f" strokeWidth="1.3" />
      <path d="M20 6c-5 4-5 10 0 14s5 10 0 14" stroke="#38b6e8" strokeWidth="1.6" />
      <path d="M20 6c5 4 5 10 0 14s-5 10 0 14" stroke="#79c24f" strokeWidth="1.6" />
    </svg>
  );
}

/** Nav cart icon. */
export function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 6h15l-1.5 9h-12L6 6Z" strokeLinejoin="round" />
      <path d="M6 6 5 3H2" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Empty-cart illustration inside the drawer. */
export function CartEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 6h15l-1.5 9h-12L6 6Z" strokeLinejoin="round" />
      <path d="M6 6 5 3H2" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
    </svg>
  );
}

/** Explore-tile hover arrow. */
export function TileArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Map pin used on network cards. */
export function PinIcon() {
  return (
    <svg className="pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

/** "See more products" chevron. */
export function ChevronDown() {
  return (
    <svg
      className="ic"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** WhatsApp glyph (FAB). */
export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor">
      <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3Zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C5 9.5 9.9 4.6 16 4.6S27 9.5 27 15.6 22.1 24.8 16 24.8Zm6.1-7.3c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.4-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.8-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.5 3.8 6 5.3 2.8 1.2 3.4 1 4 .9.6-.1 2-.8 2.3-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4Z" />
    </svg>
  );
}

/** Footer social glyphs. */
export function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5ZM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H21.4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21H13.7z" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.8-8.9L1 2h6.9l4.8 6.3zM17.7 20.1h1.7L7.2 3.8H5.4z" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.75-1.6 1.5V12h2.7l-.43 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
