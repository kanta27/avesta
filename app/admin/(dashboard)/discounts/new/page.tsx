import { requireAdmin } from "@/lib/auth/require-admin";
import { DiscountForm } from "@/components/admin/DiscountForm";

/** Create a new discount code (feature 12, module 3). */
export default async function NewDiscountPage() {
  await requireAdmin();
  return <DiscountForm />;
}
