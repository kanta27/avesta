import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Nav } from "@/components/store/Nav";
import { Footer } from "@/components/store/Footer";
import { WhatsAppFab } from "@/components/store/WhatsAppFab";
import { LeadPopup } from "@/components/store/LeadPopup";
import { CatalogProvider } from "@/components/store/cart/CatalogProvider";
import { CartDrawer } from "@/components/store/cart/CartDrawer";
import { getActiveProducts } from "@/lib/products/queries";
import { getActiveBundles } from "@/lib/bundles/queries";

/**
 * Public storefront shell: announcement bar + sticky nav above the page,
 * footer + WhatsApp FAB + lead popup below. Every (store) route renders into
 * <main>.
 *
 * The active catalog (products + bundles) is fetched here once and handed to
 * `CatalogProvider` so the cart drawer / page can JOIN display prices from refs
 * — the cart itself stores no money. The slide-over `CartDrawer` is mounted here
 * so add-to-cart from any surface can open it.
 */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, bundles] = await Promise.all([
    getActiveProducts(),
    getActiveBundles(),
  ]);

  return (
    <CatalogProvider products={products} bundles={bundles}>
      <AnnouncementBar />
      <Nav />
      <main>{children}</main>
      <Footer />
      <WhatsAppFab />
      <LeadPopup />
      <CartDrawer />
    </CatalogProvider>
  );
}
