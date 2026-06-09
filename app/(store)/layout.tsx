import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Nav } from "@/components/store/Nav";
import { Footer } from "@/components/store/Footer";
import { WhatsAppFab } from "@/components/store/WhatsAppFab";
import { LeadPopup } from "@/components/store/LeadPopup";

/**
 * Public storefront shell: announcement bar + sticky nav above the page,
 * footer + WhatsApp FAB + lead popup below. Every (store) route renders into
 * <main>.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>{children}</main>
      <Footer />
      <WhatsAppFab />
      <LeadPopup />
    </>
  );
}
