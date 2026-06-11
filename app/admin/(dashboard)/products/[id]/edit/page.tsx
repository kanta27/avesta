import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getProductForEdit } from "@/lib/products/admin";
import { ProductForm } from "@/components/admin/ProductForm";

/** Edit an existing product (feature 12, module 1). */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductForEdit(id);
  if (!product) notFound();

  const { id: productId, ...initial } = product;
  return <ProductForm productId={productId} initial={initial} />;
}
