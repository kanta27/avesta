import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string | null;
  totalPaise: number;
  itemCount: number;
}

/**
 * List the signed-in customer's own orders, newest first.
 *
 * `orders` is RLS-locked (deny-all to public), so this reads via the
 * service-role client and SCOPES strictly to `auth_user_id = userId` — a user
 * only ever sees their own rows. Unpaid `created` orders are excluded (they're
 * abandoned/in-flight, not real orders, matching the receipt page).
 */
export async function getOrdersForUser(
  userId: string,
): Promise<CustomerOrderSummary[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id, order_number, status, created_at, total_paise, items")
    .eq("auth_user_id", userId)
    .neq("status", "created")
    .order("created_at", { ascending: false })
    .limit(50);

  if (!data) return [];

  return data.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    createdAt: o.created_at,
    totalPaise: o.total_paise,
    itemCount: Array.isArray(o.items) ? o.items.length : 0,
  }));
}
