"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders/types";
import { updateOrderAction } from "@/app/admin/(dashboard)/orders/actions";

/**
 * Order fulfilment control (feature 12, module 2). Client island for the form
 * state only — the write is `updateOrderAction` (requireAdmin + service role).
 *
 * One Save button persists status + tracking together. When the selected status
 * is `shipped`, a tracking URL is required and the customer is notified
 * server-side (after the persist). No service-role code reaches the browser.
 */
export function OrderFulfilment({
  orderId,
  initialStatus,
  initialTrackingUrl,
  initialCourier,
}: {
  orderId: string;
  initialStatus: OrderStatus;
  initialTrackingUrl: string | null;
  initialCourier: string | null;
}) {
  const router = useRouter();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [trackingUrl, setTrackingUrl] = useState(initialTrackingUrl ?? "");
  const [courier, setCourier] = useState(initialCourier ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const inputCls =
    "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";

  async function onSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await updateOrderAction(orderId, {
      status,
      tracking_url: trackingUrl,
      courier,
    });
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
    router.refresh();
  }

  const willShip = status === "shipped" && initialStatus !== "shipped";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={fid("status")} className="mb-1 block text-sm font-medium">
          Status
        </label>
        <select
          id={fid("status")}
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className={`${inputCls} capitalize`}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("courier")} className="mb-1 block text-sm font-medium">
            Courier
          </label>
          <input
            id={fid("courier")}
            className={inputCls}
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="e.g. Delhivery"
          />
        </div>
        <div>
          <label
            htmlFor={fid("tracking-url")}
            className="mb-1 block text-sm font-medium"
          >
            Tracking URL
          </label>
          <input
            id={fid("tracking-url")}
            className={inputCls}
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
      </div>

      {willShip && (
        <p className="rounded-card border border-line bg-paper-2 px-3 py-2 text-xs text-grey">
          Marking shipped will notify the customer (WhatsApp) with the tracking
          link.
        </p>
      )}

      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="rounded-card border border-line bg-lime/20 px-3 py-2 text-sm text-ink">
          Saved.
        </p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="btn btn-primary text-sm disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
