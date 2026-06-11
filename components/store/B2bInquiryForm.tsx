"use client";

import { useState, type FormEvent } from "react";

/** Org types — mirrors the `b2b` arm of lib/leads/validation (closed set). */
const ORG_TYPES = [
  { value: "doctor", label: "Doctor / Clinic" },
  { value: "pharmacy", label: "Pharmacy / Chemist" },
  { value: "distributor", label: "Distributor / Wholesaler" },
  { value: "other", label: "Other" },
] as const;

const fieldClass =
  "w-full rounded-[12px] border-[1.5px] border-line bg-white px-4 py-3 text-[14.5px] outline-none transition-colors focus:border-ink";

/**
 * B2B bulk-inquiry form (feature 15). Posts to the SHARED POST /api/leads with
 * `source_type: "b2b"` — same endpoint as the consumer popup (feature 9), but the
 * server reveals NO discount code and fires NO welcome send for this arm. On
 * success the API returns a plain `{ ok, message }` ack, which we show in place
 * of the form. Consent is the same honest, unticked DPDP checkbox as feature 9.
 */
export function B2bInquiryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [ack, setAck] = useState<string | null>(null);

  const submitted = ack !== null;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      source_type: "b2b" as const,
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      org_type: String(data.get("org_type") ?? ""),
      volume: String(data.get("volume") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      // DPDP: honest flag — an unticked box submits consent=false. The enquiry is
      // still captured; consent only governs follow-up marketing contact.
      consent,
      source_page: typeof window !== "undefined" ? window.location.pathname : undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
        return;
      }

      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; error?: string }
        | null;

      if (!res.ok || !json?.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setAck(json.message ?? "Thanks — we've received your enquiry. Our team will be in touch.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div
        role="status"
        className="rounded-card border border-line bg-paper-2 px-6 py-10 text-center"
      >
        <div
          aria-hidden
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lime/50 text-2xl"
        >
          ✓
        </div>
        <h3 className="font-[family-name:var(--font-d)] text-xl text-ink">
          Enquiry received
        </h3>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] text-grey">{ack}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-4">
        <div className="field">
          <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor="b2b-name">
            Your name
          </label>
          <input
            id="b2b-name"
            type="text"
            name="name"
            className={fieldClass}
            autoComplete="name"
            required
          />
        </div>
        <div className="field">
          <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor="b2b-org">
            Organisation type
          </label>
          <select
            id="b2b-org"
            name="org_type"
            defaultValue=""
            className={fieldClass}
            required
          >
            <option value="" disabled>
              Select one…
            </option>
            {ORG_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor="b2b-phone">
            Phone number
          </label>
          <input
            id="b2b-phone"
            type="tel"
            name="phone"
            className={fieldClass}
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder="10 digits"
            autoComplete="tel-national"
            required
          />
        </div>
        <div className="field">
          <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor="b2b-email">
            Work email
          </label>
          <input
            id="b2b-email"
            type="email"
            name="email"
            className={fieldClass}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="field">
        <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor="b2b-volume">
          Expected volume / interest
        </label>
        <input
          id="b2b-volume"
          type="text"
          name="volume"
          className={fieldClass}
          placeholder="e.g. 200 units/month across 3 stores"
          required
        />
      </div>

      <div className="field">
        <label className="mb-1.5 block text-[13px] font-medium text-ink" htmlFor="b2b-message">
          Anything else? <span className="text-grey">(optional)</span>
        </label>
        <textarea
          id="b2b-message"
          name="message"
          rows={4}
          maxLength={2000}
          className={`${fieldClass} resize-y`}
          placeholder="Products of interest, regions you serve, timelines…"
        />
      </div>

      {/* DPDP: UNTICKED by default. Submitting without it still captures the
          enquiry (consent_whatsapp=false); it only gates marketing follow-up. */}
      <label className="consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        Keep me updated about wholesale offers and product information on WhatsApp
        &amp; email. I agree to the <u>Privacy Policy</u>.
      </label>

      {error ? (
        <p role="alert" className="mb-3 text-[13px] text-[#b42318]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary w-full justify-center"
        disabled={submitting}
      >
        {submitting ? "Sending…" : "Submit enquiry →"}
      </button>
    </form>
  );
}
