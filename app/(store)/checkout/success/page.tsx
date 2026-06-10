import { redirect } from "next/navigation";

/**
 * Legacy post-payment landing (feature 5). Superseded by `/order/confirmed`
 * (feature 6), which is keyed by the order's non-guessable UUID. Kept only as a
 * redirect so any stale link still resolves — there is no second success page.
 *
 * The old `?order=<order_number>` param is intentionally NOT honored as a key:
 * order numbers are enumerable, so we never look an order up by number. With an
 * `?id=<uuid>` we forward to the real page; otherwise back to the shop.
 */
export default async function CheckoutSuccessRedirect({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (id) redirect(`/order/confirmed?id=${encodeURIComponent(id)}`);
  redirect("/shop");
}
