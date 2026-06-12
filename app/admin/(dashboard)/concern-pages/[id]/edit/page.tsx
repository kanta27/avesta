import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getConcernPageForEdit } from "@/lib/concerns/admin";
import { getActiveProducts } from "@/lib/products/queries";
import { ConcernPageEditor } from "@/components/admin/ConcernPageEditor";

type Params = Promise<{ id: string }>;

/** Edit a concern page (feature 19). Gate first, load the row, then edit. */
export default async function EditConcernPagePage({
  params,
}: {
  params: Params;
}) {
  await requireAdmin();
  const { id } = await params;

  const [page, products] = await Promise.all([
    getConcernPageForEdit(id),
    getActiveProducts(),
  ]);

  if (!page) notFound();

  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
  }));

  return <ConcernPageEditor page={page} productOptions={productOptions} />;
}
