"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { formatPaiseINR } from "@/lib/format";
import { useCart } from "@/lib/cart/store";
import { PRODUCT_PLACEHOLDER } from "@/lib/products/placeholder";
import { defaultTierIndex, type ProductListItem } from "@/lib/products/types";
import { QUIZ_QUESTIONS } from "@/lib/quiz/questions";
import { recommendProduct, type QuizAnswers } from "@/lib/quiz/recommend";

/**
 * Reference quiz band (`.quiz` navy section, `.q-*` markup) running OUR
 * QuizFlow logic: the shared 5 concern-first questions and the
 * `recommendProduct` matcher over the live catalog. The result's add-to-cart
 * goes through the real cart store (default pack tier). Lead capture with the
 * 10% code stays on /quiz — this band is the fast path.
 */
export function HomeQuiz({ products }: { products: ProductListItem[] }) {
  const addProduct = useCart((s) => s.addProduct);
  const total = QUIZ_QUESTIONS.length;
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const recommendation = useMemo(
    () => (done ? recommendProduct(answers, products) : null),
    [done, answers, products],
  );

  function choose(questionId: string, optionId: string) {
    setAnswers((a) => ({ ...a, [questionId]: optionId }));
    if (step + 1 < total) setStep(step + 1);
    else setDone(true);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  const product = recommendation?.product ?? null;
  const tier = product ? product.packTiers[defaultTierIndex(product.packTiers)] : null;

  return (
    <>
      <span className="anchor" id="quiz"></span>
      <section className="section quiz">
        <div className="wrap reveal">
          <span className="eyebrow">60-second check</span>
          <h2>Not sure where to start?</h2>
          <p className="q-sub">
            Answer two quick questions and we&apos;ll match you to the right
            Avesta routine for your goal.
          </p>
          <div id="quizStage">
            {!done ? (
              <div className="q-step">
                <div className="q-progress">
                  Step {step + 1} of {total}
                </div>
                <div className="q-q">{QUIZ_QUESTIONS[step].prompt}</div>
                <div className="q-opts">
                  {QUIZ_QUESTIONS[step].options.map((opt) => (
                    <button
                      key={opt.id}
                      className="q-opt"
                      onClick={() => choose(QUIZ_QUESTIONS[step].id, opt.id)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : product ? (
              <div className="q-result">
                <div
                  className="qr-img"
                  style={
                    product.images[0]
                      ? { backgroundImage: `url('${product.images[0].url}')` }
                      : {
                          background: PRODUCT_PLACEHOLDER[product.type].background,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 48,
                        }
                  }
                >
                  {product.images[0] ? null : (
                    <span aria-hidden>{PRODUCT_PLACEHOLDER[product.type].emoji}</span>
                  )}
                </div>
                <div>
                  <div className="q-progress">Your match</div>
                  <h3>{product.name}</h3>
                  <p>
                    {product.tagline ??
                      `Supports ${recommendation?.primaryConcernLabel ?? "your goal"}.`}
                  </p>
                  <button
                    className="btn brass"
                    onClick={() => tier && addProduct(product.id, tier.key)}
                  >
                    Add to cart{tier ? ` · ${formatPaiseINR(tier.price_paise)}` : ""}
                  </button>{" "}
                  <button
                    className="btn ghost on-dark"
                    style={{
                      borderColor: "rgba(255,255,255,.4)",
                      color: "#eef6fb",
                    }}
                    onClick={reset}
                  >
                    Retake
                  </button>
                </div>
              </div>
            ) : (
              <div className="q-result">
                <div>
                  <div className="q-progress">Your match</div>
                  <h3>Let&apos;s find your fit</h3>
                  <p>Browse the range to pick the formula that suits your routine.</p>
                  <Link className="btn brass" href="/shop">
                    Browse the shop
                  </Link>{" "}
                  <button
                    className="btn ghost on-dark"
                    style={{
                      borderColor: "rgba(255,255,255,.4)",
                      color: "#eef6fb",
                    }}
                    onClick={reset}
                  >
                    Retake
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
