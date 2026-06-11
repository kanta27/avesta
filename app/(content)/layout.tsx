import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { Nav } from "@/components/store/Nav";
import { Footer } from "@/components/store/Footer";
import { WhatsAppFab } from "@/components/store/WhatsAppFab";
import { CatalogProvider } from "@/components/store/cart/CatalogProvider";
import { CartDrawer } from "@/components/store/cart/CartDrawer";
import { getActiveProducts } from "@/lib/products/queries";
import { getActiveBundles } from "@/lib/bundles/queries";

/**
 * Content shell (blog / science / policy pages). Mirrors the (store) chrome —
 * announcement bar + sticky nav above, footer + WhatsApp FAB below — so policy
 * pages navigate identically to the storefront. Route groups don't share
 * layouts, so this is its own copy of the shell.
 *
 * The catalog is fetched here for the same reason as (store): the shared Nav /
 * CartDrawer read it from CatalogProvider. The lead popup is intentionally NOT
 * mounted on legal/content pages.
 */
export default async function ContentLayout({
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
      <CartDrawer />
    </CatalogProvider>
  );
}
