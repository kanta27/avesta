import { requireAdmin } from "@/lib/auth/require-admin";
import { ProductForm } from "@/components/admin/ProductForm";
import type { ProductInput } from "@/lib/products/validation";

const BLANK: ProductInput = {
  name: "",
  slug: "",
  type: "hydration",
  tagline: null,
  description: null,
  concerns: [],
  pack_tiers: [],
  ingredients: [],
  bioactives: [],
  science_html: null,
  faqs: [],
  who_for: null,
  who_not_for: null,
  badges: [],
  images: [],
  stock_count: 0,
  is_active: true,
};

/** Create a new product (feature 12, module 1). */
export default async function NewProductPage() {
  await requireAdmin();
  return <ProductForm productId={null} initial={BLANK} />;
}
