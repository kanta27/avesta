"use client";

import { useState, type FormEvent } from "react";

/**
 * Footer newsletter capture. Posts to the SAME `/api/leads` endpoint as the lead
 * popup, tagged `source_type='newsletter'` so every lead source lands in one
 * table (feature 9). Email-only: no phone, and `consent=false` because there's no
 * WhatsApp opt-in here — the cron follow-up only targets consented `popup` leads,
 * so newsletter signups are cleanly excluded from that nudge.
 */
export function NewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          consent: false,
          source_type: "newsletter",
          source_page: window.location.pathname,
        }),
      });

      if (res.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
        setStatus("error");
        return;
      }

      const json = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!res.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="f-news">
      <h4>Stay in the loop</h4>
      {status === "done" ? (
        <p className="f-news-done">Thanks — you&apos;re subscribed. 🌿</p>
      ) : (
        <>
          <p>Science-backed health tips &amp; member offers. No spam.</p>
          <form className="f-news-row" onSubmit={subscribe} noValidate>
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              aria-label="Email address for newsletter"
              autoComplete="email"
            />
            <button
              type="submit"
              className="btn btn-lime"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "…" : "Subscribe"}
            </button>
          </form>
          {error ? (
            <p className="f-news-err" role="alert">
              {error}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
