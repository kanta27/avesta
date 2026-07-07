"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";

const SESSION_SEEN = "av_lead_seen"; // shown once this session — don't re-fire
const LOCAL_SUPPRESS = "av_lead_suppress_until"; // epoch ms; auto-show paused until then
const LOCAL_VIEWS = "av_pageviews";

/** Suppression window after a dismiss OR submit (spec: 7–14 days). */
const SUPPRESS_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

/** Custom event other components dispatch to open the popup on demand. */
export const OPEN_LEAD_EVENT = "openLeadPopup";

/** True while the visitor is anywhere in the checkout flow — NEVER pop here. */
function isCheckoutPath(pathname: string | null): boolean {
  return !!pathname && pathname.startsWith("/checkout");
}

/** Auto-show is paused while inside the active suppression window. */
function isSuppressed(): boolean {
  const until = Number(localStorage.getItem(LOCAL_SUPPRESS) ?? "0");
  return Number.isFinite(until) && Date.now() < until;
}

/** Start the suppression window — called on BOTH dismiss and submit. */
function suppress(): void {
  localStorage.setItem(LOCAL_SUPPRESS, String(Date.now() + SUPPRESS_MS));
}

/**
 * Lead-capture popup — reference `#leadPop` visuals (`.lead-pop` / `.lp-*`),
 * our capture flow: the existing trigger/suppression rules (dwell, scroll
 * depth, exit intent, returning visitor; once per session; 10-day suppression;
 * never during checkout) and the real /api/leads popup arm — which requires
 * name + phone + email and an explicit DPDP consent checkbox, so the form
 * carries those two extra fields over the reference's email-only mock.
 */
export function LeadPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null); // revealed on success
  const [consent, setConsent] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);

  const submitted = code !== null;
  const inCheckout = isCheckoutPath(pathname);

  // Mount: count the page-view and arm the auto-triggers.
  //
  // HARD RULES (spec + CLAUDE.md):
  //   - NEVER fire on load — every trigger is delayed/interaction-gated below.
  //   - NEVER during checkout — when on a /checkout* route we arm nothing and
  //     ignore manual opens, so the popup cannot interrupt a purchase.
  useEffect(() => {
    if (inCheckout) return;

    const views = Number(localStorage.getItem(LOCAL_VIEWS) ?? "0") + 1;
    localStorage.setItem(LOCAL_VIEWS, String(views));

    const onManual = () => setOpen(true);
    window.addEventListener(OPEN_LEAD_EVENT, onManual);

    if (isSuppressed()) {
      return () => window.removeEventListener(OPEN_LEAD_EVENT, onManual);
    }

    const fire = () => {
      if (sessionStorage.getItem(SESSION_SEEN) === "1" || isSuppressed()) return;
      sessionStorage.setItem(SESSION_SEEN, "1");
      setOpen(true);
    };

    // Whichever fires FIRST wins — none of these run at load time:
    // 1) ~10–15s dwell on the site.
    const timer = window.setTimeout(fire, 12_000);

    // 2) past ~45% scroll depth.
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.45) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 3) exit-intent (desktop: pointer leaves toward the top of the viewport).
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) fire();
    };
    document.addEventListener("mouseout", onMouseOut);

    // 4) returning visitor (2nd+ page-view) — short delay so it's never on load.
    let returningTimer = 0;
    if (views >= 2) returningTimer = window.setTimeout(fire, 1500);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(returningTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener(OPEN_LEAD_EVENT, onManual);
    };
  }, [inCheckout]);

  // Focus management, body-scroll lock, and Escape-to-close while open.
  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      (lastFocused.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    sessionStorage.setItem(SESSION_SEEN, "1");
    suppress();
    setOpen(false);
  }

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      consent,
      source_page: window.location.pathname,
      source_type: "popup" as const,
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
        | { code?: string; error?: string }
        | null;

      if (!res.ok || !json?.code) {
        setError(json?.error ?? "Something went wrong. Please try again.");
        return;
      }

      sessionStorage.setItem(SESSION_SEEN, "1");
      suppress();
      setCode(json.code);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`lead-pop${open ? " open" : ""}`}
      role="dialog"
      aria-label="Welcome offer"
      aria-hidden={!open}
    >
      <div className="lp-bg" onClick={close} />
      <div className="lp-card" ref={dialogRef} tabIndex={-1}>
        <div className="lp-top">
          <button className="lp-close" onClick={close} aria-label="Close">
            ×
          </button>
          <div className="lp-off">10% OFF</div>
          <p>your first Avesta Wellbeing order</p>
        </div>
        <div className="lp-body">
          {submitted ? (
            <div className="lp-success">
              <h3>You&apos;re in! 🎉</h3>
              <p>Use this code at checkout for 10% off your first order:</p>
              <div className="lp-code">{code}</div>
              {consent ? (
                <p style={{ fontSize: 13 }}>
                  We&apos;ll also send it to your WhatsApp &amp; email.
                </p>
              ) : null}
              <a
                className="btn brass"
                style={{ width: "100%", justifyContent: "center" }}
                href="/#shop"
                onClick={() => setOpen(false)}
              >
                Start shopping
              </a>
            </div>
          ) : (
            <form onSubmit={submitLead}>
              <h3>Join the wellbeing list</h3>
              <p>
                Get your code, early access to new launches, and science-backed
                health tips. No spam — unsubscribe anytime.
              </p>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                aria-label="Your name"
                autoComplete="name"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone number (10 digits)"
                aria-label="Phone number, 10 digits"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                autoComplete="tel-national"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                aria-label="Email address"
                autoComplete="email"
                required
              />
              {/* DPDP: UNTICKED by default. Submitting without it still captures
                  the lead (consent_whatsapp=false) and reveals the code. */}
              <label className="consent" style={{ textAlign: "left" }}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Send me offers &amp; health tips on WhatsApp. I agree to the{" "}
                  <u>Privacy Policy</u>.
                </span>
              </label>
              {error ? (
                <p role="alert" style={{ color: "#c0392b", fontSize: 13, margin: "0 0 12px" }}>
                  {error}
                </p>
              ) : null}
              <button className="btn brass" type="submit" disabled={submitting}>
                {submitting ? "Getting your code…" : "Get my 10% code"}
              </button>
              <div className="lp-fine">
                By signing up you agree to our privacy policy.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
