"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

import type { ProductListItem } from "@/lib/products/types";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import {
  recommendProduct,
  type QuizAnswers,
  type QuizRecommendation,
} from "@/lib/quiz/recommend";

/**
 * The 60-second health quiz (feature 20). Three phases in one island:
 *   1. Questions — 5 concern-first steps with a progress indicator.
 *   2. Result — the matched product (links to its PDP) + the 10%-off offer +
 *      contact capture with an explicit, UNTICKED WhatsApp-consent checkbox.
 *   3. Code reveal — popup-style success once the lead is captured.
 *
 * The recommendation is derived client-side from `product.concerns` (pure
 * `recommendProduct`) so the result is instant; the same `recommended_product_id`
 * is sent to `/api/leads` for attribution. COMPLIANCE: structure/function copy
 * only; the consent box starts unticked (DPDP).
 */
export function QuizFlow({ products }: { products: ProductListItem[] }) {
  const total = QUIZ_QUESTIONS.length;
  const [step, setStep] = useState(0); // 0..total-1 question, then `done`
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  // Lead-capture state (result screen).
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null); // revealed on success

  // Derive the recommendation once the quiz is complete.
  const recommendation: QuizRecommendation | null = useMemo(
    () => (done ? recommendProduct(answers, products) : null),
    [done, answers, products],
  );

  function choose(questionId: string, optionId: string) {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function back() {
    setError(null);
    if (done) {
      setDone(false);
      return;
    }
    if (step > 0) setStep(step - 1);
  }

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !recommendation) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      source_type: "quiz" as const,
      name: String(data.get("name") ?? "").trim() || undefined,
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      // DPDP: honest flag — an unticked box submits consent=false.
      consent,
      source_page: window.location.pathname,
      // Captured verbatim for the admin Leads module.
      quiz_answers: QUIZ_QUESTIONS.map((q) => ({
        question: q.id,
        option: answers[q.id],
      })).filter((a) => a.option),
      recommended_product_id: recommendation.product?.id,
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
      setCode(json.code);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Phase 3: code revealed -------------------------------------------------
  if (code) {
    return (
      <div className="quiz-card" role="status">
        <div className="quiz-eyebrow">You&apos;re in 🎉</div>
        <h1 className="quiz-title">Your 10% code is ready</h1>
        <p className="quiz-lede">
          Use code{" "}
          <b style={{ fontFamily: "var(--font-m)", letterSpacing: "0.5px" }}>{code}</b>{" "}
          at checkout for 10% off your first order.
        </p>
        {consent ? (
          <p className="quiz-fine">We&apos;ll also send it to your email{" "}
            and WhatsApp.</p>
        ) : (
          <p className="quiz-fine">We&apos;ve sent it to your email too.</p>
        )}
        {recommendation?.product ? (
          <Link
            href={`/shop/${recommendation.product.slug}`}
            className="btn btn-lime"
            style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
          >
            Shop {recommendation.product.name} →
          </Link>
        ) : (
          <Link
            href="/shop"
            className="btn btn-lime"
            style={{ width: "100%", justifyContent: "center", marginTop: 18 }}
          >
            Browse the shop →
          </Link>
        )}
      </div>
    );
  }

  // ---- Phase 2: result + capture ---------------------------------------------
  if (done && recommendation) {
    const { product, primaryConcernLabel, fallback } = recommendation;
    return (
      <div className="quiz-card">
        <button type="button" className="quiz-back" onClick={back}>
          ← Back
        </button>
        <div className="quiz-eyebrow">Your match · supports {primaryConcernLabel}</div>

        {product ? (
          <>
            <h1 className="quiz-title">{product.name}</h1>
            {product.tagline ? (
              <p className="quiz-lede">{product.tagline}</p>
            ) : null}
            {fallback ? (
              <p className="quiz-fine">
                A popular all-rounder to start with — explore the full range any
                time.
              </p>
            ) : null}
            <Link href={`/shop/${product.slug}`} className="quiz-pdp-link">
              View product details →
            </Link>
          </>
        ) : (
          <>
            <h1 className="quiz-title">Let&apos;s find your fit</h1>
            <p className="quiz-lede">
              Browse the range to pick the formula that suits your routine — your
              10% code still applies.
            </p>
          </>
        )}

        <div className="quiz-offer">
          <span className="quiz-offer-badge">10% OFF</span>
          <span>your first order — enter your details to unlock the code.</span>
        </div>

        <form onSubmit={submitLead}>
          <div className="field">
            <input
              type="text"
              name="name"
              placeholder="Your name (optional)"
              aria-label="Your name"
              autoComplete="name"
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
          <div className="field">
            <input
              type="tel"
              name="phone"
              placeholder="Phone number (optional, 10 digits)"
              aria-label="Phone number, 10 digits, optional"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              autoComplete="tel-national"
            />
          </div>
          {/* DPDP: UNTICKED by default. Submitting without it still captures the
              lead (consent_whatsapp=false) and reveals the code. */}
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            Send me offers &amp; health tips on WhatsApp. I agree to the{" "}
            <u>Privacy Policy</u>.
          </label>
          {error ? (
            <p role="alert" style={{ color: "#b42318", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn btn-lime"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={submitting}
          >
            {submitting ? "Getting your code…" : "Reveal my 10% code →"}
          </button>
        </form>
      </div>
    );
  }

  // ---- Phase 1: questions -----------------------------------------------------
  const question = QUIZ_QUESTIONS[step];
  const pct = Math.round((step / total) * 100);
  return (
    <div className="quiz-card">
      <div className="quiz-progress" aria-hidden>
        <div className="quiz-progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="quiz-step-meta">
        <span>
          Question {step + 1} of {total}
        </span>
        {step > 0 ? (
          <button type="button" className="quiz-back" onClick={back}>
            ← Back
          </button>
        ) : null}
      </div>
      <h1 className="quiz-title">{question.prompt}</h1>
      <div className="quiz-options">
        {question.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`quiz-option${answers[question.id] === opt.id ? " is-selected" : ""}`}
            onClick={() => choose(question.id, opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
