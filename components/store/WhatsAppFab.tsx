/**
 * Floating WhatsApp action button. The number is a placeholder until the
 * WhatsApp Business account is provisioned (Part F / feature 10).
 */
export function WhatsAppFab() {
  return (
    <a
      className="wa"
      href="https://wa.me/910000000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <span aria-hidden>💬</span>
    </a>
  );
}
