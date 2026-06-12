import { requireAdmin } from "@/lib/auth/require-admin";
import { getActiveProducts } from "@/lib/products/queries";
import { ReviewCreateForm } from "@/components/admin/ReviewCreateForm";

/** Create a new testimonial / aggregate badge (feature 17). */
export default async function NewTestimonialPage() {
  await requireAdmin();
  const products = await getActiveProducts();
  return (
    <ReviewCreateForm
      products={products.map((p) => ({ id: p.id, name: p.name }))}
    />
  );
}
