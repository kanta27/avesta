"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { publicEnv } from "@/lib/env";
import { getOrderById, updateOrder } from "@/lib/orders/admin";
import { isOrderStatus, type OrderStatus } from "@/lib/orders/types";
import { sendReviewRequest, sendShippedNotification } from "@/lib/whatsapp";

/**
 * Orders server actions (feature 12, module 2).
 *
 * requireAdmin() FIRST, then writes via the service-role data layer.
 *
 * SHIPPED PATH (spec-critical): when an order moves INTO `shipped`, the tracking
 * URL + courier are persisted in the SAME update as the status — committed BEFORE
 * the customer notification fires. The send is non-fatal and fire-and-forget
 * (`void`): the WhatsApp facade never throws (dormant without a key), and the
 * status update is already committed, so a failed/absent message can never block
 * or reverse the fulfilment.
 */

export type OrderActionResult = { ok: true } | { ok: false; error: string };

const updateSchema = z.object({
  status: z.string().refine(isOrderStatus, "Invalid order status."),
  tracking_url: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.url("Tracking URL must be a valid URL.").max(1000).optional(),
  ),
  courier: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(120).optional(),
  ),
});

/**
 * Update an order's status and tracking fields in one write. If the order is
 * transitioning into `shipped`, requires a tracking URL, persists it with the
 * status, then fires the (non-fatal) shipped notification.
 */
export async function updateOrderAction(
  id: string,
  raw: unknown,
): Promise<OrderActionResult> {
  await requireAdmin();

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const status = parsed.data.status as OrderStatus;
  const trackingUrl = parsed.data.tracking_url ?? null;
  const courier = parsed.data.courier ?? null;

  const current = await getOrderById(id);
  if (!current) return { ok: false, error: "Order not found." };

  // Notify only on the actual transition INTO shipped — re-saving an already
  // shipped order won't re-message the customer.
  const movingToShipped = status === "shipped" && current.status !== "shipped";

  // Likewise, the post-delivery review request fires ONLY on the transition INTO
  // delivered (prior status != delivered). Re-saving an already-delivered order
  // must NOT re-fire it — the customer gets at most one ask.
  const movingToDelivered = status === "delivered" && current.status !== "delivered";

  // A shipped order MUST carry tracking. Accept it from this submit or from a
  // previously-saved value; refuse to ship with nothing to track.
  if (status === "shipped" && !trackingUrl && !current.trackingUrl) {
    return {
      ok: false,
      error: "Add a tracking URL before marking the order shipped.",
    };
  }

  try {
    // Single UPDATE: status + tracking persisted together (committed first).
    const row = await updateOrder(id, {
      status,
      tracking_url: trackingUrl ?? current.trackingUrl,
      courier: courier ?? current.courier,
    });

    // Notify AFTER the persist (already committed above). We AWAIT the send so
    // it actually completes on serverless — a void'd promise can be cut off when
    // the action returns. It stays strictly non-fatal: its OWN try/catch means a
    // failed/absent message can never reach the outer catch and flip an
    // already-shipped order to an error. (The facade never throws anyway; this is
    // belt-and-suspenders.)
    if (movingToShipped) {
      try {
        await sendShippedNotification({
          order_number: row.order_number,
          customer_phone: row.customer_phone,
          courier: row.courier,
          tracking_url: row.tracking_url,
        });
      } catch (err) {
        console.error(
          `[orders] shipped notification failed (non-fatal) — order ${row.order_number}:`,
          err,
        );
      }
    }

    // Post-delivery review request — same non-fatal, await-then-swallow shape as
    // the shipped notification. The status is already committed above, so a
    // failed/absent send can never flip a delivered order back to an error. Fires
    // at most once: `movingToDelivered` is false when re-saving a delivered order.
    if (movingToDelivered) {
      try {
        await sendReviewRequest({
          order_number: row.order_number,
          customer_phone: row.customer_phone,
          review_url: `${publicEnv.NEXT_PUBLIC_SITE_URL}/review?order=${encodeURIComponent(row.order_number)}`,
        });
      } catch (err) {
        console.error(
          `[orders] review request failed (non-fatal) — order ${row.order_number}:`,
          err,
        );
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update order.";
    return { ok: false, error: message };
  }
}
