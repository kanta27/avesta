"use client";

import { useState, type FormEvent } from "react";

/**
 * Reference contact section — 1:1 markup/copy, wired to the real /api/leads
 * endpoint (b2b arm — the only one carrying a free-text message) instead of
 * the reference's mailto: handoff. The lead schema requires a phone, so the
 * form carries one extra .field over the reference; the selected interest is
 * stored as the b2b `volume` line so it lands in the admin Leads module.
 */
const INTERESTS = [
  "A personalized health plan (AvestaLife®)",
  "Genetic diagnostics (AvestaScan® / CALiBRx®)",
  "Nutrition & functional foods",
  "Stocking / retail partnership",
  "Licensing, JV or co-development",
  "Investor relations",
] as const;

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setError(null);
    setStatus("submitting");

    const data = new FormData(e.currentTarget);
    const payload = {
      source_type: "b2b" as const,
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      org_type: "other" as const,
      volume: String(data.get("interest") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      consent: false,
      source_page: window.location.pathname,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
        setStatus("idle");
        return;
      }
      const json = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      if (!res.ok) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <>
      <span className="anchor" id="contact"></span>
      <section className="section">
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-info reveal">
              <span className="eyebrow">Get in touch</span>
              <h2>Start your wellbeing journey.</h2>
              <p className="lead">
                Tell us what you&apos;re looking for and our team will get back
                to you. For consumers, clinicians, retailers and strategic
                partners alike.
              </p>
              <ul className="ci-list">
                <li>
                  <span className="ci-k">Headquarters</span>
                  <span className="ci-v">Bangalore, Karnataka, India</span>
                </li>
                <li>
                  <span className="ci-k">Email</span>
                  <span className="ci-v">
                    <a href="mailto:hello@avestawellbeing.com">
                      hello@avestawellbeing.com
                    </a>
                  </span>
                </li>
                <li>
                  <span className="ci-k">Enquiries</span>
                  <span className="ci-v">Consumer · Clinical · Licensing &amp; JV</span>
                </li>
              </ul>
            </div>
            <div className="form reveal">
              {status === "done" ? (
                <div role="status">
                  <h3 style={{ marginBottom: 10 }}>Thank you — enquiry sent.</h3>
                  <p style={{ color: "var(--muted)", margin: 0 }}>
                    Our team will get back to you shortly at the email you
                    provided.
                  </p>
                </div>
              ) : (
                <form onSubmit={send} noValidate>
                  <div className="field">
                    <label htmlFor="cf-name">Full name</label>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="cf-email">Email</label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  {/* Not in the reference: required by the leads schema. */}
                  <div className="field">
                    <label htmlFor="cf-phone">Phone</label>
                    <input
                      id="cf-phone"
                      name="phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      autoComplete="tel-national"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="cf-interest">I&apos;m interested in</label>
                    <select id="cf-interest" name="interest">
                      {INTERESTS.map((i) => (
                        <option key={i}>{i}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="cf-msg">Message</label>
                    <textarea
                      id="cf-msg"
                      name="message"
                      placeholder="A few details about what you need…"
                    ></textarea>
                  </div>
                  {error ? (
                    <p role="alert" style={{ color: "#c0392b", fontSize: 13.5 }}>
                      {error}
                    </p>
                  ) : null}
                  <button
                    className="btn brass"
                    id="cf-send"
                    type="submit"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? "Sending…" : "Send enquiry"}{" "}
                    <span className="arr">→</span>
                  </button>
                  <p className="fine">
                    We&apos;ll reply from hello@avestawellbeing.com · Strictly
                    confidential
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
