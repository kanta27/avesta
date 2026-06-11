"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createDiscountAction } from "@/app/admin/(dashboard)/discounts/actions";

/**
 * Create-discount form (feature 12, module 3). Client component for state only —
 * the write is `createDiscountAction` (requireAdmin + service role). The kind
 * options are declared locally so this file imports nothing server-only.
 *
 * Money is entered in ₹ and converted to integer paise before submit; date
 * fields are local datetime-inputs converted to ISO.
 */

type Kind = "percent" | "flat" | "free_shipping";

const inputCls =
  "w-full rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";
const labelCls = "mb-1 block text-sm font-medium";

const rupeesToPaise = (s: string): number => {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};
const toIso = (local: string): string | null =>
  local ? new Date(local).toISOString() : null;

export function DiscountForm() {
  const router = useRouter();
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  const [code, setCode] = useState("");
  const [kind, setKind] = useState<Kind>("percent");
  const [valuePct, setValuePct] = useState("");
  const [valueFlat, setValueFlat] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perPhoneLimit, setPerPhoneLimit] = useState("1");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      code,
      kind,
      value_pct: kind === "percent" ? Number(valuePct) : null,
      value_paise: kind === "flat" ? rupeesToPaise(valueFlat) : null,
      min_order_paise: minOrder ? rupeesToPaise(minOrder) : 0,
      usage_limit: usageLimit === "" ? null : Number.parseInt(usageLimit, 10),
      per_phone_limit:
        perPhoneLimit === "" ? null : Number.parseInt(perPhoneLimit, 10),
      starts_at: toIso(startsAt),
      expires_at: toIso(expiresAt),
      is_active: isActive,
    };

    const res = await createDiscountAction(payload);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/admin/discounts");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold">New discount code</h1>

      {error && (
        <p className="rounded-card border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div>
        <label htmlFor={fid("code")} className={labelCls}>
          Code
        </label>
        <input
          id={fid("code")}
          className={`${inputCls} font-mono uppercase`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="WELCOME10"
          required
        />
        <p className="mt-1 text-xs text-grey">Stored uppercased.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("kind")} className={labelCls}>
            Kind
          </label>
          <select
            id={fid("kind")}
            className={inputCls}
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
          >
            <option value="percent">Percent off</option>
            <option value="flat">Flat ₹ off</option>
            <option value="free_shipping">Free shipping</option>
          </select>
        </div>

        {kind === "percent" && (
          <div>
            <label htmlFor={fid("value-pct")} className={labelCls}>
              Value (%)
            </label>
            <input
              id={fid("value-pct")}
              className={inputCls}
              type="number"
              min={0}
              max={100}
              value={valuePct}
              onChange={(e) => setValuePct(e.target.value)}
              required
            />
          </div>
        )}
        {kind === "flat" && (
          <div>
            <label htmlFor={fid("value-flat")} className={labelCls}>
              Value (₹)
            </label>
            <input
              id={fid("value-flat")}
              className={inputCls}
              type="number"
              min={0}
              step="0.01"
              value={valueFlat}
              onChange={(e) => setValueFlat(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={fid("min-order")} className={labelCls}>
            Min order (₹)
          </label>
          <input
            id={fid("min-order")}
            className={inputCls}
            type="number"
            min={0}
            step="0.01"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor={fid("usage-limit")} className={labelCls}>
            Usage limit
          </label>
          <input
            id={fid("usage-limit")}
            className={inputCls}
            type="number"
            min={1}
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="∞"
          />
          <p className="mt-1 text-xs text-grey">Blank = unlimited.</p>
        </div>
        <div>
          <label htmlFor={fid("per-phone-limit")} className={labelCls}>
            Per-phone limit
          </label>
          <input
            id={fid("per-phone-limit")}
            className={inputCls}
            type="number"
            min={1}
            value={perPhoneLimit}
            onChange={(e) => setPerPhoneLimit(e.target.value)}
            placeholder="∞"
          />
          <p className="mt-1 text-xs text-grey">Blank = unlimited.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={fid("starts-at")} className={labelCls}>
            Starts at
          </label>
          <input
            id={fid("starts-at")}
            className={inputCls}
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor={fid("expires-at")} className={labelCls}>
            Expires at
          </label>
          <input
            id={fid("expires-at")}
            className={inputCls}
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary text-sm disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create code"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/discounts")}
          className="btn btn-ghost text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
