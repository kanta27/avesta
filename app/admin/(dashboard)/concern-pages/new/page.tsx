import { requireAdmin } from "@/lib/auth/require-admin";
import { getActiveProducts } from "@/lib/products/queries";
import { ConcernPageEditor } from "@/components/admin/ConcernPageEditor";

/** New concern page (feature 19). Gate first; the editor writes via a server action. */
export default async function NewConcernPagePage() {
  await requireAdmin();
  const products = await getActiveProducts();
  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
  }));

  return <ConcernPageEditor productOptions={productOptions} />;
}
