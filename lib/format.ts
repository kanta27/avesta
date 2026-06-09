const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format integer paise as ₹ at the display edge (e.g. 108000 → "₹1,080"). */
export function formatPaiseINR(paise: number): string {
  return INR.format(Math.round(paise) / 100);
}
