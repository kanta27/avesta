import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  isOrderStatus,
  type ListOrdersFilter,
  type OrderDetail,
  type OrderItem,
  type OrderListItem,
  type OrderStatus,
  type ShippingAddress,
} from "./types";

/**
 * Admin orders data layer (feature 12, module 2). Service-role — orders are
 * RLS deny-all to the public, so all admin reads/writes go through here.
 * `server-only`; every caller (the server actions) gates on `requireAdmin()`.
 *
 * The status set is the REAL A2 enum — all seven values, not the happy path.
 * Transitions are not hard-constrained to a strict state machine here; the admin
 * is trusted to move an order to any valid status (incl. cancelled / refunded).
 *
 * The pure enum/types/interfaces live in `./types` (client-safe) so client
 * islands can import the enum without dragging this server-only module — and the
 * service-role client — into the browser bundle. Import pure types/enum from
 * `@/lib/orders/types`; import the data functions below from here.
 */

function asStatus(v: string | null): OrderStatus {
  return v && isOrderStatus(v) ? v : "created";
}

function jsonArray<T>(value: unknown): T[] {
  return (Array.isArray(value) ? value : []) as T[];
}

/** List orders, newest first, optionally filtered by status and/or search text. */
export async function listOrders(
  filter: ListOrdersFilter = {},
): Promise<OrderListItem[]> {
  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select(
      "id, order_number, name, customer_phone, status, total_paise, items, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (filter.status) query = query.eq("status", filter.status);

  if (filter.search) {
    // Strip characters that would break the PostgREST or() filter grammar.
    const q = filter.search.replace(/[,()*%]/g, "").trim();
    if (q) {
      query = query.or(`order_number.ilike.%${q}%,customer_phone.ilike.%${q}%`);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list orders: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.name,
    customerPhone: row.customer_phone,
    status: asStatus(row.status),
    totalPaise: row.total_paise,
    itemCount: jsonArray<OrderItem>(row.items).length,
    createdAt: row.created_at,
  }));
}

/** Load one order in full, or `null` if not found. */
export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  if (!row) return null;

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.name,
    customerPhone: row.customer_phone,
    email: row.email,
    status: asStatus(row.status),
    items: jsonArray<OrderItem>(row.items),
    shippingAddress: (row.shipping_address ?? {}) as ShippingAddress,
    subtotalPaise: row.subtotal_paise,
    discountCode: row.discount_code,
    discountPaise: row.discount_paise ?? 0,
    shippingPaise: row.shipping_paise ?? 0,
    totalPaise: row.total_paise,
    trackingUrl: row.tracking_url,
    courier: row.courier,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** The slice of an order needed to fire the shipped notification. */
export interface ShippedOrderRow {
  order_number: string;
  customer_phone: string | null;
  courier: string | null;
  tracking_url: string | null;
}

/**
 * Update an order's status and/or tracking fields. Returns the post-update slice
 * needed to notify the customer (used by the shipped path). A single UPDATE, so
 * tracking is persisted in the SAME write as the status — the shipped action can
 * rely on it being committed before it fires the notification.
 */
export async function updateOrder(
  id: string,
  patch: {
    status?: OrderStatus;
    tracking_url?: string | null;
    courier?: string | null;
  },
): Promise<ShippedOrderRow> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update(patch)
    .eq("id", id)
    .select("order_number, customer_phone, courier, tracking_url")
    .single();

  if (error) throw error;
  return data;
}
