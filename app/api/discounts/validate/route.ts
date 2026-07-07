import { NextResponse } from "next/server";
import { z } from "zod";

import { validateAndApply } from "@/lib/discounts";

/**
 * Preview-validate a discount code for the cart drawer (feature: reference
 * homepage port). READ-ONLY: reuses the same server-side engine as checkout
 * (`validateAndApply`) but writes nothing — the authoritative validation and
 * redemption still happen at create-order/paid. Phone is unknown in the
 * drawer, so the per-phone-limit check runs against an empty phone (no
 * redemptions can match); checkout re-checks with the real phone.
 */
const bodySchema = z.object({
  code: z.string().trim().min(1).max(60),
  subtotal_paise: z.number().int().min(0).max(100_000_000),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: "Invalid request." },
      { status: 400 },
    );
  }

  const result = await validateAndApply({
    code: parsed.data.code,
    phone: "",
    subtotalPaise: parsed.data.subtotal_paise,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason });
  }
  return NextResponse.json({
    ok: true,
    code: result.code,
    discount_paise: result.discount_paise,
    free_shipping: result.free_shipping,
  });
}
