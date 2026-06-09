"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const SESSION_SEEN = "av_lead_seen"; // dismissed/opened this session
const LOCAL_DONE = "av_lead_done"; // submitted — never auto-show again
const LOCAL_VIEWS = "av_pageviews";

/** Custom event other components dispatch to open the popup on demand. */
export const OPEN_LEAD_EVENT = "openLeadPopup";

export function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<Element | null>(null);

  // Mount: count the page-view and arm the auto-triggers.
  useEffect(() => {
    const done = localStorage.getItem(LOCAL_DONE) === "1";

    const views = Number(localStorage.getItem(LOCAL_VIEWS) ?? "0") + 1;
    localStorage.setItem(LOCAL_VIEWS, String(views));

    // Manual open (e.g. the quiz CTA) — always allowed unless already done.
    const onManual = () => {
      if (localStorage.getItem(LOCAL_DONE) === "1") return;
      setOpen(true);
    };
    window.addEventListener(OPEN_LEAD_EVENT, onManual);

    if (done) {
      return () => window.removeEventListener(OPEN_LEAD_EVENT, onManual);
    }

    const fire = () => {
      if (
        localStorage.getItem(LOCAL_DONE) === "1" ||
        sessionStorage.getItem(SESSION_SEEN) === "1"
      ) {
        return;
      }
      sessionStorage.setItem(SESSION_SEEN, "1");
      setOpen(true);
    };

    // 1) after 8s
    const timer = window.setTimeout(fire, 8000);

    // 2) past 45% scroll depth
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.45) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 3) exit-intent (pointer leaves toward the top of the viewport)
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) fire();
    };
    document.addEventListener("mouseout", onMouseOut);

    // 4) returning visitor (2nd+ page-view)
    let returningTimer = 0;
    if (views >= 2) returningTimer = window.setTimeout(fire, 1500);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(returningTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener(OPEN_LEAD_EVENT, onManual);
    };
  }, []);

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
  }, [open]);

  function close() {
    sessionStorage.setItem(SESSION_SEEN, "1");
    setOpen(false);
  }

  function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO(feature 9): POST to /api/leads (Supabase `leads` table) with
    // consent_whatsapp + consent_at. Stubbed for the A1 port.
    localStorage.setItem(LOCAL_DONE, "1");
    sessionStorage.setItem(SESSION_SEEN, "1");
    setSubmitted(true);
  }

  return (
    <div
      className={`overlay${open ? " show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-popup-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="pop-left">
          <div className="off" aria-hidden>
            10% OFF
          </div>
          <h3>your first order</h3>
          <p>
            Join the Avesta Health circle — get your code instantly on WhatsApp,
            plus science-backed health tips.
          </p>
        </div>
        <div className="pop-right">
          <button className="pop-close" onClick={close} aria-label="Close">
            ✕
          </button>
          {submitted ? (
            <div>
              <h3
                id="lead-popup-title"
                style={{ fontFamily: "var(--font-d)", fontSize: 20 }}
              >
                You&apos;re in! 🎉
              </h3>
              <p style={{ marginTop: 12, color: "var(--grey)", fontSize: 14.5 }}>
                Your code <b>AVESTA10</b> is on its way via WhatsApp &amp; email.
              </p>
              <div className="pop-note">
                Demo: production stores this lead in Supabase with a consent
                flag (feature 9).
              </div>
            </div>
          ) : (
            <form onSubmit={submitLead}>
              <h3
                id="lead-popup-title"
                style={{ fontFamily: "var(--font-d)", fontSize: 20, marginBottom: 18 }}
              >
                Unlock your code
              </h3>
              <div className="field">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  aria-label="Your name"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="field">
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
              </div>
              <div className="field">
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  aria-label="Email address"
                  autoComplete="email"
                  required
                />
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                Send me offers &amp; health tips on WhatsApp. I agree to the{" "}
                <u>Privacy Policy</u>.
              </label>
              <button
                type="submit"
                className="btn btn-lime"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={!consent}
              >
                Get my 10% code →
              </button>
              <div className="pop-note">
                NO SPAM. ONE CODE, REAL SCIENCE, EASY OPT-OUT.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
