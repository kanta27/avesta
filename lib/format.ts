const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format integer paise as ₹ at the display edge (e.g. 108000 → "₹1,080"). */
export function formatPaiseINR(paise: number): string {
  return INR.format(Math.round(paise) / 100);
}

/** Format an ISO timestamp as a readable date (e.g. "11 Jun 2026"), or "" if null. */
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
