import { WhatsAppIcon } from "@/components/home/icons";
import { waLink } from "@/components/store/whatsapp";

/** Reference floating WhatsApp button (`.wa-fab`), wired to our wa.me flow. */
export function WhatsAppFab() {
  return (
    <a
      className="wa-fab"
      href={waLink("Hi Avesta Wellbeing! I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
